import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
dotenv.config();

const {
  DB_HOST = 'localhost',
  DB_PORT = '3306',
  DB_NAME = 'ass_db',
  DB_USER = 'root',
  DB_PASS = '',
} = process.env;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: Number(DB_PORT),
  dialect: 'mysql',
  logging: false,
  timezone: '+08:00',
  define: {
    underscored: true,
    timestamps: true
  }
});

export default sequelize;
