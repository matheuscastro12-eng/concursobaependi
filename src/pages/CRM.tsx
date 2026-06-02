import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Mail,
  Search,
  ShieldCheck,
  Sparkles,
  UserCheck,
  UserX,
  Wallet,
  XCircle,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';
import TrafficMetrics from '@/components/crm/TrafficMetrics';
import logoColor from '@/assets/logo-concursos.svg';

type ProfileRow = {
  user_id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  concurso_slug?: string | null;
  has_lifetime_access?: boolean | null;
};

type PixPaymentRow = {
  id: string;
  user_id: string;
  concurso_slug: string;
  valor_centavos: number;
  status: 'pending' | 'confirmed' | 'rejected' | 'expired';
  comprovante_url: string | null;
  confirmed_at: string | null;
  confirmed_by: string | null;
  created_at: string;
};

type SubscriptionRow = {
  user_id: string;
  status: string;
  plan_type: string;
  access_expires_at: string | null;
  updated_at: string;
};

type PaymentRow = {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  amount_cents: number;
  proof_storage_path: string;
  proof_file_name: string;
  status: string;
  review_notes: string | null;
  created_at: string;
  updated_at: string;
};

type RoleRow = {
  user_id: string;
  role: 'admin' | 'user';
};

type CRMUser = {
  userId: string;
  email: string;
  fullName: string;
  createdAt: string | null;
  hasAccess: boolean;
  subscriptionStatus: string;
  planType: string;
  accessExpiresAt: string | null;
  paymentStatus: string;
  latestPayment: PaymentRow | null;
  isAdmin: boolean;
  concursoSlug: string;
  hasLifetimeAccess: boolean;
  accessSlugs: string[];
};

type AiCallRow = {
  id: string;
  created_at: string;
  feature: string;
  source: string | null;
  concurso_slug: string | null;
  meta: Record<string, unknown> | null;
  user_id: string;
  full_name: string | null;
  email: string | null;
};

type AiSummary = {
  total: number;
  today: number;
  last_7d: number;
  ia_calls: number;
  ia_today: number;
  by_feature: { feature: string; cnt: number }[];
  by_source: { source: string; cnt: number }[];
  by_concurso: { concurso_slug: string; cnt: number }[];
  by_day: { day: string; total: number; ia: number }[];
};

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const dateTime = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

const FEATURE_LABEL: Record<string, string> = {
  exam: 'Simulado',
  assistant: 'Tutor IA',
  explain: 'Explicação',
};

const CRM = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { canAccessAdmin } = useAdmin();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'todos' | 'pending' | 'approved' | 'rejected'>('todos');
  const [accessFilter, setAccessFilter] = useState<'todos' | 'com-acesso' | 'sem-acesso'>('todos');
  const [concursoFilter, setConcursoFilter] = useState<'todos' | 'baependi' | 'alagoa'>('todos');
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionRow[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [pixPayments, setPixPayments] = useState<PixPaymentRow[]>([]);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState<AiSummary | null>(null);
  const [aiHistory, setAiHistory] = useState<AiCallRow[]>([]);

  const load = async (showSpinner = true) => {
    if (!canAccessAdmin) return;
    if (showSpinner) setLoading(true);
    else setRefreshing(true);

    const [profilesRes, subscriptionsRes, paymentsRes, rolesRes, pixRes, aiSummaryRes, aiHistRes] = await Promise.all([
      (supabase as any).from('profiles').select('user_id,email,full_name,created_at,concurso_slug,has_lifetime_access').order('created_at', { ascending: false }),
      supabase.from('subscriptions').select('user_id,status,plan_type,access_expires_at,updated_at'),
      supabase.from('payment_submissions').select('id,user_id,email,full_name,amount_cents,proof_storage_path,proof_file_name,status,review_notes,created_at,updated_at').order('created_at', { ascending: false }),
      supabase.from('user_roles').select('user_id,role'),
      (supabase as any).from('pix_payments').select('id,user_id,concurso_slug,valor_centavos,status,comprovante_url,confirmed_at,confirmed_by,created_at').order('created_at', { ascending: false }),
      (supabase as any).rpc('ai_usage_summary'),
      (supabase as any).rpc('ai_call_history', { _limit: 200, _concurso_slug: null }),
    ]);

    const firstError = profilesRes.error || subscriptionsRes.error || paymentsRes.error || rolesRes.error || pixRes.error;

    if (firstError) {
      toast({
        title: 'Não conseguimos carregar o CRM',
        description: firstError.message,
        variant: 'destructive',
      });
    } else {
      setProfiles((profilesRes.data as ProfileRow[]) ?? []);
      setSubscriptions((subscriptionsRes.data as SubscriptionRow[]) ?? []);
      setPayments((paymentsRes.data as PaymentRow[]) ?? []);
      setRoles((rolesRes.data as RoleRow[]) ?? []);
      setPixPayments((pixRes.data as PixPaymentRow[]) ?? []);
      // RPCs de IA são best-effort — se falharem, não derrubam o CRM.
      if (!aiSummaryRes?.error && aiSummaryRes?.data) setAiSummary(aiSummaryRes.data as AiSummary);
      if (!aiHistRes?.error && Array.isArray(aiHistRes?.data)) setAiHistory(aiHistRes.data as AiCallRow[]);
    }

    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    load();
  }, [canAccessAdmin]);

  const crmUsers = useMemo<CRMUser[]>(() => {
    const subscriptionMap = new Map(subscriptions.map((item) => [item.user_id, item]));
    const adminSet = new Set(roles.filter((item) => item.role === 'admin').map((item) => item.user_id));
    const latestPaymentMap = new Map<string, PaymentRow>();

    for (const payment of payments) {
      if (!latestPaymentMap.has(payment.user_id)) {
        latestPaymentMap.set(payment.user_id, payment);
      }
    }

    // Indexa PIX confirmados por user → conjunto de concurso_slug.
    const confirmedPixByUser = new Map<string, Set<string>>();
    for (const pix of pixPayments) {
      if (pix.status !== 'confirmed') continue;
      if (!confirmedPixByUser.has(pix.user_id)) confirmedPixByUser.set(pix.user_id, new Set());
      confirmedPixByUser.get(pix.user_id)!.add(pix.concurso_slug);
    }

    return profiles.map((profile) => {
      const subscription = subscriptionMap.get(profile.user_id);
      const latestPayment = latestPaymentMap.get(profile.user_id) ?? null;
      const stripeActive = subscription?.status === 'active';

      const concursoSlug = profile.concurso_slug ?? 'baependi';
      const hasLifetime = Boolean(profile.has_lifetime_access);

      // Acessos efetivos: Stripe → baependi, cada PIX confirmado → seu slug,
      // retrocompat (lifetime + concurso_slug do profile).
      const accessSet = new Set<string>();
      if (stripeActive) accessSet.add('baependi');
      const pixSet = confirmedPixByUser.get(profile.user_id);
      if (pixSet) pixSet.forEach((s) => accessSet.add(s));
      if (hasLifetime && concursoSlug) accessSet.add(concursoSlug);
      const accessSlugs = Array.from(accessSet);
      const computedAccess = accessSlugs.length > 0;

      return {
        userId: profile.user_id,
        email: profile.email,
        fullName: profile.full_name || 'Sem nome',
        createdAt: profile.created_at ?? null,
        hasAccess: computedAccess,
        subscriptionStatus: subscription?.status ?? (hasLifetime ? 'active' : 'inactive'),
        planType: subscription?.plan_type ?? (hasLifetime ? 'lifetime' : 'none'),
        accessExpiresAt: subscription?.access_expires_at ?? null,
        paymentStatus: latestPayment?.status ?? 'sem-comprovante',
        latestPayment,
        isAdmin: adminSet.has(profile.user_id),
        concursoSlug,
        hasLifetimeAccess: hasLifetime,
        accessSlugs,
      };
    });
  }, [payments, profiles, roles, subscriptions, pixPayments]);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();

    return crmUsers.filter((item) => {
      const matchesSearch =
        !term ||
        item.fullName.toLowerCase().includes(term) ||
        item.email.toLowerCase().includes(term);

      const matchesPayment =
        paymentFilter === 'todos' || item.paymentStatus === paymentFilter;

      const matchesAccess =
        accessFilter === 'todos' ||
        (accessFilter === 'com-acesso' && item.hasAccess) ||
        (accessFilter === 'sem-acesso' && !item.hasAccess);

      // Filtro mostra usuários que TÊM ACESSO ao concurso (não apenas o slug
      // inicial do cadastro). Fallback: se nunca teve acesso a nenhum, ainda
      // aparece no filtro do concurso de cadastro pra não sumir do CRM.
      const matchesConcurso =
        concursoFilter === 'todos' ||
        item.accessSlugs.includes(concursoFilter) ||
        (item.accessSlugs.length === 0 && item.concursoSlug === concursoFilter);

      return matchesSearch && matchesPayment && matchesAccess && matchesConcurso;
    });
  }, [accessFilter, concursoFilter, crmUsers, paymentFilter, search]);

  const stats = useMemo(() => {
    return {
      total: crmUsers.length,
      pendingPayments: crmUsers.filter((item) => item.paymentStatus === 'pending').length,
      activeAccess: crmUsers.filter((item) => item.hasAccess).length,
      withoutProof: crmUsers.filter((item) => item.paymentStatus === 'sem-comprovante').length,
    };
  }, [crmUsers]);

  const updatePaymentStatus = async (paymentId: string, status: 'approved' | 'rejected') => {
    if (!user) return;
    setBusyKey(paymentId);

    const { error } = await supabase
      .from('payment_submissions')
      .update({
        status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
      })
      .eq('id', paymentId);

    setBusyKey(null);

    if (error) {
      toast({ title: 'Não conseguimos atualizar o pagamento', description: error.message, variant: 'destructive' });
      return;
    }

    toast({
      title: status === 'approved' ? 'Pagamento confirmado' : 'Pagamento marcado como rejeitado',
      description: 'O status do comprovante foi atualizado.',
    });
    load(false);
  };

  const updateAccess = async (targetUserId: string, active: boolean) => {
    // Mantido por retrocompat — agora trata como toggle do Baependi (Stripe-like).
    return updateAccessForConcurso(targetUserId, 'baependi', active);
  };

  const updateAccessForConcurso = async (
    targetUserId: string,
    concursoSlug: 'baependi' | 'alagoa',
    active: boolean,
  ) => {
    if (!user) return;
    setBusyKey(`access:${targetUserId}:${concursoSlug}`);

    if (concursoSlug === 'baependi') {
      const { error } = await supabase.from('subscriptions').upsert(
        {
          user_id: targetUserId,
          status: active ? 'active' : 'inactive',
          plan_type: 'manual',
          granted_by: user.id,
          access_expires_at: null,
        },
        { onConflict: 'user_id' },
      );
      setBusyKey(null);
      if (error) {
        toast({ title: 'Falha ao alterar acesso Baependi', description: error.message, variant: 'destructive' });
        return;
      }
    } else {
      // Alagoa: grava um pix_payments "manual" confirmado/rejeitado e
      // sincroniza has_lifetime_access.
      if (active) {
        const upsertRes = await (supabase as any).from('pix_payments').insert({
          user_id: targetUserId,
          concurso_slug: 'alagoa',
          valor_centavos: 0,
          status: 'confirmed',
          comprovante_url: 'manual_grant',
          confirmed_at: new Date().toISOString(),
          confirmed_by: user.id,
        });
        if (upsertRes.error) {
          setBusyKey(null);
          toast({ title: 'Falha ao liberar Alagoa', description: upsertRes.error.message, variant: 'destructive' });
          return;
        }
        // Profile flag (retrocompat de useSubscription)
        await (supabase as any)
          .from('profiles')
          .update({ has_lifetime_access: true })
          .eq('id', targetUserId);
      } else {
        // Revogar = marca todos os pix_payments confirmados de Alagoa como rejeitados
        const revokeRes = await (supabase as any)
          .from('pix_payments')
          .update({ status: 'rejected' })
          .eq('user_id', targetUserId)
          .eq('concurso_slug', 'alagoa')
          .eq('status', 'confirmed');
        if (revokeRes.error) {
          setBusyKey(null);
          toast({ title: 'Falha ao revogar Alagoa', description: revokeRes.error.message, variant: 'destructive' });
          return;
        }
        // Reset lifetime flag se o slug original do user era alagoa
        await (supabase as any)
          .from('profiles')
          .update({ has_lifetime_access: false })
          .eq('id', targetUserId)
          .eq('concurso_slug', 'alagoa');
      }
      setBusyKey(null);
    }

    toast({
      title: active ? `Acesso liberado · ${concursoSlug === 'alagoa' ? 'Alagoa' : 'Baependi'}` : `Acesso revogado · ${concursoSlug === 'alagoa' ? 'Alagoa' : 'Baependi'}`,
      description: active ? 'O usuário já pode usar a área protegida desse concurso.' : 'O usuário perdeu o acesso liberado manualmente.',
    });
    load(false);
  };

  const updatePixStatus = async (payment: PixPaymentRow, status: 'confirmed' | 'rejected') => {
    if (!user) return;
    setBusyKey(`pix:${payment.id}`);

    const updateRes = await (supabase as any)
      .from('pix_payments')
      .update({
        status,
        confirmed_at: status === 'confirmed' ? new Date().toISOString() : null,
        confirmed_by: status === 'confirmed' ? user.id : null,
      })
      .eq('id', payment.id);

    if (updateRes.error) {
      setBusyKey(null);
      toast({ title: 'Falha ao atualizar PIX', description: updateRes.error.message, variant: 'destructive' });
      return;
    }

    // Se aprovou, libera acesso vitalício no profile
    if (status === 'confirmed') {
      const profileRes = await (supabase as any)
        .from('profiles')
        .update({ has_lifetime_access: true })
        .eq('id', payment.user_id);
      if (profileRes.error) {
        toast({
          title: 'PIX confirmado, mas profile falhou',
          description: profileRes.error.message,
          variant: 'destructive',
        });
      }
    }

    setBusyKey(null);
    toast({
      title: status === 'confirmed' ? 'PIX confirmado' : 'PIX rejeitado',
      description: status === 'confirmed' ? 'Acesso vitalício liberado.' : 'Pagamento marcado como rejeitado.',
    });
    load(false);
  };

  const openPixComprovante = async (payment: PixPaymentRow) => {
    if (!payment.comprovante_url) return;
    setBusyKey(`pix-proof:${payment.id}`);
    const { data, error } = await supabase.storage
      .from('pix-comprovantes')
      .createSignedUrl(payment.comprovante_url, 3600);
    setBusyKey(null);
    if (error || !data?.signedUrl) {
      toast({
        title: 'Não conseguimos abrir o comprovante',
        description: error?.message ?? 'A URL assinada não foi gerada.',
        variant: 'destructive',
      });
      return;
    }
    window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
  };

  const openProof = async (payment: PaymentRow) => {
    setBusyKey(`proof:${payment.id}`);
    const { data, error } = await supabase.storage
      .from('payment-proofs')
      .createSignedUrl(payment.proof_storage_path, 3600);
    setBusyKey(null);

    if (error || !data?.signedUrl) {
      toast({
        title: 'Não conseguimos abrir o comprovante',
        description: error?.message ?? 'A URL assinada não foi gerada.',
        variant: 'destructive',
      });
      return;
    }

    window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-blue-700" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="max-w-[1440px] mx-auto h-16 px-4 sm:px-6 lg:px-10 xl:px-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-700 transition-colors"
              title="Sair do CRM e ir para o dashboard"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao app
            </button>
            <div className="h-8 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <img src={logoColor} alt="ConcursosAI" className="h-8 w-8" />
              <div>
                <p className="font-['Manrope'] font-extrabold tracking-tight">CRM ConcursosAI</p>
                <p className="text-xs text-slate-500">Acesso restrito ao administrador</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => load(false)}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:text-blue-700 hover:border-blue-200 transition-colors"
          >
            {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            Atualizar
          </button>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-8 space-y-8">
        <TrafficMetrics />

        <section className="grid gap-4 md:grid-cols-4">
          {[
            ['Usuários', String(stats.total), Mail],
            ['Pagamentos pendentes', String(stats.pendingPayments), Wallet],
            ['Com acesso', String(stats.activeAccess), UserCheck],
            ['Sem comprovante', String(stats.withoutProof), UserX],
          ].map(([label, value, Icon]) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-blue-700" />
              </div>
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-1 font-['Manrope'] text-3xl font-extrabold tracking-tight text-slate-950">{value}</p>
            </div>
          ))}
        </section>

        {/* ── Pagamentos PIX pendentes (Alagoa) ───────────────────── */}
        {pixPayments.some((p) => p.status === 'pending') && (
          <section className="rounded-2xl border border-amber-200 bg-amber-50/40 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <div className="mb-4 flex items-center gap-2">
              <Wallet className="h-5 w-5 text-amber-700" />
              <h2 className="font-['Manrope'] text-lg font-extrabold text-slate-950">
                Pagamentos PIX pendentes
              </h2>
              <span className="ml-2 rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-xs font-bold">
                {pixPayments.filter((p) => p.status === 'pending').length}
              </span>
            </div>
            <div className="grid gap-3">
              {pixPayments
                .filter((p) => p.status === 'pending')
                .map((payment) => {
                  const userProfile = profiles.find((pr) => pr.user_id === payment.user_id);
                  const busy = busyKey === `pix:${payment.id}` || busyKey === `pix-proof:${payment.id}`;
                  return (
                    <div key={payment.id} className="rounded-xl border border-amber-200 bg-white p-4">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-extrabold text-slate-950">
                              {userProfile?.full_name || 'Sem nome'}
                            </p>
                            <ConcursoBadge slug={payment.concurso_slug} />
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5">{userProfile?.email ?? payment.user_id}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {currency.format(payment.valor_centavos / 100)} · enviado em {dateTime.format(new Date(payment.created_at))}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {payment.comprovante_url && (
                            <button
                              onClick={() => openPixComprovante(payment)}
                              disabled={busy}
                              className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:text-blue-700 hover:border-blue-200 transition-colors disabled:opacity-60"
                            >
                              {busyKey === `pix-proof:${payment.id}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ExternalLink className="h-3.5 w-3.5" />}
                              Abrir comprovante
                            </button>
                          )}
                          <button
                            onClick={() => updatePixStatus(payment, 'confirmed')}
                            disabled={busy}
                            className="inline-flex items-center gap-2 h-9 px-3 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-60"
                          >
                            {busyKey === `pix:${payment.id}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                            Aprovar
                          </button>
                          <button
                            onClick={() => updatePixStatus(payment, 'rejected')}
                            disabled={busy}
                            className="inline-flex items-center gap-2 h-9 px-3 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors disabled:opacity-60"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Rejeitar
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </section>
        )}

        {/* ── Histórico de chamadas de IA ─────────────────────────── */}
        <AiHistorySection
          summary={aiSummary}
          history={aiHistory}
          concursoFilter={concursoFilter}
        />

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div className="mb-3 inline-flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {(['todos', 'baependi', 'alagoa'] as const).map((slug) => (
              <button
                key={slug}
                onClick={() => setConcursoFilter(slug)}
                className={`px-3.5 h-9 rounded-lg transition-all capitalize ${
                  concursoFilter === slug ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {slug === 'todos' ? 'Todos concursos' : slug === 'baependi' ? 'Baependi' : 'Alagoa'}
              </button>
            ))}
          </div>
          <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nome ou email"
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-colors"
              />
            </div>

            <div className="inline-flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              {(['todos', 'pending', 'approved', 'rejected'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setPaymentFilter(status)}
                  className={`px-3.5 h-9 rounded-lg transition-all ${
                    paymentFilter === status ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {status === 'todos'
                    ? 'Todos os pagamentos'
                    : status === 'pending'
                      ? 'Pendentes'
                      : status === 'approved'
                        ? 'Aprovados'
                        : 'Rejeitados'}
                </button>
              ))}
            </div>

            <div className="inline-flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              {(['todos', 'com-acesso', 'sem-acesso'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setAccessFilter(status)}
                  className={`px-3.5 h-9 rounded-lg transition-all ${
                    accessFilter === status ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {status === 'todos' ? 'Todos os acessos' : status === 'com-acesso' ? 'Com acesso' : 'Sem acesso'}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4">
          {filteredUsers.map((entry) => {
            const payment = entry.latestPayment;
            const paymentBusy = payment ? busyKey === payment.id || busyKey === `proof:${payment.id}` : false;
            const accessBusy = busyKey === `access:${entry.userId}`;

            return (
              <article key={entry.userId} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-5">
                  <div className="space-y-3 min-w-0">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-['Manrope'] text-xl font-extrabold tracking-tight text-slate-950">
                          {entry.fullName}
                        </h2>
                        {entry.isAdmin && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 border border-amber-200">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Admin
                          </span>
                        )}
                        {entry.accessSlugs.length > 0 ? (
                          entry.accessSlugs.map((s) => <ConcursoBadge key={s} slug={s} />)
                        ) : (
                          // Sem acessos ainda — mostra o slug do cadastro como referência.
                          <ConcursoBadge slug={entry.concursoSlug} muted />
                        )}
                      </div>
                      <p className="mt-1 text-sm text-slate-600">{entry.email}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <StatusChip
                        tone={entry.paymentStatus === 'approved' ? 'green' : entry.paymentStatus === 'pending' ? 'amber' : entry.paymentStatus === 'rejected' ? 'red' : 'slate'}
                        label={`Pagamento: ${labelPaymentStatus(entry.paymentStatus)}`}
                      />
                      <StatusChip
                        tone={entry.hasAccess ? 'green' : 'slate'}
                        label={`Acesso: ${entry.hasAccess ? 'Liberado' : 'Sem acesso'}`}
                      />
                      <StatusChip tone="slate" label={`Plano: ${entry.planType}`} />
                      {entry.createdAt && <StatusChip tone="slate" label={`Cadastro: ${dateTime.format(new Date(entry.createdAt))}`} />}
                    </div>

                    {payment ? (
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                          <div>
                            <p className="text-sm font-bold text-slate-900">Comprovante enviado</p>
                            <p className="mt-1 text-sm text-slate-600">
                              {payment.proof_file_name} · {currency.format(payment.amount_cents / 100)}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              Enviado em {dateTime.format(new Date(payment.created_at))}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => openProof(payment)}
                              disabled={paymentBusy}
                              className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:text-blue-700 hover:border-blue-200 transition-colors disabled:opacity-60"
                            >
                              {busyKey === `proof:${payment.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
                              Abrir comprovante
                            </button>
                            <button
                              onClick={() => updatePaymentStatus(payment.id, 'approved')}
                              disabled={paymentBusy || payment.status === 'approved'}
                              className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-60"
                            >
                              {busyKey === payment.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                              Confirmar pagamento
                            </button>
                            <button
                              onClick={() => updatePaymentStatus(payment.id, 'rejected')}
                              disabled={paymentBusy || payment.status === 'rejected'}
                              className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 transition-colors disabled:opacity-60"
                            >
                              <XCircle className="h-4 w-4" />
                              Rejeitar
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                        Esse usuário ainda não enviou comprovante de pagamento.
                      </div>
                    )}
                  </div>

                  <aside className="xl:w-[320px] shrink-0 rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">Acesso do aluno</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Libere ou revogue acesso por concurso.
                      </p>
                    </div>

                    {(['baependi', 'alagoa'] as const).map((slug) => {
                      const slugLabel = slug === 'alagoa' ? 'Alagoa' : 'Baependi';
                      const hasThis = entry.accessSlugs.includes(slug);
                      const busy = busyKey === `access:${entry.userId}:${slug}`;
                      const tone = slug === 'alagoa' ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-blue-700 hover:bg-blue-800';
                      return (
                        <div key={slug} className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-slate-900">{slugLabel}</p>
                            <span className={`text-[10px] font-bold uppercase tracking-[0.12em] ${hasThis ? 'text-emerald-700' : 'text-slate-400'}`}>
                              {hasThis ? 'Liberado' : 'Sem acesso'}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => updateAccessForConcurso(entry.userId, slug, true)}
                              disabled={busy || hasThis}
                              className={`inline-flex items-center justify-center gap-1.5 h-9 px-2 rounded-lg ${tone} text-white text-xs font-semibold transition-colors disabled:opacity-50`}
                            >
                              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserCheck className="h-3.5 w-3.5" />}
                              Liberar
                            </button>
                            <button
                              onClick={() => updateAccessForConcurso(entry.userId, slug, false)}
                              disabled={busy || !hasThis}
                              className="inline-flex items-center justify-center gap-1.5 h-9 px-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:text-rose-700 hover:border-rose-200 transition-colors disabled:opacity-50"
                            >
                              <UserX className="h-3.5 w-3.5" />
                              Revogar
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-500 space-y-1">
                      <p><strong className="text-slate-700">Status atual:</strong> {entry.subscriptionStatus}</p>
                      <p><strong className="text-slate-700">Plano:</strong> {entry.planType}</p>
                      <p><strong className="text-slate-700">Expira em:</strong> {entry.accessExpiresAt ? dateTime.format(new Date(entry.accessExpiresAt)) : 'Sem data definida'}</p>
                    </div>
                  </aside>
                </div>
              </article>
            );
          })}

          {filteredUsers.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
              Nenhum usuário encontrado para esse filtro.
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

function labelPaymentStatus(status: string) {
  if (status === 'pending') return 'Pendente';
  if (status === 'approved') return 'Aprovado';
  if (status === 'rejected') return 'Rejeitado';
  return 'Sem comprovante';
}

function SourceBadge({ source }: { source: string | null }) {
  if (source === 'ia') {
    return (
      <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10.5px] font-bold text-amber-700">
        IA · custo
      </span>
    );
  }
  if (source === 'bank') {
    return (
      <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10.5px] font-bold text-blue-700">
        Banco · grátis
      </span>
    );
  }
  if (source === 'cache') {
    return (
      <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10.5px] font-bold text-slate-500">
        Cache · grátis
      </span>
    );
  }
  return <span className="text-[10.5px] text-slate-400">—</span>;
}

function AiHistorySection({
  summary,
  history,
  concursoFilter,
}: {
  summary: AiSummary | null;
  history: AiCallRow[];
  concursoFilter: 'todos' | 'baependi' | 'alagoa';
}) {
  const rows =
    concursoFilter === 'todos'
      ? history
      : history.filter((r) => (r.concurso_slug ?? 'baependi') === concursoFilter);

  const cards: [string, string, string][] = [
    ['Chamadas totais', String(summary?.total ?? 0), 'text-slate-900'],
    ['Hoje', String(summary?.today ?? 0), 'text-slate-900'],
    ['Últimos 7 dias', String(summary?.last_7d ?? 0), 'text-slate-900'],
    ['IA (custo) — total', String(summary?.ia_calls ?? 0), 'text-amber-700'],
    ['IA hoje', String(summary?.ia_today ?? 0), 'text-amber-700'],
  ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-blue-700" />
        <h2 className="font-['Manrope'] text-lg font-extrabold text-slate-950">
          Histórico de IA
        </h2>
        <span className="ml-1 text-xs text-slate-400">
          chamadas de geração e tutor
        </span>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">
        {cards.map(([label, value, color]) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
            <p className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
            <p className={`mt-0.5 font-['Manrope'] text-2xl font-extrabold tracking-tight ${color}`}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Tabela de histórico */}
      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
          Nenhuma chamada de IA registrada ainda
          {concursoFilter !== 'todos' ? ' para este concurso.' : '.'}
        </div>
      ) : (
        <div className="overflow-x-auto -mx-1">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <th className="py-2 pr-3">Aluno</th>
                <th className="py-2 pr-3">Tipo</th>
                <th className="py-2 pr-3">Origem</th>
                <th className="py-2 pr-3">Concurso</th>
                <th className="py-2 pr-3">Tema</th>
                <th className="py-2 pr-3 whitespace-nowrap">Quando</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 100).map((r) => {
                const tema = (r.meta?.tema as string | undefined) ?? '—';
                return (
                  <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                    <td className="py-2.5 pr-3">
                      <p className="font-semibold text-slate-800 truncate max-w-[180px]">
                        {r.full_name || 'Sem nome'}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate max-w-[180px]">{r.email}</p>
                    </td>
                    <td className="py-2.5 pr-3 text-slate-700">
                      {FEATURE_LABEL[r.feature] ?? r.feature}
                    </td>
                    <td className="py-2.5 pr-3">
                      <SourceBadge source={r.source} />
                    </td>
                    <td className="py-2.5 pr-3">
                      {r.concurso_slug ? <ConcursoBadge slug={r.concurso_slug} /> : <span className="text-slate-400">—</span>}
                    </td>
                    <td className="py-2.5 pr-3 text-slate-600 truncate max-w-[220px]" title={tema}>
                      {tema}
                    </td>
                    <td className="py-2.5 pr-3 text-[12px] text-slate-500 whitespace-nowrap">
                      {dateTime.format(new Date(r.created_at))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {rows.length > 100 && (
            <p className="mt-3 text-center text-xs text-slate-400">
              Mostrando as 100 mais recentes de {rows.length}.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

export function ConcursoBadge({ slug, muted = false }: { slug: string; muted?: boolean }) {
  const isAlagoa = slug === 'alagoa';
  const label = isAlagoa ? 'Alagoa' : 'Baependi';
  const tone = muted
    ? 'bg-slate-50 text-slate-500 border-slate-200 border-dashed'
    : isAlagoa
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : 'bg-blue-50 text-blue-700 border-blue-200';
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold ${tone}`}>
      {muted ? `${label} (cadastro)` : label}
    </span>
  );
}

function StatusChip({ label, tone }: { label: string; tone: 'green' | 'amber' | 'red' | 'slate' }) {
  const toneClass =
    tone === 'green'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : tone === 'amber'
        ? 'bg-amber-50 text-amber-700 border-amber-200'
        : tone === 'red'
          ? 'bg-rose-50 text-rose-700 border-rose-200'
          : 'bg-slate-100 text-slate-600 border-slate-200';

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 font-semibold ${toneClass}`}>
      {label}
    </span>
  );
}

export default CRM;
