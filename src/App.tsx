import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams, useLocation } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import PageSkeleton from "./components/PageSkeleton";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminRoute from "./components/auth/AdminRoute";
import AccessRoute from "./components/auth/AccessRoute";
import ConcursoAccessGuard from "./components/auth/ConcursoAccessGuard";
import { AuthProvider } from "./contexts/AuthContext";
import { useVisitorTracking } from "./hooks/useVisitorTracking";

import ConcursosLanding from "./pages/ConcursosLanding";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

const CargoDetalhe = lazy(() => import("./pages/CargoDetalhe"));
const Exam = lazy(() => import("./pages/Exam"));
const Auth = lazy(() => import("./pages/Auth"));
const CRM = lazy(() => import("./pages/CRM"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const PaymentAlagoa = lazy(() => import("./pages/PaymentAlagoa"));

const queryClient = new QueryClient();

const LazyFallback = () => <PageSkeleton variant="menu" />;

// Plug useVisitorTracking — precisa estar DENTRO de BrowserRouter + AuthProvider.
const TrackedRoutes = ({ children }: { children: React.ReactNode }) => {
  useVisitorTracking();
  return <>{children}</>;
};

// Redirects legados: /cargos/:slug e /exam (sem concurso) → baependi.
const LegacyCargoRedirect = () => {
  const { slug } = useParams<{ slug: string }>();
  return <Navigate to={`/c/baependi/cargos/${slug ?? ''}`} replace />;
};

const LegacyExamRedirect = () => {
  const location = useLocation();
  return <Navigate to={`/c/baependi/exam${location.search}`} replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <TrackedRoutes>
          <Suspense fallback={<LazyFallback />}>
            <Routes>
              {/* Landing inicial: seletor de concurso */}
              <Route path="/" element={<ConcursosLanding />} />

              {/* Por concurso */}
              <Route path="/c/:concursoSlug" element={<Home />} />
              <Route path="/c/:concursoSlug/cargos/:slug" element={<CargoDetalhe />} />
              <Route
                path="/c/alagoa/pagamento"
                element={
                  <ProtectedRoute>
                    <PaymentAlagoa />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/c/:concursoSlug/exam"
                element={
                  <AccessRoute>
                    <ConcursoAccessGuard>
                      <Exam />
                    </ConcursoAccessGuard>
                  </AccessRoute>
                }
              />

              {/* Backward-compat */}
              <Route path="/cargos/:slug" element={<LegacyCargoRedirect />} />
              <Route path="/exam" element={<LegacyExamRedirect />} />

              {/* Globais (não-por-concurso) */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/auth" element={<Auth />} />
              <Route
                path="/crm"
                element={
                  <AdminRoute>
                    <CRM />
                  </AdminRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          </TrackedRoutes>
        </BrowserRouter>
      </AuthProvider>
      <Analytics />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
