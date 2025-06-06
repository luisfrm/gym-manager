import "dotenv/config";

export const PORT = 3000;

export const MONGODB_URI = process.env.MONGODB_URI;

export const TOKEN_SECRET_JWT = process.env.TOKEN_SECRET_JWT;

export const JWT_EXPIRATION_TIME: number = parseInt(process.env.JWT_EXPIRATION_TIME || "600");

export const INITIAL_ADMIN_EMAIL = process.env.INITIAL_ADMIN_EMAIL;
export const INITIAL_ADMIN_PASSWORD = process.env.INITIAL_ADMIN_PASSWORD;
export const INITIAL_ADMIN_USERNAME = process.env.INITIAL_ADMIN_USERNAME;
export const INITIAL_ADMIN_NAME = process.env.INITIAL_ADMIN_NAME;

export enum RoleEnum {
  "admin" = "admin",
  "employee" = "employee",
}
