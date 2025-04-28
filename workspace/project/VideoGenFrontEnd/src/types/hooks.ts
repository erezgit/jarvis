import { AuthUser as User } from './auth';
import type { Project, ProjectListItem } from './projects';

// Auth Hook Types
export interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

// Form Hook Types
export type ValidationValue = string | null;

export interface FormValidation {
  validateField: (name: string, value: ValidationValue) => string | undefined;
  validateForm: () => boolean;
}

export interface FormData extends Record<string, ValidationValue> {
  [key: string]: ValidationValue;
}

export interface UseFormReturn<T extends FormData> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  setFieldValue: (field: keyof T, value: ValidationValue) => void;
  resetForm: () => void;
}

// API Hook Types
export interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// Video Hook Types
export interface UseVideoReturn {
  videos: Video[];
  loading: boolean;
  error: Error | null;
  generateVideo: (options: VideoGenerationOptions) => Promise<void>;
  uploadProgress: number;
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
}

// Toast Hook Types
export interface UseToastReturn {
  toasts: Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
    duration?: number;
  }>;
  isVisible: boolean;
  showToast: (message: string, type?: 'success' | 'error' | 'info', duration?: number) => string;
  dismissToast: (id?: string) => void;
}

// Notification Hook Types
export interface NotificationPermission {
  status: 'default' | 'granted' | 'denied';
  subscription: PushSubscription | null;
}

export interface NotificationMessage {
  id: string;
  title: string;
  body: string;
  icon?: string;
  data?: Record<string, unknown>;
  timestamp: string;
  read: boolean;
}

export interface UseNotificationReturn {
  permission: NotificationPermission;
  notifications: NotificationMessage[];
  loading: boolean;
  error: Error | null;
  requestPermission: () => Promise<void>;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
  clearNotifications: () => void;
  markAsRead: (id: string) => void;
}

// Common Types
export interface VideoGenerationOptions {
  images: File[];
  duration: number;
  transition: 'fade' | 'slide' | 'zoom';
  music?: File;
}

export interface Video {
  id: string;
  url: string;
  status: string;
  createdAt: string;
  duration: number;
  prompt: string;
}

export interface UseProjectsReturn {
  projects: ProjectListItem[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export interface UseProjectReturn {
  project: Project | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}
