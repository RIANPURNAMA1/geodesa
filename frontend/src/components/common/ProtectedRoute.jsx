import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PageLoader } from '../common/LoadingSpinner';

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user)   return <Navigate to="/login" replace />;
  return <Outlet />;
}

export function AdminRoute() {
  const { user, loading, isAdmin, isUser } = useAuth();
  if (loading)   return <PageLoader />;
  if (!user)     return <Navigate to="/login" replace />;
  if (!isAdmin)  return <Navigate to={isUser ? '/' : '/dashboard'} replace />;
  return <Outlet />;
}

export function StaffRoute() {
  const { user, loading, isUser } = useAuth();
  if (loading)   return <PageLoader />;
  if (!user)     return <Navigate to="/login" replace />;
  if (isUser)    return <Navigate to="/" replace />;
  return <Outlet />;
}

export function GuestRoute() {
  const { user, loading, isUser } = useAuth();
  if (loading) return <PageLoader />;
  if (user)    return <Navigate to={isUser ? '/' : '/dashboard'} replace />;
  return <Outlet />;
}
