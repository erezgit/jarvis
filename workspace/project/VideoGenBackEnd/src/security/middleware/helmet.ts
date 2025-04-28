import helmet from 'helmet';
import { RequestHandler } from 'express';
import { helmetConfig } from '../config/helmet.config';

/**
 * Security Headers Middleware
 * Applies various security headers using Helmet to protect against common vulnerabilities
 */
export const securityHeaders: RequestHandler = helmet(helmetConfig); 