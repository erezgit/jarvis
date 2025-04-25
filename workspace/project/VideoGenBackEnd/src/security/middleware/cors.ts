import cors from 'cors';
import { RequestHandler } from 'express';
import { corsConfig } from '../config/cors.config';

/**
 * CORS Middleware
 * Handles Cross-Origin Resource Sharing using the defined configuration
 */
export const corsMiddleware: RequestHandler = cors(corsConfig); 