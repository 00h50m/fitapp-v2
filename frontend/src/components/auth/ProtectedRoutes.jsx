import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const FullScreenLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <Loader2 className="h-8 w-8 text-primary animate-spin" />
  </div>
);

// 🔐 Requer login
export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <FullScreenLoader />;

  if (!user) return <Navigate to="/login" replace />;

  return children;
};

// 🔑 Apenas Admin
export const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) return <FullScreenLoader />;

  if (!user) return <Navigate to="/login" replace />;

  if (!isAdmin) return <Navigate to="/" replace />;

  return children;
};

// 🌎 Rota pública
export const PublicRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) return <FullScreenLoader />;

  if (user) {
    return <Navigate to={isAdmin ? "/admin" : "/"} replace />;
  }

  return children;
};