import { Request } from 'express';
import { UserRole } from './auth';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: UserRole;
      };
    }
  }
}

export {}; 