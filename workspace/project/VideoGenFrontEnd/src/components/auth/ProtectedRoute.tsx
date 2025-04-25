import { ReactNode, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const ProtectedRoute = ({ children, fallback }: ProtectedRouteProps) => {
  const { isAuthenticated, status, error } = useAuth();
  const location = useLocation();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  // Add a delay before redirecting to give auth time to initialize
  useEffect(() => {
    let timer: NodeJS.Timeout;

    // Only start the redirect timer if we're not loading and not authenticated
    if (status !== 'loading' && !isAuthenticated) {
      console.log('Starting redirect timer - not authenticated');
      timer = setTimeout(() => {
        console.log('Redirect timer expired, setting shouldRedirect to true');
        setShouldRedirect(true);
      }, 1000); // Give auth 1 second to initialize
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [status, isAuthenticated]);

  // Show loading state while auth is initializing
  if (status === 'loading' || status === 'idle') {
    console.log('Auth status is loading or idle, showing loading state');
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-foreground">Authenticating...</div>
        </div>
      )
    );
  }

  // Show error state
  if (error) {
    console.error('Auth error:', error);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to login if not authenticated and timer has expired
  if (!isAuthenticated && shouldRedirect) {
    console.log('User is not authenticated and timer expired, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated or still waiting, show content
  if (isAuthenticated) {
    console.log('User is authenticated, rendering protected content');
    return <>{children}</>;
  }

  // Still waiting for redirect timer
  console.log('Waiting for redirect timer, showing loading state');
  return (
    fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-foreground">Verifying authentication...</div>
      </div>
    )
  );
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
};

export default ProtectedRoute;
