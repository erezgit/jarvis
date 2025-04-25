import { logger } from '../../../lib/server/logger';
import { monitoringConfig, AlertThreshold, PerformanceMetric, ResourceMetric } from './config';
import { EventEmitter } from 'events';
import * as os from 'os';

class MonitoringService {
  private metrics: Map<string, number[]>;
  private alerts: Map<string, boolean>;
  private eventEmitter: EventEmitter;
  private readonly maxDataPoints = 100;

  constructor() {
    this.metrics = new Map();
    this.alerts = new Map();
    this.eventEmitter = new EventEmitter();
    this.initializeMetrics();
    this.startPeriodicCheck();
  }

  private initializeMetrics(): void {
    // Initialize performance metrics
    monitoringConfig.performanceMetrics.forEach((metric: PerformanceMetric) => {
      this.metrics.set(metric.name, []);
    });

    // Initialize resource metrics
    monitoringConfig.resourceMetrics.forEach((metric: ResourceMetric) => {
      this.metrics.set(metric.name, []);
    });

    // Start resource monitoring
    this.startResourceMonitoring();
  }

  /**
   * Record a metric value
   */
  recordMetric(name: string, value: number): void {
    if (!monitoringConfig.enabled) return;

    const metricValues = this.metrics.get(name) || [];
    metricValues.push(value);

    // Keep only the last maxDataPoints
    if (metricValues.length > this.maxDataPoints) {
      metricValues.shift();
    }

    this.metrics.set(name, metricValues);
    this.checkThresholds(name, value);
  }

  /**
   * Start monitoring system resources
   */
  private startResourceMonitoring() {
    monitoringConfig.resourceMetrics.forEach(metric => {
      setInterval(() => {
        switch (metric.name) {
          case 'memory_heap_used':
            const memoryUsage = process.memoryUsage();
            this.recordMetric(metric.name, memoryUsage.heapUsed);
            break;
          case 'memory_usage':
            const mem = process.memoryUsage();
            // Calculate memory usage as a percentage of heap used vs heap total
            const memPercent = (mem.heapUsed / mem.heapTotal) * 100;
            this.recordMetric(metric.name, memPercent);
            break;
          case 'cpu_usage':
            // Simple CPU usage estimation
            // For more accurate measurement, consider using a library like node-os-utils
            const startUsage = process.cpuUsage();
            // Measure CPU usage over a short interval
            setTimeout(() => {
              const endUsage = process.cpuUsage(startUsage);
              const totalUsage = endUsage.user + endUsage.system;
              // Convert to percentage (approximate)
              const cpuPercent = (totalUsage / 1000000) * 100;
              this.recordMetric(metric.name, Math.min(cpuPercent, 100));
            }, 100);
            break;
          case 'active_uploads':
            // This would be implemented based on your upload tracking mechanism
            break;
          default:
            logger.warn(`Unknown resource metric: ${metric.name}`);
        }
      }, metric.interval);
    });
  }

  private startPeriodicCheck(): void {
    setInterval(() => {
      this.checkResourceMetrics();
    }, 60000); // Check every minute
  }

  private checkResourceMetrics(): void {
    monitoringConfig.resourceMetrics.forEach((metric: ResourceMetric) => {
      const value = this.getCurrentValue(metric.name);
      if (value !== null && value > metric.threshold) {
        logger.warn(`Resource metric ${metric.name} exceeded threshold`, {
          metric: metric.name,
          value,
          threshold: metric.threshold,
          timestamp: new Date().toISOString()
        });
      }
    });
  }

  private getCurrentValue(metricName: string): number | null {
    const values = this.metrics.get(metricName);
    if (!values || values.length === 0) {
      return null;
    }
    return values[values.length - 1];
  }

  /**
   * Check if any thresholds are exceeded
   */
  private checkThresholds(metricName: string, value: number): void {
    const threshold = monitoringConfig.alertThresholds.find((t: AlertThreshold) => t.metric === metricName);
    if (!threshold) {
      return;
    }

    const isWarning = value >= threshold.warning;
    const isCritical = value >= threshold.critical;
    const currentAlert = this.alerts.get(metricName);

    if (isCritical && !currentAlert) {
      this.triggerAlert(metricName, 'critical', value, threshold);
      this.alerts.set(metricName, true);
    } else if (isWarning && !currentAlert) {
      this.triggerAlert(metricName, 'warning', value, threshold);
      this.alerts.set(metricName, true);
    } else if (!isWarning && currentAlert) {
      this.resolveAlert(metricName, value, threshold);
      this.alerts.set(metricName, false);
    }
  }

  /**
   * Trigger an alert
   */
  private triggerAlert(
    metricName: string,
    level: 'warning' | 'critical',
    value: number,
    threshold: AlertThreshold
  ) {
    const alert = {
      metric: metricName,
      level,
      value,
      threshold: level === 'warning' ? threshold.warning : threshold.critical,
      timestamp: new Date().toISOString()
    };

    logger.warn(`Alert triggered: ${metricName}`, alert);
    this.eventEmitter.emit('alert', alert);

    // Execute action based on threshold configuration
    if (threshold.action === 'throttle') {
      this.eventEmitter.emit('throttle', metricName);
    } else if (threshold.action === 'shutdown') {
      logger.error(`Critical threshold exceeded for ${metricName}, initiating shutdown`);
      process.exit(1);
    }
  }

  /**
   * Resolve an alert
   */
  private resolveAlert(
    metricName: string,
    value: number,
    threshold: AlertThreshold
  ) {
    const resolution = {
      metric: metricName,
      value,
      threshold: threshold.warning,
      timestamp: new Date().toISOString()
    };

    logger.info(`Alert resolved: ${metricName}`, resolution);
    this.eventEmitter.emit('alertResolved', resolution);
  }

  /**
   * Get current metrics
   */
  getMetrics(): Record<string, number[]> {
    return Object.fromEntries(this.metrics);
  }

  /**
   * Subscribe to monitoring events
   */
  onAlert(handler: (alert: any) => void) {
    this.eventEmitter.on('alert', handler);
  }

  onAlertResolved(handler: (resolution: any) => void) {
    this.eventEmitter.on('alertResolved', handler);
  }

  onThrottle(handler: (metricName: string) => void) {
    this.eventEmitter.on('throttle', handler);
  }
}

// Export singleton instance
export const monitoringService = new MonitoringService(); 