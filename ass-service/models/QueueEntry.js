import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const QueueEntry = sequelize.define('QueueEntry', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  external_patient_id: { type: DataTypes.STRING(128), allowNull: false },
  doctor_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  appointment_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
  queue_type: { type: DataTypes.ENUM('EMERGENCY', 'BOOKED', 'WALKIN'), allowNull: false },
  priority: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false }, // 1 highest
  arrival_time: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
}, {
  tableName: 'queue_entries',
  underscored: true
});

export default QueueEntry;
