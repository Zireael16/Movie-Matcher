import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Higher-Order Route Guard protecting routes based on authentication state and authorities.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Target component to render if authorized
 * @param {string} [props.requiredRole] - Optional authority constraint (e.g., 'ADMIN')
 */
export default function ProtectedRoute({ children, requiredRole }) {
  const { user, token, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // 1. Await local storage session hydration on refresh
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <p style={{ fontSize: '1.1rem', color: '#64748b' }}>Verifying session...</p>
      </div>
    );
  }

  // 2. Unauthenticated check: redirect to login preserving intent
  if (!isAuthenticated || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Authority check: redirect unauthorized customers
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}