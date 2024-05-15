import * as dotenv from 'dotenv';

dotenv.config();

export const db_host = process.env.DB_HOST;
export const db_port = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432;
export const db_name = process.env.DB_NAME;
export const db_user = process.env.DB_USER;
export const db_password = process.env.DB_PASSWORD;
export const JWT_SECRET = String(process.env.JWT_SECRET);
export const API_PORT = process.env.API_PORT ? parseInt(process.env.API_PORT, 10) : 3000;
