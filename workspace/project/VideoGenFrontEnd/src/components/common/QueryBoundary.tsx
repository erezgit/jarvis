import { Spinner } from './Spinner';
import type { ReactNode } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';

interface QueryBoundaryProps<T> {
  query: UseQueryResult<T, Error>;
  children: (data: T) => ReactNode;
  fallback?: ReactNode;
  error?: ReactNode;
}

export function QueryBoundary<T>({
  query,
  children,
  fallback = (
    <div className="flex items-center justify-center p-4">
      <Spinner size="sm" />
    </div>
  ),
  error,
}: QueryBoundaryProps<T>) {
  if (query.isLoading) {
    return fallback;
  }

  if (query.isError && error) {
    return error;
  }

  if (!query.data) {
    return null;
  }

  return <>{children(query.data)}</>;
}
