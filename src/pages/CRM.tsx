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
import QuestionBankPanel from '@/components/crm/QuestionBankPanel';
import logoColor from '@/assets/logo-concursos.svg';

type ProfileRow = {
  user_id: string;
  email: string;
  full_name: string | null;
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
};

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const dateTime = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

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
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionRow[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const load = async (showSpinner = true) => {
    if (!canAccessAdmin) return;
    if (showSpinner) setLoading(true);
    else setRefreshing(true);

    const [profilesRes, subscriptionsRes, paymentsRes, rolesRes] = await Promise.all([
      supabase.from('profiles').select('user_id,email,full_name,created_at').order('created_at', { ascending: false }),
      supabase.from('subscriptions').select('user_id,status,plan_type,access_expires_at,updated_at'),
      supabase.from('payment_submissions').select('id,user_id,email,full_name,amount_cents,proof_storage_path,proof_file_name,status,review_notes,created_at,updated_at').order('created_at', { ascending: false }),
      supabase.from('user_roles').select('user_id,role'),
    ]);

    const firstError = profilesRes.error || subscriptionsRes.error || paymentsRes.error || rolesRes.error;

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

    return profiles.map((profile) => {
      const subscription = subscriptionMap.get(profile.user_id);
      const latestPayment = latestPaymentMap.get(profile.user_id) ?? null;
      const hasAccess = subscription?.status === 'active';

      return {
        userId: profile.user_id,
        email: profile.email,
        fullName: profile.full_name || 'Sem nome',
        createdAt: profile.created_at ?? null,
        hasAccess,
        subscriptionStatus: subscription?.status ?? 'inactive',
        planType: subscription?.plan_type ?? 'none',
        accessExpiresAt: subscription?.access_expires_at ?? null,
        paymentStatus: latestPayment?.status ?? 'sem-comprovante',
        latestPayment,
        isAdmin: adminSet.has(profile.user_id),
      };
    });
  }, [payments, profiles, roles, subscriptions]);

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

      return matchesSearch && matchesPayment && matchesAccess;
    });
  }, [accessFilter, crmUsers, paymentFilter, search]);

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
    if (!user) return;
    setBusyKey(`access:${targetUserId}`);

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
      toast({ title: 'Não conseguimos alterar o acesso', description: error.message, variant: 'destructive' });
      return;
    }

    toast({
      title: active ? 'Acesso liberado' : 'Acesso revogado',
      description: active ? 'O usuário já pode usar a área protegida.' : 'O usuário perdeu o acesso liberado manualmente.',
    });
    load(false);
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
        <QuestionBankPanel />

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

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
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

                  <aside className="xl:w-[300px] shrink-0 rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">Acesso do aluno</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Libere ou revogue o acesso manualmente.
                      </p>
                    </div>

                    <div className="grid gap-2">
                      <button
                        onClick={() => updateAccess(entry.userId, true)}
                        disabled={accessBusy || entry.hasAccess}
                        className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-blue-700 text-white text-sm font-semibold hover:bg-blue-800 transition-colors disabled:opacity-60"
                      >
                        {accessBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
                        Conceder acesso
                      </button>
                      <button
                        onClick={() => updateAccess(entry.userId, false)}
                        disabled={accessBusy || !entry.hasAccess}
                        className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:text-rose-700 hover:border-rose-200 transition-colors disabled:opacity-60"
                      >
                        <UserX className="h-4 w-4" />
                        Revogar acesso
                      </button>
                    </div>

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
