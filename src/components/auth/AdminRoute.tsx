import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import PageSkeleton from '@/components/PageSkeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';

const AdminRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const { canAccessAdmin, loading: adminLoading } = useAdmin();

  if (authLoading || adminLoading) {
    return <PageSkeleton variant="dashboard" />;
  }

  if (!user) {
    return <Navigate to="/auth?mode=entrar&next=%2Fcrm" replace />;
  }

  if (!canAccessAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
