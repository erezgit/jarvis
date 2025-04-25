import * as React from 'react';
import { useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/useToast';
import { Spinner } from '@/components/common/Spinner';
import { AuthStatus } from '@/types/auth';

interface AuthGuardProps {
  requireAuth?: boolean;
  redirectTo?: string;
}

interface ErrorFallbackProps {
  error: Error;
}

const LoadingSpinner: React.FC = () => (
  <div className="flex h-screen items-center justify-center">
    <Spinner size="sm" />
  </div>
);

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error }) => (
  <div className="flex flex-col items-center justify-center min-h-screen p-4">
    <div className="text-destructive text-lg font-semibold mb-2">Authentication Error</div>
    <div className="text-muted-foreground text-center">{error.message}</div>
    <button
      onClick={() => window.location.reload()}
      className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
    >
      Try Again
    </button>
  </div>
);

export const AuthGuard: React.FC<AuthGuardProps> = ({
  requireAuth = true,
  redirectTo = '/login',
}) => {
  const { isAuthenticated, status, error } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only process redirects when we have a definitive auth state
    if (status === 'loading') return;

    const shouldRedirect = requireAuth ? !isAuthenticated : isAuthenticated;
    if (shouldRedirect) {
      const message = requireAuth
        ? 'Please log in to access this page'
        : 'You are already logged in';

      showToast(message, 'info');

      if (requireAuth && location.pathname !== '/login') {
        // Store the attempted URL for redirecting after login
        const returnUrl = encodeURIComponent(location.pathname + location.search);
        navigate(`${redirectTo}?returnUrl=${returnUrl}`);
      } else {
        navigate(redirectTo);
      }
    }
  }, [isAuthenticated, status, navigate, location, requireAuth, redirectTo, showToast]);

  // Show loading state
  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  // Show error state
  if (status === 'error' as AuthStatus && error) {
    return <ErrorFallback error={error} />;
  }

  // If we're not loading and the authentication state matches our requirements,
  // render the protected content
  const isAuthorized = requireAuth ? isAuthenticated : !isAuthenticated;
  return isAuthorized ? <Outlet /> : null;
};

// Higher-order component for protecting individual routes
export const withAuthGuard = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  guardProps: AuthGuardProps = {},
): React.FC<P> => {
  const WithAuthGuardComponent: React.FC<P> = (props) => {
    const { isAuthenticated, status, error } = useAuth();

    if (status === 'loading') {
      return <LoadingSpinner />;
    }

    if (status === 'error' as AuthStatus && error) {
      return <ErrorFallback error={error} />;
    }

    const isAuthorized = guardProps.requireAuth ? isAuthenticated : !isAuthenticated;
    return isAuthorized ? <WrappedComponent {...props} /> : null;
  };

  WithAuthGuardComponent.displayName = `WithAuthGuard(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return WithAuthGuardComponent;
};
