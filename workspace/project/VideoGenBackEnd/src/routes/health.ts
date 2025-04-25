import { Router } from 'express';
import { container } from '../config/container';
import { StorageService } from '../services/video/storage/service';
import { createServerSupabase } from '../lib/supabase';
import { logger } from '../lib/server/logger';
import { AppError } from '../errors/base';
import { ErrorCode, ErrorSeverity, HttpStatus } from '../types/errors';
import { TYPES } from '../lib/types';
import type { Request, Response, NextFunction } from 'express';
import { ImageStorageService } from '../services/image/storage/service';

const router = Router();

// Log route registration
logger.info('[Health] Routes registered', {
  routes: [
    'GET / - Full health check',
    'GET /storage - Storage health check',
    'GET /database - Database health check',
    'GET /memory - Memory health check'
  ],
  timestamp: new Date().toISOString()
});

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  components: {
    storage?: ComponentStatus;
    imageStorage?: ComponentStatus;
    database?: ComponentStatus;
    memory?: ComponentStatus;
  };
  details?: Record<string, unknown>;
}

interface ComponentStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency?: number;
  message?: string;
  lastCheck: string;
  retryCount?: number;
  details?: Record<string, unknown>;
}

/**
 * Check database connectivity with retry
 */
async function checkDatabase(maxRetries = 3, backoffMs = 1000): Promise<ComponentStatus> {
  const startTime = Date.now();
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      logger.info('[Health] Checking database connection', {
        attempt: retryCount + 1,
        maxRetries,
        timestamp: new Date().toISOString()
      });

      const supabase = createServerSupabase();
      const { data, error } = await supabase
        .from('projects')
        .select('count')
        .limit(1);

      if (error) throw error;

      const duration = Date.now() - startTime;
      logger.info('[Health] Database check successful', {
        duration_ms: duration,
        timestamp: new Date().toISOString()
      });

      return {
        status: 'healthy',
        latency: duration,
        lastCheck: new Date().toISOString(),
        retryCount
      };
    } catch (error) {
      retryCount++;
      logger.warn('[Health] Database check failed', {
        error,
        attempt: retryCount,
        maxRetries,
        timestamp: new Date().toISOString()
      });

      if (retryCount < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, backoffMs * retryCount));
        continue;
      }

      return {
        status: 'unhealthy',
        latency: Date.now() - startTime,
        message: error instanceof Error ? error.message : 'Database check failed',
        lastCheck: new Date().toISOString(),
        retryCount,
        details: { error }
      };
    }
  }

  // This should never happen due to while loop condition
  throw new Error('Unexpected end of database check');
}

/**
 * Check storage connectivity
 */
async function checkStorage(): Promise<ComponentStatus> {
  const storageService = container.resolve<StorageService>(TYPES.StorageService);
  const start = Date.now();
  
  try {
    // Basic storage check
    await storageService.verifyFileExists('test-url');
    
    return {
      status: 'healthy',
      latency: Date.now() - start,
      lastCheck: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      latency: Date.now() - start,
      message: error instanceof Error ? error.message : 'Unknown error',
      lastCheck: new Date().toISOString()
    };
  }
}

async function checkImageStorage(): Promise<ComponentStatus> {
  const imageStorageService = container.resolve<ImageStorageService>(TYPES.ImageStorageService);
  const start = Date.now();
  
  try {
    // Basic storage check
    await imageStorageService.fileExists('test-user', 'test-project');
    
    return {
      status: 'healthy',
      latency: Date.now() - start,
      lastCheck: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      latency: Date.now() - start,
      message: error instanceof Error ? error.message : 'Unknown error',
      lastCheck: new Date().toISOString()
    };
  }
}

/**
 * Check memory usage
 */
function checkMemory(): ComponentStatus {
  const used = process.memoryUsage();
  const maxHeap = process.env.NODE_OPTIONS?.match(/--max-old-space-size=(\d+)/)?.[1];
  const maxHeapMB = maxHeap ? parseInt(maxHeap) : 2048; // Default to 2GB if not set
  
  const heapUsedPercent = (used.heapUsed / 1024 / 1024 / maxHeapMB) * 100;
  
  return {
    status: heapUsedPercent > 90 ? 'degraded' : 'healthy',
    lastCheck: new Date().toISOString(),
    details: {
      heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)}MB`,
      maxHeap: `${maxHeapMB}MB`,
      heapUsedPercent: `${Math.round(heapUsedPercent)}%`
    }
  };
}

// Main health check endpoint
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  try {
    logger.info('[Health] Full health check requested', {
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    });

    const [dbStatus, storageStatus, imageStorageStatus] = await Promise.all([
      checkDatabase(),
      checkStorage(),
      checkImageStorage()
    ]);
    const memoryStatus = checkMemory();

    const status: HealthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      components: {
        database: dbStatus,
        storage: storageStatus,
        imageStorage: imageStorageStatus,
        memory: memoryStatus
      }
    };

    // Determine overall status
    if (Object.values(status.components).some(c => c?.status === 'unhealthy')) {
      status.status = 'unhealthy';
    } else if (Object.values(status.components).some(c => c?.status === 'degraded')) {
      status.status = 'degraded';
    }

    const duration = Date.now() - startTime;
    logger.info('[Health] Health check completed', {
      status: status.status,
      duration_ms: duration,
      components: {
        database: dbStatus.status,
        storage: storageStatus.status,
        imageStorage: imageStorageStatus.status,
        memory: memoryStatus.status
      },
      timestamp: new Date().toISOString()
    });

    res.status(status.status === 'healthy' ? 200 : 503).json(status);
  } catch (error) {
    logger.error('[Health] Health check failed', {
      error,
      duration_ms: Date.now() - startTime,
      timestamp: new Date().toISOString()
    });

    const appError = new AppError(
      HttpStatus.INTERNAL_SERVER_ERROR,
      ErrorCode.SERVER_ERROR,
      'Health check failed',
      ErrorSeverity.ERROR
    );

    next(appError);
  }
});

export default router; 