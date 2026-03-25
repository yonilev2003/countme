import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export default function ResetPassword() {
  const navigate = useNavigate();
  const { updatePassword } = useAuth();

  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);

  // Supabase processes the URL hash automatically and fires PASSWORD_RECOVERY
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast('הסיסמאות אינן תואמות');
      return;
    }
    if (password.length < 6) {
      toast('הסיסמה חייבת להכיל לפחות 6 תווים');
      return;
    }
    setIsLoading(true);
    try {
      await updatePassword(password);
      setDone(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'שגיאה באיפוס הסיסמה');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-card p-8 max-w-md w-full animate-scale-in text-center">
        {done ? (
          <>
            <div className="text-4xl mb-4">✅</div>
            <h2 className="text-xl font-bold mb-2">הסיסמה עודכנה!</h2>
            <p className="text-sm text-muted-foreground">מעביר אותך לדשבורד...</p>
          </>
        ) : !ready ? (
          <>
            <div className="w-7 h-7 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">מאמת את הקישור...</p>
            <p className="text-xs text-muted-foreground mt-2">
              אם הקישור פג תוקף,{' '}
              <button
                onClick={() => navigate('/')}
                className="text-primary underline"
              >
                בקש קישור חדש
              </button>
            </p>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-1 text-right">סיסמה חדשה</h2>
            <p className="text-sm text-muted-foreground mb-6 text-right">
              בחר/י סיסמה חזקה לחשבונך.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4 text-right">
              <div>
                <label className="block text-sm font-medium mb-1">סיסמה חדשה</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputCls}
                  placeholder="לפחות 6 תווים"
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">אימות סיסמה</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className={inputCls}
                  placeholder="הקלד/י שוב"
                  autoComplete="new-password"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full gradient-primary text-primary-foreground font-semibold py-2.5 rounded-xl disabled:opacity-60"
              >
                {isLoading ? 'שומר...' : 'עדכן סיסמה'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

const inputCls =
  'w-full border border-border rounded-xl px-4 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30';
