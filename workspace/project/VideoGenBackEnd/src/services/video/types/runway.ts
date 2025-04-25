export interface RunwayConfig {
  apiKey: string;
  baseUrl: string;
  modelId: string;
}

export interface RunwayGenerationRequest {
  prompt: string;
  imageUrl: string;
  modelId: string;
  duration?: number;
}

export interface RunwayGenerationResponse {
  id: string;
  status: string;
  error?: string;
  output?: {
    videoUrl?: string;
    thumbnailUrl?: string;
    duration?: number;
  };
}

export interface RunwayGenerationStatusResponse {
  id: string;
  status: string;
  error?: string;
  output?: {
    videoUrl?: string;
    thumbnailUrl?: string;
    duration?: number;
  };
} 