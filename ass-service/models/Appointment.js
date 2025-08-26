import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Appointment = sequelize.define('Appointment', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  external_patient_id: { type: DataTypes.STRING(128), allowNull: true }, // SPRS ID
  doctor_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  appointment_date: { type: DataTypes.DATEONLY, allowNull: false },
  start_time: { type: DataTypes.TIME, allowNull: false },
  end_time: { type: DataTypes.TIME },
  status_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false }
}, {
  tableName: 'appointments',
  underscored: true
});

export default Appointment;
