import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'sonner';
import { useEffect } from 'react';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import ErrorBoundary from '@/components/ErrorBoundary';

// Pages — Auth
import Auth from '@/pages/Auth';
import ResetPassword from '@/pages/ResetPassword';

// Pages — Onboarding
import Onboarding from '@/pages/Onboarding';

// Pages — Core
import Dashboard from '@/pages/Dashboard';
import IncomeDetails from '@/pages/income/IncomeDetails';
import ExpenseDetails from '@/pages/expenses/ExpenseDetails';
import ExpenseEntry from '@/pages/expenses/ExpenseEntry';

// Pages — Misc
import Demo from '@/pages/Demo';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 1 },
  },
});

function RootRedirect() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, isProfileLoading, userProfile } = useAuth();

  useEffect(() => {
    if (isLoading || isProfileLoading) return;
    if (!isAuthenticated) return;

    if (!userProfile || !userProfile.isRegistrationComplete) {
      navigate('/onboarding', { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, isProfileLoading, userProfile, navigate]);

  if (isLoading || (isAuthenticated && isProfileLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <Auth />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/"               element={<RootRedirect />} />
      <Route path="/auth"           element={<RootRedirect />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/onboarding"     element={<Onboarding />} />
      <Route path="/dashboard"      element={<Dashboard />} />
      <Route path="/income"         element={<IncomeDetails />} />
      <Route path="/expenses"       element={<ExpenseDetails />} />
      <Route path="/expense"        element={<ExpenseEntry />} />
      <Route path="/demo"           element={<Demo />} />
      <Route path="*"               element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}
