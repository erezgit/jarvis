import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: string;
  fallbackPath?: string;
}

/**
 * Role-based protected route component
 * 
 * Extends the basic ProtectedRoute to add role-based access control.
 * 
 * Note: Currently, the backend has temporarily removed admin-only restrictions
 * while maintaining authentication requirements. This component is prepared for
 * when role-based restrictions are re-implemented.
 */
export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  children,
  requiredRole, // Kept for future implementation
  fallbackPath = '/dashboard' // Kept for future implementation
}) => {
  const { status } = useAuth();
  
  // Currently, we only check if the user is authenticated
  // Role-based restrictions have been temporarily removed on the backend
  
  // If authentication is still loading, show the protected route with loading state
  if (status === 'loading' || status === 'idle') {
    return <ProtectedRoute>{children}</ProtectedRoute>;
  }
  
  // For now, just check if the user is authenticated (handled by ProtectedRoute)
  return <ProtectedRoute>{children}</ProtectedRoute>;
};

export default RoleProtectedRoute; 