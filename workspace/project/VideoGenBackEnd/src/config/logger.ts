import winston from 'winston';
import { Request } from 'express';
import { Options as MorganOptions } from 'morgan';

const { createLogger, format, transports } = winston;
const { combine, timestamp, printf, colorize } = format;

// Extend the Logger interface
declare module 'winston' {
  interface Logger {
    logRequest(req: any, res: any, duration: number): void;
  }
}

// Logging Configuration
export const loggingConfig = {
  // File logging options
  files: {
    maxSize: 5242880, // 5MB
    maxFiles: 5,
    combinedLogPath: 'logs/combined.log',
    errorLogPath: 'logs/error.log'
  },
  // HTTP logging format for Morgan
  httpFormat: '🌐 :method :url :status :response-time ms',
  // Log levels by environment
  levels: {
    production: 'info',
    development: 'debug',
    test: 'debug'
  }
};

// Custom format for better visibility in development
const devFormat = printf(({ level, message, timestamp, ...metadata }) => {
  const icon = {
    error: '❌',
    warn: '⚠️ ',
    info: 'ℹ️ ',
    debug: '🔍',
    http: '🌐'
  }[level] || '📝';
  
  // Ensure timestamp is treated as string
  const time = new Date(timestamp as string).toLocaleTimeString();
  const shortDate = new Date(timestamp as string).toLocaleDateString();
  
  // Color the level based on severity
  const coloredLevel = {
    error: '\x1b[31m', // Red
    warn: '\x1b[33m',  // Yellow
    info: '\x1b[36m',  // Cyan
    debug: '\x1b[90m', // Gray
    http: '\x1b[35m'   // Magenta
  }[level] || '';
  
  const reset = '\x1b[0m';
  
  // Format metadata if present
  const metadataStr = Object.keys(metadata).length 
    ? `\n${JSON.stringify(metadata, null, 1)}`
    : '';

  return `${icon} [${shortDate} ${time}] ${coloredLevel}${level.toUpperCase()}${reset}: ${message}${metadataStr}`;
});

// Create the logger
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console({
      format: combine(
        timestamp(),
        devFormat
      ),
      level: 'debug'
    })
  ]
});

// Standard log message formats
export const logFormats = {
  requestCompleted: (method: string, url: string, status: number, duration: string) => ({
    method,
    url,
    status: `${status} ${status < 400 ? '✅' : status < 500 ? '⚠️' : '❌'}`,
    duration
  }),
  error: (error: Error, request: any) => ({
    error: {
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 3).join('\n') // Only show first 3 lines of stack
    },
    request: sanitizeRequest(request)
  })
};

// Sanitize sensitive data from requests
export const sanitizeRequest = (req: Request) => {
  const sanitized = {
    method: req.method,
    url: req.url,
    headers: { ...req.headers },
    query: req.query,
    body: { ...req.body }
  };

  // Remove sensitive data
  if (sanitized.headers.authorization) {
    sanitized.headers.authorization = '[REDACTED]';
  }
  if (sanitized.body.password) {
    sanitized.body.password = '[REDACTED]';
  }
  if (sanitized.body.confirmPassword) {
    sanitized.body.confirmPassword = '[REDACTED]';
  }

  return sanitized;
};

// Add request logging method
logger.logRequest = (req: any, res: any, duration: number): void => {
  const status = res.statusCode;
  const statusIcon = status < 400 ? '✅' : status < 500 ? '⚠️' : '❌';
  
  logger.info(`${req.method} ${req.url}`, {
    status: `${status} ${statusIcon}`,
    duration: `${duration}ms`,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
};

export default logger; 