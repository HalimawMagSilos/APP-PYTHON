import sequelize from '../config/db.js';
import Doctor from './Doctor.js';
import Schedule from './Schedule.js';
import AppointmentStatus from './AppointmentStatus.js';
import Appointment from './Appointment.js';
import AppointmentReminder from './AppointmentReminder.js';
import QueueEntry from './QueueEntry.js';
import AppointmentLogs from './AppointmentLogs.js';

// ---------------- Associations ---------------- //

// Doctor ↔ Schedule
Doctor.hasMany(Schedule, { foreignKey: 'doctor_id', onDelete: 'CASCADE' });
Schedule.belongsTo(Doctor, { foreignKey: 'doctor_id', onDelete: 'CASCADE' });

// Doctor ↔ Appointment
Doctor.hasMany(Appointment, { foreignKey: 'doctor_id', onDelete: 'CASCADE' });
Appointment.belongsTo(Doctor, { foreignKey: 'doctor_id', onDelete: 'CASCADE' });

// AppointmentStatus ↔ Appointment
AppointmentStatus.hasMany(Appointment, { foreignKey: 'status_id', onDelete: 'RESTRICT' });
Appointment.belongsTo(AppointmentStatus, { foreignKey: 'status_id', onDelete: 'RESTRICT' });

// Appointment ↔ AppointmentReminder
Appointment.hasMany(AppointmentReminder, { foreignKey: 'appointment_id', onDelete: 'CASCADE' });
AppointmentReminder.belongsTo(Appointment, { foreignKey: 'appointment_id', onDelete: 'CASCADE' });

// Appointment ↔ QueueEntry
Appointment.hasOne(QueueEntry, { foreignKey: 'appointment_id', onDelete: 'SET NULL' });
QueueEntry.belongsTo(Appointment, { foreignKey: 'appointment_id', onDelete: 'SET NULL' });

// Doctor ↔ QueueEntry
Doctor.hasMany(QueueEntry, { foreignKey: 'doctor_id', onDelete: 'CASCADE' });
QueueEntry.belongsTo(Doctor, { foreignKey: 'doctor_id', onDelete: 'CASCADE' });

// Appointment ↔ AppointmentLogs (NEW FIX)
Appointment.hasMany(AppointmentLogs, { foreignKey: 'appointment_id', onDelete: 'CASCADE' });
AppointmentLogs.belongsTo(Appointment, { foreignKey: 'appointment_id', onDelete: 'CASCADE' });

// ---------------- Models Export ---------------- //

const models = {
  sequelize,
  Doctor,
  Schedule,
  AppointmentStatus,
  Appointment,
  AppointmentReminder,
  QueueEntry,
  AppointmentLogs
};

// ---------------- Initialization ---------------- //

models.ensureInit = async () => {
  // sync without force by default; seed script uses force
  await sequelize.sync();

  // seed statuses if missing
  const count = await AppointmentStatus.count();
  if (count === 0) {
    await AppointmentStatus.bulkCreate([
      { code: 'BOOKED', name: 'Booked' },
      { code: 'CANCELLED', name: 'Cancelled' },
      { code: 'COMPLETED', name: 'Completed' }
    ]);
  }
};

export default models;
