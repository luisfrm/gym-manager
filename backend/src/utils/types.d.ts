import { Request } from 'express';

interface AppRequest extends Request {
  user: {
    id: string;
    email: string;
    username: string;
    role: string;
  };
}

export type Client = {
  _id: string;
  firstname: string;
  lastname: string;
  cedula: string;
  email: string;
  phone: string;
  address: string;
  expiredDate: string;
  createdAt: Date;
  updatedAt: Date;
};