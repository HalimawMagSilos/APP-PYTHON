import dotenv from 'dotenv';
dotenv.config();
import models from '../models/index.js';
const { sequelize, Doctor, Schedule, AppointmentStatus, Appointment, AppointmentReminder, QueueEntry } = models;

async function main() {
  try {
    console.log('Seeding: disabling FK checks');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

    console.log('Syncing DB (force: true)');
    await sequelize.sync({ force: true });

    console.log('Re-enabling FK checks');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    // statuses
    const [booked] = await AppointmentStatus.findOrCreate({ where: { code: 'BOOKED' }, defaults: { name: 'Booked' } });
    await AppointmentStatus.findOrCreate({ where: { code: 'CANCELLED' }, defaults: { name: 'Cancelled' } });
    await AppointmentStatus.findOrCreate({ where: { code: 'COMPLETED' }, defaults: { name: 'Completed' } });

    // doctors
    const [d1] = await Doctor.findOrCreate({ where: { first_name: 'Ana', last_name: 'Reyes' }, defaults: { specialty: 'Internal Medicine', room: '101' } });
    const [d2] = await Doctor.findOrCreate({ where: { first_name: 'Luis', last_name: 'Cruz' }, defaults: { specialty: 'Pediatrics', room: '202' } });

    // schedules
    await Schedule.findOrCreate({ where: { doctor_id: d1.id, day_of_week: 1, start_time: '09:00:00', end_time: '12:00:00' }, defaults: { slot_duration_min: 20 } });
    await Schedule.findOrCreate({ where: { doctor_id: d2.id, day_of_week: 2, start_time: '13:00:00', end_time: '17:00:00' }, defaults: { slot_duration_min: 15 } });

    // appointments
    const today = new Date().toISOString().slice(0,10);
    const a1 = await Appointment.create({ external_patient_id: 'SPRS-1001', doctor_id: d1.id, appointment_date: today, start_time: '09:00:00', end_time: '09:20:00', status_id: booked.id });
    const a2 = await Appointment.create({ external_patient_id: 'SPRS-1002', doctor_id: d1.id, appointment_date: today, start_time: '09:20:00', end_time: '09:40:00', status_id: booked.id });

    // reminders
    await AppointmentReminder.create({ appointment_id: a1.id, reminder_time: new Date(Date.now() + 3600*1000) }); // 1h later
    await AppointmentReminder.create({ appointment_id: a2.id, reminder_time: new Date(Date.now() + 7200*1000) });

    // queue: emergency -> booked a1 -> booked a2 -> walkin for d2
    await QueueEntry.create({ external_patient_id: 'SPRS-2001', doctor_id: d1.id, appointment_id: null, queue_type: 'EMERGENCY', priority: 1, arrival_time: new Date() });
    await QueueEntry.create({ external_patient_id: 'SPRS-1001', doctor_id: d1.id, appointment_id: a1.id, queue_type: 'BOOKED', priority: 2, arrival_time: new Date(Date.now()+1000) });
    await QueueEntry.create({ external_patient_id: 'SPRS-1002', doctor_id: d1.id, appointment_id: a2.id, queue_type: 'BOOKED', priority: 2, arrival_time: new Date(Date.now()+2000) });
    await QueueEntry.create({ external_patient_id: 'SPRS-3001', doctor_id: d2.id, appointment_id: null, queue_type: 'WALKIN', priority: 3, arrival_time: new Date(Date.now()+3000) });

    console.log('Seed complete');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

main();
