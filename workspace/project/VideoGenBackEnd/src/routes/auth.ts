import { Router } from 'express';
import { container } from 'tsyringe';
import { TYPES } from '../lib/types';
import type { AuthService } from '../services/auth/service';
import { validateRegistration, validateLogin, validatePasswordReset } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import { 
  RegisterRequest, 
  LoginRequest, 
  PasswordResetRequest,
  AuthResponse,
  ApiResponse
} from '../types';
import { AuthenticationError } from '../errors/auth';
import { ErrorCode } from '../types/errors';
import type { Request, Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../services/auth/guards/types';
import type { RequestHandler } from 'express';
import { logger } from '../lib/server/logger';

const router = Router();
const authService = container.resolve<AuthService>(TYPES.AuthService);

// Log route registration
logger.info('[Auth] Routes registered', {
  routes: [
    'POST /register - Register new user',
    'POST /login - User login',
    'POST /logout - User logout',
    'POST /reset-password - Request password reset',
    'GET /me - Get current user profile',
    'POST /refresh - Refresh access token'
  ],
  middleware: ['authenticateToken', 'validation'],
  timestamp: new Date().toISOString()
});

// Type-safe middleware wrapper for authenticated routes
const authenticatedHandler = (handler: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    return handler(req as AuthenticatedRequest, res, next);
  };
};

/**
 * @route POST /auth/register
 * @description Register a new user
 */
router.post('/register', validateRegistration, async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  try {
    logger.info('[Auth] Registration requested', {
      email: req.body.email,
      timestamp: new Date().toISOString()
    });

    const registerData: RegisterRequest = req.body;
    const result = await authService.register(registerData);

    const duration = Date.now() - startTime;
    logger.info('[Auth] Registration successful', {
      email: req.body.email,
      duration_ms: duration,
      timestamp: new Date().toISOString()
    });

    res.status(201).json(result);
  } catch (error) {
    logger.error('[Auth] Registration failed', {
      error,
      email: req.body.email,
      duration_ms: Date.now() - startTime,
      timestamp: new Date().toISOString()
    });
    next(error);
  }
});

/**
 * @route POST /auth/login
 * @description Login user
 */
router.post('/login', validateLogin, async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  try {
    logger.info('[Auth] Login requested', {
      email: req.body.email,
      timestamp: new Date().toISOString()
    });

    const loginData: LoginRequest = req.body;
    const result = await authService.login(loginData);

    const duration = Date.now() - startTime;
    logger.info('[Auth] Login successful', {
      email: req.body.email,
      duration_ms: duration,
      timestamp: new Date().toISOString()
    });

    res.status(200).json(result);
  } catch (error) {
    logger.error('[Auth] Login failed', {
      error,
      email: req.body.email,
      duration_ms: Date.now() - startTime,
      timestamp: new Date().toISOString()
    });
    next(error);
  }
});

/**
 * @route POST /auth/logout
 * @description Logout user
 */
router.post('/logout', authenticateToken, authenticatedHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  try {
    logger.info('[Auth] Logout requested', {
      userId: req.user.id,
      timestamp: new Date().toISOString()
    });

    await authService.logout();

    const duration = Date.now() - startTime;
    logger.info('[Auth] Logout successful', {
      userId: req.user.id,
      duration_ms: duration,
      timestamp: new Date().toISOString()
    });

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error('[Auth] Logout failed', {
      error,
      userId: req.user.id,
      duration_ms: Date.now() - startTime,
      timestamp: new Date().toISOString()
    });
    next(error);
  }
}));

/**
 * @route POST /auth/reset-password
 * @description Request password reset
 */
router.post('/reset-password', validatePasswordReset, async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  try {
    logger.info('[Auth] Password reset requested', {
      email: req.body.email,
      timestamp: new Date().toISOString()
    });

    const resetData: PasswordResetRequest = req.body;
    await authService.requestPasswordReset(resetData);

    const duration = Date.now() - startTime;
    logger.info('[Auth] Password reset email sent', {
      email: req.body.email,
      duration_ms: duration,
      timestamp: new Date().toISOString()
    });

    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    logger.error('[Auth] Password reset failed', {
      error,
      email: req.body.email,
      duration_ms: Date.now() - startTime,
      timestamp: new Date().toISOString()
    });
    next(error);
  }
});

/**
 * @route GET /auth/me
 * @description Get current user profile
 */
router.get('/me', authenticateToken, authenticatedHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  try {
    logger.info('[Auth] Profile requested', {
      userId: req.user.id,
      timestamp: new Date().toISOString()
    });

    const duration = Date.now() - startTime;
    logger.info('[Auth] Profile retrieved', {
      userId: req.user.id,
      duration_ms: duration,
      timestamp: new Date().toISOString()
    });

    res.status(200).json({ user: req.user });
  } catch (error) {
    logger.error('[Auth] Profile retrieval failed', {
      error,
      userId: req.user.id,
      duration_ms: Date.now() - startTime,
      timestamp: new Date().toISOString()
    });
    next(error);
  }
}));

/**
 * @route POST /auth/refresh
 * @description Refresh access token
 */
router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  try {
    const { refresh_token } = req.body;

    logger.info('[Auth] Token refresh requested', {
      timestamp: new Date().toISOString()
    });

    if (!refresh_token) {
      throw new AuthenticationError(
        ErrorCode.AUTHENTICATION_FAILED,
        'Refresh token is required'
      );
    }

    const result = await authService.refreshToken(refresh_token);

    const duration = Date.now() - startTime;
    logger.info('[Auth] Token refresh successful', {
      duration_ms: duration,
      timestamp: new Date().toISOString()
    });

    res.status(200).json(result);
  } catch (error) {
    logger.error('[Auth] Token refresh failed', {
      error,
      duration_ms: Date.now() - startTime,
      timestamp: new Date().toISOString()
    });
    next(error);
  }
});

export default router; 