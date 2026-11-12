// src/components/auth/ProtectedRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'USER' | 'ADMIN';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#191B22] flex flex-col items-center justify-center gap-3 text-gray-300">
        <Loader2 className="w-7 h-7 text-[#8b5cf6] animate-spin" />
        <p className="text-xs font-mono text-gray-400">
          Verifying PrepAI authentication session...
        </p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="min-h-screen bg-[#191B22] flex flex-col items-center justify-center p-6 text-center text-gray-200 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-bold text-white">Administrator Access Required</h1>
        <p className="text-xs sm:text-sm text-gray-400 max-w-md">
          Your account ({user.email}) does not have ADMIN privileges to access the PrepAI Admin Console.
        </p>
        <Navigate to="/dashboard" replace />
      </div>
    );
  }

  return <>{children}</>;
};
