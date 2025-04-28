import { FC, ReactNode, Suspense, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { RouteService } from '@/core/services/route/RouteService';
import { AuthStatus } from '@/types/auth';

interface AuthBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  errorFallback?: ReactNode;
}

const DefaultLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const DefaultError = ({ error }: { error: Error }) => (
  <div className="flex flex-col items-center justify-center min-h-screen">
    <div className="text-destructive text-lg font-semibold mb-2">Authentication Error</div>
    <div className="text-muted-foreground">{error.message}</div>
  </div>
);

export const AuthBoundary: FC<AuthBoundaryProps> = ({
  children,
  fallback = <DefaultLoader />,
  errorFallback = <DefaultError error={new Error('Authentication failed')} />,
}) => {
  const { status, isAuthenticated } = useAuth();
  const location = useLocation();

  // Save current route when mounting
  useEffect(() => {
    if (location.pathname !== '/login') {
      RouteService.saveRoute(location.pathname + location.search);
    }
  }, [location]);

  if (status === 'loading') {
    return <>{fallback}</>;
  }

  if (status === 'error' as AuthStatus) {
    return <>{errorFallback}</>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Suspense fallback={fallback}>{children}</Suspense>;
};
