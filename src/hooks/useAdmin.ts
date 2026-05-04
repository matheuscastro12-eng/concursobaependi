import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const OWNER_EMAIL = 'castroomath7@gmail.com';

export function useAdmin() {
  const { user, loading: authLoading } = useAuth();
  const [isAdminRole, setIsAdminRole] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setIsAdminRole(false);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const run = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (!cancelled) {
        setIsAdminRole(Boolean(data) && !error);
        setLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  const isOwnerEmail = user?.email?.toLowerCase() === OWNER_EMAIL;
  const canAccessAdmin = useMemo(() => isOwnerEmail, [isOwnerEmail]);

  return {
    isAdmin: isAdminRole,
    isOwnerEmail,
    canAccessAdmin,
    loading: authLoading || loading,
  } as const;
}
