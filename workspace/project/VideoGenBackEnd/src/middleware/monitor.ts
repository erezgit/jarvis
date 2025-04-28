import morgan from 'morgan';
import logger from '../config/logger';
import { monitorConfig } from '../config/middleware';

// Create a write stream for Morgan
const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  }
};

// Use configured Morgan format
export const requestLogger = morgan(monitorConfig.morgan.format, { stream });

// Performance monitoring middleware
export const performanceMonitor = (req: any, res: any, next: any) => {
  const start = process.hrtime();

  res.on('finish', () => {
    const duration = process.hrtime(start);
    const durationMs = (duration[0] * 1000) + (duration[1] / 1e6);
    
    logger.info(
      monitorConfig.performance.format(
        req.method,
        req.url,
        durationMs.toFixed(2)
      )
    );
  });

  next();
}; 