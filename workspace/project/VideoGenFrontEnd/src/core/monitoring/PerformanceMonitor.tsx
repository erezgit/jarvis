import { FC, ReactNode, Profiler, ProfilerOnRenderCallback } from 'react';
import { useMonitoring } from './context';

interface PerformanceMonitorProps {
  id: string;
  children: ReactNode;
}

export const PerformanceMonitor: FC<PerformanceMonitorProps> = ({ id, children }) => {
  const { addRenderMetric } = useMonitoring();

  const handleRender: ProfilerOnRenderCallback = (
    id,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime,
  ) => {
    addRenderMetric({
      id,
      phase: phase === 'mount' ? 'mount' : 'update',
      actualDuration,
      baseDuration,
      startTime,
      commitTime,
    });
  };

  return (
    <Profiler id={id} onRender={handleRender}>
      {children}
    </Profiler>
  );
};
