import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { Types } from 'mongoose';

interface AppRequest extends Request {
  user: {
    userId: string;
    email: string;
    username: string;
    role: string;
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

export interface TokenPayload extends JwtPayload {
  userId: string;
  role: string;
  email: string;
  username: string;
  tokenExpiration: Date;
}
