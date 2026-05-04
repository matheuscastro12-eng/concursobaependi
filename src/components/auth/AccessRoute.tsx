import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import PageSkeleton from '@/components/PageSkeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';
import { useSubscription } from '@/hooks/useSubscription';

const AccessRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const { hasAccess, loading: subscriptionLoading } = useSubscription();
  const { canAccessAdmin, loading: adminLoading } = useAdmin();
  const location = useLocation();

  if (authLoading || subscriptionLoading || adminLoading) {
    return <PageSkeleton variant="dashboard" />;
  }

  if (!user) {
    const redirectTo = `${location.pathname}${location.search}`;
    return <Navigate to={`/auth?next=${encodeURIComponent(redirectTo)}`} replace />;
  }

  if (!hasAccess && !canAccessAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AccessRoute;
