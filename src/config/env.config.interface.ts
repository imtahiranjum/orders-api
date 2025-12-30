export interface IServer {
  env: string;
  port: number;
  allowedClients: string[];
}

export interface IAuthentication {
  resetPasswordRoute: string;
  jwtSecret: string;
  expiry: string;
  refreshJWTSecret: string;
  refreshExpiry: string;
  resetPasswordSecret: string;
  resetPasswordExpiry: string;
}

export interface IDatabase {
  host: string;
  port: number;
  name: string;
  username: string;
  password: string;
  sync: boolean;
  ssl: boolean;
}

export interface IRedis {
  host: string;
  port: number;
  username: string;
  password: string;
}