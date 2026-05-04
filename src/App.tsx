import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./contexts/AuthContext";
import PageSkeleton from "./components/PageSkeleton";

import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const Exam = lazy(() => import("./pages/Exam"));
const Provas = lazy(() => import("./pages/Provas"));
const ProvaReview = lazy(() => import("./pages/ProvaReview"));
const ProvaSimulado = lazy(() => import("./pages/ProvaSimulado"));

const queryClient = new QueryClient();

const LazyFallback = () => <PageSkeleton variant="menu" />;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light" enableSystem={false}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<LazyFallback />}>
              <Routes>
                <Route path="/" element={<Navigate to="/provas" replace />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/exam" element={<Exam />} />
                <Route path="/provas" element={<Provas />} />
                <Route path="/provas/:id/review" element={<ProvaReview />} />
                <Route path="/provas/:id/simulado" element={<ProvaSimulado />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
