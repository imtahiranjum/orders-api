import { registerAs } from '@nestjs/config';
import {
  IAuthentication,
  IDatabase,
  IRedis,
  IServer,
} from './env.config.interface';

export const server = registerAs(
  'server',
  (): IServer => ({
    port: parseInt(process.env.PORT!),
    env: process.env.NODE_ENV!,
    allowedClients: process.env
      .ALLOWED_ORIGINS!?.split(',')
      .map((val: string) => val.trim()),
  }),
);

export const authentication = registerAs(
  'authentication',
  (): IAuthentication => ({
    resetPasswordRoute: process.env.RESET_PASSWORD_ROUTE!,
    jwtSecret: process.env.JWT_SECRET!,
    expiry: process.env.ACCESS_TOKEN_EXPIRY!,
    refreshJWTSecret: process.env.JWT_REFRESH_SECRET!,
    refreshExpiry: process.env.REFRESH_TOKEN_EXPIRY!,
    resetPasswordSecret: process.env.RESET_PASSWORD_TOKEN_SECRET!,
    resetPasswordExpiry: process.env.RESET_PASSWORD_TOKEN_EXPIRY!,
  }),
);

export const database = registerAs(
  'database',
  (): IDatabase => ({
    host: process.env.DATABASE_HOST!,
    port: parseInt(process.env.DATABASE_PORT!),
    name: process.env.DATABASE!,
    username: process.env.DATABASE_USERNAME!,
    password: process.env.DATABASE_PASSWORD!,
    sync: process.env.DATABASE_SYNC === 'true',
    ssl: process.env.DATABASE_SSL === 'true',
  }),
);

export const redis = registerAs(
  'redis',
  (): IRedis => ({
    host: process.env.REDIS_HOST!,
    port: parseInt(process.env.REDIS_PORT!),
    username: process.env.REDIS_USER!,
    password: process.env.REDIS_PASSWORD!,
  }),
);
