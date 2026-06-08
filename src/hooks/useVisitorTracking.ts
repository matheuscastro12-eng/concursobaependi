import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';

// Rotas que NÃO contam pra métrica (são internas/administrativas).
const EXCLUDED_PATH_PREFIXES = ['/crm'];

const isExcludedPath = (pathname: string): boolean =>
  EXCLUDED_PATH_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));

const VISITOR_KEY = 'concursosai.visitor_id';

const ensureVisitorId = (): string => {
  if (typeof window === 'undefined') return 'ssr';
  let id = window.localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id =
      typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `v_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    try {
      window.localStorage.setItem(VISITOR_KEY, id);
    } catch {
      /* localStorage bloqueado — segue sem persistir */
    }
  }
  return id;
};

const trimUserAgent = (ua: string): string => ua.slice(0, 240);

// Trava anti-loop: nenhum humano gera muitos pageviews em poucos segundos.
// Se passar do limite na janela, suprime o tracking (um redirect loop /↔/dashboard
// já chegou a gerar ~23k pageviews antes desta trava existir).
const RATE_WINDOW_MS = 5000;
const RATE_MAX_IN_WINDOW = 8;
const recentTracks: number[] = [];

const allowTrack = (): boolean => {
  const now = Date.now();
  while (recentTracks.length && now - recentTracks[0] > RATE_WINDOW_MS) {
    recentTracks.shift();
  }
  if (recentTracks.length >= RATE_MAX_IN_WINDOW) return false;
  recentTracks.push(now);
  return true;
};

/**
 * Loga 1 pageview pra cada navegação (rota client-side ou primeira carga).
 * Plug em alguma raiz que esteja DENTRO do <BrowserRouter>; ele se ativa
 * automaticamente em cada mudança de pathname. Fire-and-forget — falha
 * silenciosa se offline ou se RLS bloquear.
 */
export const useVisitorTracking = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { canAccessAdmin } = useAdmin();

  useEffect(() => {
    const path = location.pathname || '/';

    // 1) Não conta rotas internas (CRM e afins).
    if (isExcludedPath(path)) return;
    // 2) Não conta pageviews de admins (você operando o app não é métrica).
    if (canAccessAdmin) return;
    // 3) Trava anti-loop: suprime rajadas anormais (redirect loop etc).
    if (!allowTrack()) return;

    const visitorId = ensureVisitorId();

    // Usa RPC SECURITY DEFINER pra bypassar RLS.
    // Importante: o Supabase JS client é LAZY — só dispara o fetch quando
    // a Promise é "consumida" (.then/.catch/await).
    supabase
      .rpc('track_pageview', {
        _visitor_id: visitorId,
        _path: path,
        _referrer: typeof document !== 'undefined' ? document.referrer || null : null,
        _user_agent: typeof navigator !== 'undefined' ? trimUserAgent(navigator.userAgent) : null,
      })
      .then(() => {
        /* sucesso silencioso */
      })
      .catch(() => {
        /* falha silenciosa — offline, RLS bloqueado etc */
      });
  }, [location.pathname, user?.id, canAccessAdmin]);
};

// Mantida por compat com chamadas antigas no codebase (era stub).
export async function convertVisitorToSignup(_userId: string): Promise<void> {
  // No-op: o tracking já correlaciona via user_id quando o aluno faz login.
}
