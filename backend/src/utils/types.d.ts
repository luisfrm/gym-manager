import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";
import { Types } from "mongoose";

type Role = "admin" | "employee";

interface AppRequest extends Request {
  user: {
    userId: string;
    email: string;
    username: string;
    role: Role;
  };
}

export interface Client {
  _id: Types.ObjectId;
  firstname: string;
  lastname: string;
  cedula: string;
  email: string;
  phone: string;
  address: string;
  expiredDate: string | Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Payment {
  _id: string;
  client: Client | string;
  clientCedula: string;
  amount: string;
  date: string;
  service: string;
  description?: string;
  paymentMethod: string;
  paymentReference?: string;
  paymentStatus: "pending" | "paid" | "failed";
  currency: "USD" | "VES";
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PaymentPartial {
  client?: Client | string;
  clientCedula?: string;
  amount?: string;
  date?: string;
  service?: string;
  description?: string;
  paymentMethod?: string;
  paymentReference?: string;
  paymentStatus?: "pending" | "paid" | "failed";
  currency?: "USD" | "VES";
}

export interface ClientPartial {
  firstname?: string;
  lastname?: string;
  cedula?: string;
  email?: string;
  phone?: string;
  address?: string;
  expiredDate?: string | Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TokenPayload extends JwtPayload {
  userId: string;
  role: Role;
  email: string;
  username: string;
  tokenExpiration: Date;
}
