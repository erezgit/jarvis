export interface PerformanceMetric {
  name: string;
  description: string;
  unit: string;
}

export interface ResourceMetric {
  name: string;
  description: string;
  unit: string;
  threshold: number;
  interval?: number;
}

export interface AlertThreshold {
  metric: string;
  warning: number;
  critical: number;
  action?: string;
}

export const monitoringConfig = {
  enabled: true,
  performanceMetrics: [
    {
      name: 'request_duration',
      description: 'Time taken to process a request',
      unit: 'ms'
    },
    {
      name: 'error_rate',
      description: 'Rate of errors per minute',
      unit: 'errors/min'
    }
  ],
  resourceMetrics: [
    {
      name: 'memory_usage',
      description: 'Memory usage percentage',
      unit: '%',
      threshold: 90,
      interval: 60000
    },
    {
      name: 'cpu_usage',
      description: 'CPU usage percentage',
      unit: '%',
      threshold: 80,
      interval: 60000
    }
  ],
  alertThresholds: [
    {
      metric: 'error_rate',
      warning: 5,
      critical: 10,
      action: 'notify'
    },
    {
      metric: 'memory_usage',
      warning: 80,
      critical: 90,
      action: 'notify'
    }
  ]
}; 