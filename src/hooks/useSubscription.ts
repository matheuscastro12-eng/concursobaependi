import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const OWNER_EMAIL = 'castroomath7@gmail.com';

export function useSubscription() {
  const { user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<string>('inactive');
  const [planType, setPlanType] = useState<string>('none');
  const [accessExpiresAt, setAccessExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setStatus('inactive');
      setPlanType('none');
      setAccessExpiresAt(null);
      setLoading(false);
      return;
    }

    if (user.email?.toLowerCase() === OWNER_EMAIL) {
      setStatus('active');
      setPlanType('owner');
      setAccessExpiresAt(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const run = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('subscriptions')
        .select('status,plan_type,access_expires_at')
        .eq('user_id', user.id)
        .maybeSingle();

      if (cancelled) return;

      if (error || !data) {
        setStatus('inactive');
        setPlanType('none');
        setAccessExpiresAt(null);
        setLoading(false);
        return;
      }

      setStatus(data.status ?? 'inactive');
      setPlanType(data.plan_type ?? 'none');
      setAccessExpiresAt(data.access_expires_at ?? null);
      setLoading(false);
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  const hasAccess = useMemo(() => status === 'active', [status]);

  return {
    hasAccess,
    status,
    planType,
    accessExpiresAt,
    loading: authLoading || loading,
  } as const;
}
