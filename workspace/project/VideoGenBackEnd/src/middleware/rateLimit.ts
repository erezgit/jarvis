import rateLimit from 'express-rate-limit';
import { AppError } from '../errors/base';
import { MemoryStore } from 'express-rate-limit';
import { rateLimitConfig } from '../config/middleware';

const isTest = process.env.NODE_ENV === 'test';

export const createLimiter = () => {
  const store = new MemoryStore();
  const config = isTest ? rateLimitConfig.test : rateLimitConfig.production;
  
  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    store,
    ...rateLimitConfig.options,
    handler: (req, res) => {
      res.status(429).json(rateLimitConfig.errorResponse);
    }
  });
};

export const limiter = createLimiter(); 