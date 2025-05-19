import "dotenv/config";

export const PORT = 3002;

export const RESEND_APIKEY = process.env.RESEND_APIKEY;

export const GMAIL_USER = process.env.GMAIL_USER || "";

export const GMAIL_PASSWORD = process.env.GMAIL_PASSWORD;

export const SENDGRID_USERNAME = process.env.SENDGRID_USERNAME;

export const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || "";