import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Doctor = sequelize.define('Doctor', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  first_name: { type: DataTypes.STRING(100), allowNull: false },
  last_name: { type: DataTypes.STRING(100), allowNull: false },
  specialty: { type: DataTypes.STRING(120) },
  room: { type: DataTypes.STRING(30) }
}, {
  tableName: 'doctors',
  underscored: true
});

export default Doctor;
