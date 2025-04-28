import { logger } from '../lib/server/logger';

export interface AlertThreshold {
  metric: string;
  warning: number;
  critical: number;
  duration: string;
  action: 'notify' | 'throttle' | 'shutdown';
}

export interface PerformanceMetric {
  name: string;
  type: 'timing' | 'counter' | 'gauge';
  unit: string;
  description: string;
}

export interface ResourceMetric {
  name: string;
  threshold: number;
  interval: number;  // in milliseconds
  description: string;
}

// Alert thresholds configuration
export const alertThresholds: AlertThreshold[] = [
  {
    metric: 'error_rate',
    warning: 0.05,  // 5%
    critical: 0.10, // 10%
    duration: '5m',
    action: 'notify'
  },
  {
    metric: 'response_time',
    warning: 2000,  // 2s
    critical: 5000, // 5s
    duration: '1m',
    action: 'throttle'
  },
  {
    metric: 'memory_usage',
    warning: 80,   // 80%
    critical: 90,  // 90%
    duration: '1m',
    action: 'notify'
  }
];

// Performance metrics configuration
export const performanceMetrics: PerformanceMetric[] = [
  {
    name: 'upload_duration',
    type: 'timing',
    unit: 'ms',
    description: 'Time taken to complete file upload'
  },
  {
    name: 'validation_duration',
    type: 'timing',
    unit: 'ms',
    description: 'Time taken for file validation'
  },
  {
    name: 'storage_operation_duration',
    type: 'timing',
    unit: 'ms',
    description: 'Time taken for storage operations'
  }
];

// Resource metrics configuration
export const resourceMetrics: ResourceMetric[] = [
  {
    name: 'memory_heap_used',
    threshold: 512 * 1024 * 1024, // 512MB
    interval: 60000, // 1 minute
    description: 'Heap memory usage'
  },
  {
    name: 'active_uploads',
    threshold: 100,
    interval: 1000, // 1 second
    description: 'Number of concurrent uploads'
  }
];

// Log monitoring configuration on startup
logger.info('Monitoring configuration loaded', {
  alertThresholds: alertThresholds.map(t => t.metric),
  performanceMetrics: performanceMetrics.map(m => m.name),
  resourceMetrics: resourceMetrics.map(m => m.name)
});

// Export monitoring configuration
export const monitoringConfig = {
  alertThresholds,
  performanceMetrics,
  resourceMetrics,
  enabled: process.env.NODE_ENV !== 'test'
}; 