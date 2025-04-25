import { GenerationStatus } from '../types';

export interface RunwayMLConfig {
  apiKey: string;
  maxRetries?: number;
  timeout?: number;
}

export type RunwayConfig = RunwayMLConfig;

export type RunwayStatus = 'SUCCEEDED' | 'FAILED' | 'PROCESSING' | 'QUEUED' | 'RUNNING' | 'PENDING' | 'CANCELLED' | 'THROTTLED';

export interface GenerationResponse {
  id: string;
  status: RunwayStatus;
  error?: string;
  output?: { url: string; }[];
}

export type RunwayResponse = GenerationResponse;

export interface TaskRetrieveResponse {
  id: string;
  status: RunwayStatus;
  error?: string;
  output?: Array<{ url: string }>;
}

export interface RunwayGenerationStatus {
  status: GenerationStatus;
  progress: number;
  error?: string;
  output?: {
    videoUrl: string;
  };
}

export const RUNWAY_STATUS_MAP: Record<RunwayStatus, GenerationStatus> = {
  'SUCCEEDED': GenerationStatus.PROCESSING,
  'FAILED': GenerationStatus.FAILED,
  'PROCESSING': GenerationStatus.GENERATING,
  'QUEUED': GenerationStatus.QUEUED,
  'RUNNING': GenerationStatus.GENERATING,
  'PENDING': GenerationStatus.QUEUED,
  'CANCELLED': GenerationStatus.FAILED,
  'THROTTLED': GenerationStatus.FAILED
}; 