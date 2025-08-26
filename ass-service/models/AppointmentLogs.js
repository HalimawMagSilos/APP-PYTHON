import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const AppointmentLog = sequelize.define('AppointmentLog', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  appointment_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  action: { type: DataTypes.STRING(255), allowNull: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'appointment_logs',
  timestamps: false,
  underscored: true
});

export default AppointmentLog;
