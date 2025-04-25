export interface ServiceResult<T> {
  data: T | null;
  error: Error | null;
}

export interface ServiceOptions {
  retry?: boolean;
  cache?: boolean;
}
