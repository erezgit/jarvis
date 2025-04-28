import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useCallback, useState } from 'react';
const MonitoringContext = createContext(null);
const MAX_METRICS = 100; // Keep last 100 metrics
export const MonitoringProvider = ({ children }) => {
    const [metrics, setMetrics] = useState({
        renders: [],
        requests: [],
    });
    const addRenderMetric = useCallback((metric) => {
        setMetrics((prev) => ({
            ...prev,
            renders: [...prev.renders.slice(-MAX_METRICS + 1), metric],
        }));
    }, []);
    const addRequestMetric = useCallback((metric) => {
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
    return (_jsx(MonitoringContext.Provider, { value: {
            metrics,
            addRenderMetric,
            addRequestMetric,
            clearMetrics,
        }, children: children }));
};
export const useMonitoring = () => {
    const context = useContext(MonitoringContext);
    if (!context) {
        throw new Error('useMonitoring must be used within a MonitoringProvider');
    }
    return context;
};
