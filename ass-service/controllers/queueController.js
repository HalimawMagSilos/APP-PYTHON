import models from '../models/index.js';
const { QueueEntry, Doctor, Appointment } = models;

export const getQueue = async (req, res, next) => {
  try {
    const doctorId = req.query.doctorId ? Number(req.query.doctorId) : undefined;
    const date = req.query.date || new Date().toISOString().slice(0,10);

    const where = {};
    if (doctorId) where.doctor_id = doctorId;

    const entries = await QueueEntry.findAll({
      where,
      include: [
        { model: Doctor },
        { model: Appointment, required: false, where: { appointment_date: date } }
      ],
      order: [['priority','ASC'], ['arrival_time','ASC']]
    });

    const result = entries.map(q => ({
      id: q.id,
      queue_type: q.queue_type,
      priority: q.priority,
      arrival_time: q.arrival_time,
      external_patient_id: q.external_patient_id,
      doctor: q.Doctor ? { id: q.Doctor.id, name: `${q.Doctor.last_name}, ${q.Doctor.first_name}` } : null,
      appointment_id: q.appointment_id || null
    }));

    res.json(result);
  } catch (err) {
    next(err);
  }
};
