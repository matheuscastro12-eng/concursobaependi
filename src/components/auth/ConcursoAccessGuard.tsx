import { useEffect, type ReactNode } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import PageSkeleton from '@/components/PageSkeleton';
import { useSubscription } from '@/hooks/useSubscription';
import { useAdmin } from '@/hooks/useAdmin';
import { useToast } from '@/hooks/use-toast';

/**
 * Garante que o usuário só acesse rotas internas dos concursos que ele pagou.
 * Suporta acesso múltiplo:
 * - Se o slug atual está em `accessibleConcursoSlugs` → libera.
 * - Se NÃO está, mas o user tem outro acesso → redireciona pro primeiro
 *   acessível com toast "você não tem acesso a este concurso ainda".
 * - Se array vazio → redireciona pra landing pública do concurso.
 * Admin (owner/CRM) passa direto.
 */
const ConcursoAccessGuard = ({ children }: { children: ReactNode }) => {
  const { concursoSlug } = useParams<{ concursoSlug: string }>();
  const { accessibleConcursoSlugs, loading } = useSubscription();
  const { canAccessAdmin, loading: adminLoading } = useAdmin();
  const { toast } = useToast();

  const hasCurrent = !!concursoSlug && accessibleConcursoSlugs.includes(concursoSlug);
  const hasOther = accessibleConcursoSlugs.length > 0 && !hasCurrent;
  const mismatched = !loading && !adminLoading && !canAccessAdmin && hasOther;

  useEffect(() => {
    if (mismatched) {
      toast({
        title: 'Acesso restrito',
        description: 'Você não tem acesso a este concurso ainda.',
        variant: 'destructive',
      });
    }
  }, [mismatched, toast]);

  if (loading || adminLoading) {
    return <PageSkeleton variant="dashboard" />;
  }

  if (canAccessAdmin) {
    return <>{children}</>;
  }

  if (hasCurrent) {
    return <>{children}</>;
  }

  if (accessibleConcursoSlugs.length > 0) {
    return <Navigate to={`/c/${accessibleConcursoSlugs[0]}`} replace />;
  }

  // Sem acesso pago — manda pra landing pública do concurso (que tem CTA).
  return <Navigate to={`/c/${concursoSlug}`} replace />;
};

export default ConcursoAccessGuard;
