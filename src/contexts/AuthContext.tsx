import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export interface UserProfile {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  idNumber: string;
  userType: 'zaair' | 'patur' | 'murshe' | null;
  isRegistrationComplete: boolean;
}

export interface FinancialData {
  totalIncome: number;
  totalExpenses: number;
  year: number;
}

interface FinancialCache {
  data: FinancialData;
  userId: string;
  fetchedAt: number;
}

const CACHE_KEY = 'countme_financial_cache';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function toUserProfile(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    userId: row.user_id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    idNumber: row.id_number,
    userType: row.user_type,
    isRegistrationComplete: row.is_registration_complete,
  };
}

function loadCache(userId: string): FinancialData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cache: FinancialCache = JSON.parse(raw);
    if (cache.userId !== userId) return null;
    if (Date.now() - cache.fetchedAt > CACHE_TTL_MS) return null;
    return cache.data;
  } catch {
    return null;
  }
}

function saveCache(userId: string, data: FinancialData) {
  const cache: FinancialCache = { data, userId, fetchedAt: Date.now() };
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

function clearCache() {
  localStorage.removeItem(CACHE_KEY);
}

interface AuthContextValue {
  isAuthenticated: boolean;
  userProfile: UserProfile | null;
  userId: string | null;
  isLoading: boolean;
  isProfileLoading: boolean;
  financialData: FinancialData;
  isFinancialDataLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  completeRegistration: (profile: Partial<UserProfile>) => Promise<void>;
  refreshFinancialData: () => Promise<void>;
}

const emptyFinancials: FinancialData = {
  totalIncome: 0,
  totalExpenses: 0,
  year: new Date().getFullYear(),
};

const PROFILE_TIMEOUT_MS = 10_000;

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [financialData, setFinancialData] = useState<FinancialData>(emptyFinancials);
  const [isFinancialDataLoading, setIsFinancialDataLoading] = useState(false);
  const fetchingFinancials = useRef(false);

  const isAuthenticated = !!session;

  // ---------- profile ----------

  const fetchProfile = useCallback(async (userId: string) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), PROFILE_TIMEOUT_MS);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .abortSignal(controller.signal)
        .single();
      if (error || !data) return null;
      return toUserProfile(data);
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }
  }, []);

  // ---------- financial data ----------

  const fetchFinancialData = useCallback(async (userId: string) => {
    if (fetchingFinancials.current) return;
    fetchingFinancials.current = true;
    setIsFinancialDataLoading(true);

    const year = new Date().getFullYear();
    const startOfYear = `${year}-01-01`;
    const endOfYear = `${year}-12-31`;

    try {
      const [incomesRes, expensesRes] = await Promise.all([
        supabase
          .from('incomes')
          .select('*')
          .eq('user_id', userId)
          .gte('income_date', startOfYear)
          .lte('income_date', endOfYear),
        supabase
          .from('expenses')
          .select('*')
          .eq('user_id', userId)
          .gte('expense_date', startOfYear)
          .lte('expense_date', endOfYear),
      ]);

      const totalIncome = (incomesRes.data ?? []).reduce(
        (sum, r) => sum + Number(r.amount),
        0
      );
      const totalExpenses = (expensesRes.data ?? []).reduce(
        (sum, r) =>
          sum + (Number(r.amount) * Number(r.recognition_percentage)) / 100,
        0
      );

      const fresh: FinancialData = { totalIncome, totalExpenses, year };
      setFinancialData(fresh);
      saveCache(userId, fresh);
    } finally {
      fetchingFinancials.current = false;
      setIsFinancialDataLoading(false);
    }
  }, []);

  const refreshFinancialData = useCallback(async () => {
    if (!user?.id) return;
    clearCache();
    await fetchFinancialData(user.id);
  }, [user, fetchFinancialData]);

  // ---------- auth state ----------

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      setIsLoading(false);

      if (s?.user?.id) {
        const cached = loadCache(s.user.id);
        if (cached) setFinancialData(cached);

        setIsProfileLoading(true);
        fetchProfile(s.user.id).then((p) => {
          if (p) setUserProfile(p);
          setIsProfileLoading(false);
        });
        fetchFinancialData(s.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, s) => {
        if (
          event === 'TOKEN_REFRESHED' ||
          (event as string) === 'INITIAL_SESSION'
        ) {
          return;
        }

        if (event === 'SIGNED_IN' && s?.user) {
          setSession(s);
          setUser(s.user);

          const cached = loadCache(s.user.id);
          if (cached) setFinancialData(cached);

          setIsProfileLoading(true);
          fetchProfile(s.user.id).then((p) => {
            if (p) setUserProfile(p);
            setIsProfileLoading(false);
          });
          fetchFinancialData(s.user.id);
        }

        if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setUserProfile(null);
          setFinancialData(emptyFinancials);
          clearCache();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile, fetchFinancialData]);

  // ---------- methods ----------

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('מייל או סיסמה שגויים');
      }
      throw error;
    }
  };

  const signup = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      if (error.message.includes('User already registered')) {
        throw new Error('משתמש עם מייל זה כבר רשום. נסה להתחבר');
      }
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  };

  const resendVerificationEmail = async (email: string) => {
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) throw error;
  };

  const logout = async () => {
    clearCache();
    await supabase.auth.signOut();
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user?.id) return;

    const dbUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (updates.firstName !== undefined) dbUpdates.first_name = updates.firstName;
    if (updates.lastName !== undefined) dbUpdates.last_name = updates.lastName;
    if (updates.idNumber !== undefined) dbUpdates.id_number = updates.idNumber;
    if (updates.userType !== undefined) dbUpdates.user_type = updates.userType;
    if (updates.isRegistrationComplete !== undefined)
      dbUpdates.is_registration_complete = updates.isRegistrationComplete;

    const { data, error } = await supabase
      .from('profiles')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update(dbUpdates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    if (data) setUserProfile(toUserProfile(data));
  };

  const completeRegistration = async (profile: Partial<UserProfile>) => {
    await updateProfile({ ...profile, isRegistrationComplete: true });
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userProfile,
        userId: user?.id ?? null,
        isLoading,
        isProfileLoading,
        financialData,
        isFinancialDataLoading,
        login,
        signup,
        signInWithGoogle,
        resendVerificationEmail,
        logout,
        updateProfile,
        completeRegistration,
        refreshFinancialData,
        resetPassword,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
