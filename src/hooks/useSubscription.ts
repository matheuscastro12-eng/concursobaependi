import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const OWNER_EMAIL = 'castroomath7@gmail.com';

export function useSubscription() {
  const { user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<string>('inactive');
  const [planType, setPlanType] = useState<string>('none');
  const [accessExpiresAt, setAccessExpiresAt] = useState<string | null>(null);
  const [concursoSlug, setConcursoSlug] = useState<string>('baependi');
  const [hasLifetimeAccess, setHasLifetimeAccess] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setStatus('inactive');
      setPlanType('none');
      setAccessExpiresAt(null);
      setConcursoSlug('baependi');
      setHasLifetimeAccess(false);
      setLoading(false);
      return;
    }

    if (user.email?.toLowerCase() === OWNER_EMAIL) {
      setStatus('active');
      setPlanType('owner');
      setAccessExpiresAt(null);
      setHasLifetimeAccess(true);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const run = async () => {
      setLoading(true);

      // Profile (concurso_slug + has_lifetime_access) — campos novos, untyped.
      const profileRes = await (supabase as any)
        .from('profiles')
        .select('concurso_slug, has_lifetime_access')
        .eq('id', user.id)
        .maybeSingle();
      const profile = profileRes.data as
        | { concurso_slug?: string; has_lifetime_access?: boolean }
        | null;
      const slug = profile?.concurso_slug ?? 'baependi';
      const lifetime = Boolean(profile?.has_lifetime_access);

      if (cancelled) return;
      setConcursoSlug(slug);
      setHasLifetimeAccess(lifetime);

      // Alagoa: ignora Stripe — checa lifetime ou pix_payments confirmados.
      if (slug === 'alagoa') {
        if (lifetime) {
          setStatus('active');
          setPlanType('lifetime');
          setAccessExpiresAt(null);
          setLoading(false);
          return;
        }
        const pixRes = await (supabase as any)
          .from('pix_payments')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'confirmed')
          .limit(1);
        if (cancelled) return;
        const confirmed = Array.isArray(pixRes.data) && pixRes.data.length > 0;
        setStatus(confirmed ? 'active' : 'inactive');
        setPlanType(confirmed ? 'lifetime' : 'none');
        setAccessExpiresAt(null);
        setLoading(false);
        return;
      }

      // Baependi (e default): mantém Stripe.
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
    concursoSlug,
    hasLifetimeAccess,
    loading: authLoading || loading,
  } as const;
}
