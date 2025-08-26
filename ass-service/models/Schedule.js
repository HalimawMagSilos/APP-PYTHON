import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Schedule = sequelize.define('Schedule', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  doctor_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  day_of_week: { type: DataTypes.INTEGER, allowNull: false }, // 0-6
  start_time: { type: DataTypes.TIME, allowNull: false },
  end_time: { type: DataTypes.TIME, allowNull: false },
  slot_duration_min: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 15 }
}, {
  tableName: 'schedules',
  underscored: true
});

export default Schedule;
