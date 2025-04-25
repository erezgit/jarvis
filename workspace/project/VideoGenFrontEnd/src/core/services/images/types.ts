export interface ImageUploadResult {
  imageUrl: string;
  projectId: string;
}

export interface UploadStatusResponse {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  imageUrl?: string;
  error?: string;
}

export interface ImageUploadOptions {
  onProgress?: (progress: { loaded: number; total: number; percentage: number }) => void;
  retryAttempts?: number;
  maxRetries?: number; // Maximum number of retry attempts
  timeout?: number; // Timeout in milliseconds
  projectId?: string; // Project ID to associate the image with
  metadata?: Record<string, string | number | boolean>; // Additional metadata to send with the upload
}
