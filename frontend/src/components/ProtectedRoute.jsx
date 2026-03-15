import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loading } from '../components/Loading';

export const ProtectedRoute = ({ children, adminOnly = false, superAdminOnly = false }) => {
  const { user, loading, isAdmin, isSuperAdmin } = useAuth();

  if (loading) {
    return <Loading fullScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (superAdminOnly && !isSuperAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  if (adminOnly && !isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
