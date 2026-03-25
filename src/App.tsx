import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'sonner';
import { useEffect } from 'react';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';

// Pages — Auth / Onboarding
import Auth from '@/pages/Auth';
import Onboarding from '@/pages/Onboarding';

// Pages — Core
import Dashboard from '@/pages/Dashboard';
import IncomeDetails from '@/pages/income/IncomeDetails';
import ExpenseDetails from '@/pages/expenses/ExpenseDetails';
import ExpenseEntry from '@/pages/expenses/ExpenseEntry';

// Pages — Misc
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 1 },
  },
});

/**
 * Root handler:
 * - Unauthenticated → show Auth page
 * - Authenticated, incomplete onboarding → /onboarding
 * - Authenticated, complete → /dashboard
 */
function RootRedirect() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, userProfile } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) return;
    if (userProfile === null) return; // still loading profile

    if (!userProfile.isRegistrationComplete) {
      navigate('/onboarding', { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, userProfile, navigate]);

  return <Auth />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"     element={<RootRedirect />} />
      <Route path="/auth" element={<RootRedirect />} />

      {/* Onboarding (protected inside component) */}
      <Route path="/onboarding" element={<Onboarding />} />

      {/* Core app (protected inside each component) */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/income"    element={<IncomeDetails />} />
      <Route path="/expenses"  element={<ExpenseDetails />} />
      <Route path="/expense"   element={<ExpenseEntry />} />

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Toaster richColors position="top-center" dir="rtl" />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
