import axios from 'axios';
import { literal } from 'sequelize';
import models from '../models/index.js';
import {
  createAppointmentSchema,
  updateAppointmentSchema,
  listAppointmentsSchema
} from '../validators/appointmentValidator.js';

const { Appointment, Doctor, AppointmentStatus, QueueEntry } = models;

const SPRS_BASE = process.env.SPRS_BASE_URL || '';
const TOCS_BASE = process.env.TOCS_BASE_URL || '';
const ENABLE_TOCS = (process.env.ENABLE_TOCS_NOTIFICATIONS || 'false').toLowerCase() === 'true';

async function ensurePatientExists(patientId) {
  // If SPRS is not configured, accept any patientId
  if (!SPRS_BASE) {
    return { ok: true, data: { id: patientId, source: 'manual' } };
  }

  try {
    const url = `${SPRS_BASE.replace(/\/$/, '')}/patients/${encodeURIComponent(patientId)}`;
    const r = await axios.get(url, { timeout: 3000 });
    return { ok: true, data: r.data, source: 'sprs' };
  } catch (err) {
    // If SPRS responds with 404 → patient not found
    if (err.response && err.response.status === 404) {
      return { ok: false, status: 404, error: 'Patient not found in SPRS' };
    }

    // If SPRS is down or unreachable → allow manual patient ID
    console.warn(`SPRS unreachable, using manual patientId: ${patientId}`);
    return { ok: true, data: { id: patientId, source: 'manual' }, warning: 'SPRS unreachable' };
  }
}

async function notifyTocs(eventType, payload) {
  if (!ENABLE_TOCS || !TOCS_BASE) return;
  try {
    await axios.post(`${TOCS_BASE.replace(/\/$/,'')}/events`, { eventType, payload }, { timeout: 3000 });
  } catch (err) {
    console.warn('TOCS notify failed:', err.message);
  }
}

function overlapCondition(doctorId, appointmentDate, startTime, excludeId) {
  const add = "'00:15:00'"; // default slot
  const exclude = excludeId ? `AND id <> ${Number(excludeId)}` : '';
  return literal(`doctor_id = ${doctorId} AND appointment_date = '${appointmentDate}' ${exclude} AND (
    (TIME('${startTime}') < IFNULL(end_time, ADDTIME(start_time, ${add}))
     AND ADDTIME(TIME('${startTime}'), ${add}) > start_time)
  )`);
}

export const createAppointment = async (req, res, next) => {
  try {
    const { error, value } = createAppointmentSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    const { patientId, doctorId, appointmentDate, startTime, endTime, queueType } = value;

    const sprs = await ensurePatientExists(patientId);
    if (!sprs.ok) {
      if (sprs.status === 404) return res.status(404).json({ error: 'Patient not found in SPRS' });
      return res.status(sprs.status || 502).json({ error: sprs.error || 'SPRS unreachable' });
    }

    const doctor = await Doctor.findByPk(doctorId);
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });

    const conflict = await Appointment.findOne({ where: overlapCondition(doctorId, appointmentDate, startTime) });
    if (conflict) return res.status(409).json({ error: 'Time slot not available' });

    const booked = await AppointmentStatus.findOne({ where: { code: 'BOOKED' } });
    if (!booked) return res.status(500).json({ error: 'BOOKED status missing' });

    const appt = await Appointment.create({
      external_patient_id: String(patientId),
      doctor_id: doctorId,
      appointment_date: appointmentDate,
      start_time: startTime,
      end_time: endTime || null,
      status_id: booked.id
    });

    const qType = queueType || 'BOOKED';
    const priorityMap = { 'EMERGENCY': 1, 'BOOKED': 2, 'WALKIN': 3 };
    await QueueEntry.create({
      external_patient_id: String(patientId),
      doctor_id: doctorId,
      appointment_id: appt.id,
      queue_type: qType,
      priority: priorityMap[qType] || 2,
      arrival_time: new Date()
    });

    notifyTocs('appointment.created', appt);

    const created = await Appointment.findByPk(appt.id);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

export const updateAppointment = async (req, res, next) => {
  try {
    const { error, value } = updateAppointmentSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    const appt = await Appointment.findByPk(req.params.id);
    if (!appt) return res.status(404).json({ error: 'Appointment not found' });

    const { appointmentDate, startTime, endTime } = value;
    const conflict = await Appointment.findOne({ where: overlapCondition(appt.doctor_id, appointmentDate, startTime, appt.id) });
    if (conflict) return res.status(409).json({ error: 'New time slot not available' });

    appt.appointment_date = appointmentDate;
    appt.start_time = startTime;
    appt.end_time = endTime || null;
    await appt.save();

    notifyTocs('appointment.rescheduled', appt);

    res.json(appt);
  } catch (err) {
    next(err);
  }
};

export const deleteAppointment = async (req, res, next) => {
  try {
    const appt = await Appointment.findByPk(req.params.id);
    if (!appt) return res.status(404).json({ error: 'Appointment not found' });

    const cancelled = await AppointmentStatus.findOne({ where: { code: 'CANCELLED' } });
    if (cancelled) {
      appt.status_id = cancelled.id;
      await appt.save();
    }

    // remove queue entries associated
    await QueueEntry.destroy({ where: { appointment_id: appt.id } });

    notifyTocs('appointment.cancelled', appt);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const listAppointments = async (req, res, next) => {
  try {
    const { error, value } = listAppointmentsSchema.validate(req.query);
    if (error) return res.status(400).json({ error: error.message });

    const where = {};
    if (value.patientId) where.external_patient_id = String(value.patientId);
    if (value.doctorId) where.doctor_id = value.doctorId;
    if (value.date) where.appointment_date = value.date;

    const items = await Appointment.findAll({
      where,
      order: [['appointment_date','ASC'], ['start_time','ASC']]
    });
    res.json(items);
  } catch (err) {
    next(err);
  }
};
