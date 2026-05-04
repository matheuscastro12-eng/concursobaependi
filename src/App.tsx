import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PageSkeleton from "./components/PageSkeleton";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminRoute from "./components/auth/AdminRoute";
import AccessRoute from "./components/auth/AccessRoute";
import { AuthProvider } from "./contexts/AuthContext";

import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

const CargoDetalhe = lazy(() => import("./pages/CargoDetalhe"));
const Exam = lazy(() => import("./pages/Exam"));
const Auth = lazy(() => import("./pages/Auth"));
const CRM = lazy(() => import("./pages/CRM"));
const Dashboard = lazy(() => import("./pages/Dashboard"));

const queryClient = new QueryClient();

const LazyFallback = () => <PageSkeleton variant="menu" />;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<LazyFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/cargos/:slug" element={<CargoDetalhe />} />
              <Route
                path="/exam"
                element={
                  <AccessRoute>
                    <Exam />
                  </AccessRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <AccessRoute>
                    <Dashboard />
                  </AccessRoute>
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
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
