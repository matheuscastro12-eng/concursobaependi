import { useEffect, type ReactNode } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import PageSkeleton from '@/components/PageSkeleton';
import { useSubscription } from '@/hooks/useSubscription';
import { useAdmin } from '@/hooks/useAdmin';
import { useToast } from '@/hooks/use-toast';

/**
 * Garante que o usuário só acesse rotas internas do concurso que ele pagou.
 * - Se loading → skeleton.
 * - Se tem acesso ao concurso atual → renderiza children.
 * - Se tem acesso a OUTRO concurso → redireciona pra `/c/<seuSlug>` com toast.
 * - Se não tem acesso a nenhum → redireciona pra `/c/<concursoSlug>` (landing pública).
 * Admin (owner/CRM) passa direto.
 */
const ConcursoAccessGuard = ({ children }: { children: ReactNode }) => {
  const { concursoSlug } = useParams<{ concursoSlug: string }>();
  const { accessibleConcursoSlug, loading } = useSubscription();
  const { canAccessAdmin, loading: adminLoading } = useAdmin();
  const { toast } = useToast();

  const mismatched =
    !loading && !adminLoading && !canAccessAdmin &&
    accessibleConcursoSlug !== null &&
    accessibleConcursoSlug !== concursoSlug;

  useEffect(() => {
    if (mismatched) {
      toast({
        title: 'Acesso restrito',
        description: 'Você não tem acesso a este concurso.',
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

  if (accessibleConcursoSlug === concursoSlug) {
    return <>{children}</>;
  }

  if (accessibleConcursoSlug !== null) {
    return <Navigate to={`/c/${accessibleConcursoSlug}`} replace />;
  }

  // Sem acesso pago — manda pra landing pública do concurso (que tem CTA).
  return <Navigate to={`/c/${concursoSlug}`} replace />;
};

export default ConcursoAccessGuard;
