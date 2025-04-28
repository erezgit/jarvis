import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../../../types/auth';
import { AppUser } from '../../../types/auth';

export interface AuthenticatedRequest extends Request {
  user: AppUser;
}

export interface AuthGuardConfig {
  roles?: UserRole[];
  allowAnonymous?: boolean;
}

export interface AuthGuardFunction {
  (req: Request, res: Response, next: NextFunction): Promise<void>;
}

export interface AuthGuardFactory {
  (config?: AuthGuardConfig): AuthGuardFunction;
}

export interface TokenPayload {
  userId: string;
  role: UserRole;
  exp: number;
  iat: number;
} 