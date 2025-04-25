import { createContext, useContext, FC, ReactNode, useCallback, useState } from 'react';

export interface RenderMetrics {
  id: string;
  phase: 'mount' | 'update';
  actualDuration: number;
  baseDuration: number;
  startTime: number;
  commitTime: number;
}

export interface RequestMetrics {
  path: string;
  method: string;
  duration: number;
  status: number;
  retryCount: number;
  timestamp: number;
}

export interface PerformanceMetrics {
  renders: RenderMetrics[];
  requests: RequestMetrics[];
}

interface MonitoringContextType {
  metrics: PerformanceMetrics;
  addRenderMetric: (metric: RenderMetrics) => void;
  addRequestMetric: (metric: RequestMetrics) => void;
  clearMetrics: () => void;
}

const MonitoringContext = createContext<MonitoringContextType | null>(null);

interface MonitoringProviderProps {
  children: ReactNode;
}

const MAX_METRICS = 100; // Keep last 100 metrics

export const MonitoringProvider: FC<MonitoringProviderProps> = ({ children }) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renders: [],
    requests: [],
  });

  const addRenderMetric = useCallback((metric: RenderMetrics) => {
    setMetrics((prev) => ({
      ...prev,
      renders: [...prev.renders.slice(-MAX_METRICS + 1), metric],
    }));
  }, []);

  const addRequestMetric = useCallback((metric: RequestMetrics) => {
    setMetrics((prev) => ({
      ...prev,
      requests: [...prev.requests.slice(-MAX_METRICS + 1), metric],
    }));

    // Log metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Request Metric:`, metric);
    }
  }, []);

  const clearMetrics = useCallback(() => {
    setMetrics({ renders: [], requests: [] });
  }, []);

  return (
    <MonitoringContext.Provider
      value={{
        metrics,
        addRenderMetric,
        addRequestMetric,
        clearMetrics,
      }}
    >
      {children}
    </MonitoringContext.Provider>
  );
};

export const useMonitoring = () => {
  const context = useContext(MonitoringContext);
  if (!context) {
    throw new Error('useMonitoring must be used within a MonitoringProvider');
  }
  return context;
};
