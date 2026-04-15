import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from './auth';

const ProtectedRoute = ({ children, requiredRole = null, requiredPermission = null }) => {
  const isAuth = isAuthenticated();

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  // You could also add permission checks here if needed
  // if (requiredPermission && !hasPermission(requiredPermission)) {
  //   return <Navigate to="/unauthorized" replace />;
  // }

  return children;
};

export default ProtectedRoute;