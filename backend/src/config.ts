import "dotenv/config";

export const PORT = 3000;

export const MONGODB_URI = process.env.MONGODB_URI;

export const TOKEN_SECRET_JWT = process.env.TOKEN_SECRET_JWT;

export const JWT_EXPIRATION_TIME = process.env.JWT_EXPIRATION_TIME || "1h";