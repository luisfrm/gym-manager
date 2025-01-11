import { Request } from 'express';

interface AppRequest extends Request {
  user: {
    id: string;
    email: string;
    username: string;
    role: string;
  };
}