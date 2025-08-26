import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const AppointmentStatus = sequelize.define('AppointmentStatus', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  code: { type: DataTypes.STRING(30), allowNull: false, unique: true },
  name: { type: DataTypes.STRING(60), allowNull: false }
}, {
  tableName: 'appointment_statuses',
  underscored: true,
  timestamps: false
});

export default AppointmentStatus;
