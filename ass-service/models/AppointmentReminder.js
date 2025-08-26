import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const AppointmentReminder = sequelize.define('AppointmentReminder', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  appointment_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  reminder_time: { type: DataTypes.DATE, allowNull: false },
  method: { type: DataTypes.ENUM('SMS','EMAIL','PUSH'), allowNull: false, defaultValue: 'SMS' }
}, {
  tableName: 'appointment_reminders',
  underscored: true,
  timestamps: false
});

export default AppointmentReminder;
