import { jsx as _jsx } from "react/jsx-runtime";
import { Profiler } from 'react';
import { useMonitoring } from './context';
export const PerformanceMonitor = ({ id, children }) => {
    const { addRenderMetric } = useMonitoring();
    const handleRender = (id, phase, actualDuration, baseDuration, startTime, commitTime) => {
        addRenderMetric({
            id,
            phase: phase === 'mount' ? 'mount' : 'update',
            actualDuration,
            baseDuration,
            startTime,
            commitTime,
        });
    };
    return (_jsx(Profiler, { id: id, onRender: handleRender, children: children }));
};
