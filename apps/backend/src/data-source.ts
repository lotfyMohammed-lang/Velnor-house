import { DataSource } from 'typeorm';
import { Project } from './entities/Project';
import { Task } from './entities/Task';
import { User } from './entities/User';
import { Perfume } from './entities/Perfume';
import { Order } from './entities/Order';
import { Admin } from './entities/Admin';
import { ReturnRequest } from './entities/ReturnRequest';
import { PromoCode } from './entities/PromoCode';
import { PromoUsage } from './entities/PromoUsage';
import { UserAddress } from './entities/UserAddress';
import { Setting } from './entities/Setting';
import { Notification } from './entities/Notification';

const isProduction = process.env.NODE_ENV === 'production';
const hasDatabaseUrl = !!process.env.DATABASE_URL;

export const AppDataSource = new DataSource({
  type: 'postgres',
  ...(hasDatabaseUrl
    ? {
        url: process.env.DATABASE_URL,
        ssl: isProduction
          ? {
              rejectUnauthorized: false,
            }
          : false,
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME || 'todolo',
        username: process.env.DB_USER || undefined,
        password: process.env.DB_PASSWORD || undefined,
        ssl: isProduction
          ? {
              rejectUnauthorized: false,
            }
          : false,
      }),
  synchronize: isProduction ? false : process.env.DB_SYNC === 'true',
  logging: process.env.DB_LOGGING === 'true',
  entities: [
    User,
    Project,
    Task,
    Perfume,
    Order,
    Admin,
    ReturnRequest,
    PromoCode,
    PromoUsage,
    UserAddress,
    Setting,
    Notification,
  ],
});