import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ requiredRole }) => {
  const { user, token, isLoading } = useAuth();

  // Still verifying — show a neutral loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-slate-100">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-sm font-medium">Memverifikasi sesi...</p>
        </div>
      </div>
    );
  }

  // No valid token? Redirect to login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Role-based guard — if a specific role is required, verify it
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

