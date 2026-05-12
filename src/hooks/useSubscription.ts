import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const OWNER_EMAIL = 'castroomath7@gmail.com';

/**
 * Hook de acesso. Suporta múltiplos concursos por usuário:
 * - Stripe subscription ativa → libera 'baependi'.
 * - pix_payments confirmados → libera os concurso_slug de cada um.
 * - profile.has_lifetime_access (retrocompat) → libera profile.concurso_slug.
 *
 * O array `accessibleConcursoSlugs` é a fonte de verdade.
 * `accessibleConcursoSlug` (singular) é mantido como retrocompat (deprecated).
 */
export function useSubscription() {
  const { user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<string>('inactive');
  const [planType, setPlanType] = useState<string>('none');
  const [accessExpiresAt, setAccessExpiresAt] = useState<string | null>(null);
  const [concursoSlug, setConcursoSlug] = useState<string>('baependi');
  const [hasLifetimeAccess, setHasLifetimeAccess] = useState<boolean>(false);
  const [accessibleConcursoSlugs, setAccessibleConcursoSlugs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setStatus('inactive');
      setPlanType('none');
      setAccessExpiresAt(null);
      setConcursoSlug('baependi');
      setHasLifetimeAccess(false);
      setAccessibleConcursoSlugs([]);
      setLoading(false);
      return;
    }

    if (user.email?.toLowerCase() === OWNER_EMAIL) {
      setStatus('active');
      setPlanType('owner');
      setAccessExpiresAt(null);
      setHasLifetimeAccess(true);
      // Owner enxerga tudo.
      setAccessibleConcursoSlugs(['baependi', 'alagoa']);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const run = async () => {
      setLoading(true);

      // Carrega profile + subscription Stripe + todos os pix_payments confirmados em paralelo.
      const profilePromise = (supabase as any)
        .from('profiles')
        .select('concurso_slug, has_lifetime_access')
        .eq('id', user.id)
        .maybeSingle();
      const subscriptionPromise = supabase
        .from('subscriptions')
        .select('status,plan_type,access_expires_at')
        .eq('user_id', user.id)
        .maybeSingle();
      const pixPromise = (supabase as any)
        .from('pix_payments')
        .select('concurso_slug')
        .eq('user_id', user.id)
        .eq('status', 'confirmed');

      const [profileRes, subscriptionRes, pixRes] = await Promise.all([
        profilePromise,
        subscriptionPromise,
        pixPromise,
      ]);

      if (cancelled) return;

      const profile = profileRes.data as
        | { concurso_slug?: string; has_lifetime_access?: boolean }
        | null;
      const profileSlug = profile?.concurso_slug ?? 'baependi';
      const lifetime = Boolean(profile?.has_lifetime_access);
      setConcursoSlug(profileSlug);
      setHasLifetimeAccess(lifetime);

      const slugs = new Set<string>();

      // Stripe ativo → Baependi.
      const subscription = subscriptionRes.data as
        | { status?: string; plan_type?: string; access_expires_at?: string | null }
        | null;
      const stripeActive = subscription?.status === 'active';
      if (stripeActive) slugs.add('baependi');

      // PIX confirmados → cada concurso_slug.
      const pixRows = (Array.isArray(pixRes.data) ? pixRes.data : []) as Array<{
        concurso_slug?: string | null;
      }>;
      for (const row of pixRows) {
        if (row.concurso_slug) slugs.add(row.concurso_slug);
      }

      // Retrocompat: profile.has_lifetime_access + concurso_slug
      // (PIX antigos só setaram a flag sem inserir em pix_payments).
      if (lifetime && profileSlug) slugs.add(profileSlug);

      const slugsList = Array.from(slugs);
      setAccessibleConcursoSlugs(slugsList);

      // Para os campos legados (status/planType/accessExpiresAt), mantém a lógica antiga
      // focada no concurso "principal" do user (profile.concurso_slug).
      if (profileSlug === 'alagoa') {
        const alagoaActive = slugs.has('alagoa');
        setStatus(alagoaActive ? 'active' : 'inactive');
        setPlanType(alagoaActive ? 'lifetime' : 'none');
        setAccessExpiresAt(null);
      } else if (subscription) {
        setStatus(subscription.status ?? 'inactive');
        setPlanType(subscription.plan_type ?? 'none');
        setAccessExpiresAt(subscription.access_expires_at ?? null);
      } else if (slugs.size > 0) {
        // Sem subscription Stripe, mas tem acesso por outra via.
        setStatus('active');
        setPlanType('lifetime');
        setAccessExpiresAt(null);
      } else {
        setStatus('inactive');
        setPlanType('none');
        setAccessExpiresAt(null);
      }

      setLoading(false);
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  /**
   * @deprecated use `accessibleConcursoSlugs`. Mantido para retrocompat —
   * retorna o primeiro slug acessível, ou null.
   */
  const accessibleConcursoSlug = useMemo<string | null>(() => {
    return accessibleConcursoSlugs[0] ?? null;
  }, [accessibleConcursoSlugs]);

  const hasAccess = useMemo(
    () => accessibleConcursoSlugs.length > 0,
    [accessibleConcursoSlugs],
  );

  return {
    hasAccess,
    accessibleConcursoSlug,
    accessibleConcursoSlugs,
    status,
    planType,
    accessExpiresAt,
    concursoSlug,
    hasLifetimeAccess,
    loading: authLoading || loading,
  } as const;
}
