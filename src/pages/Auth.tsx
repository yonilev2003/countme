import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

type Mode = 'login' | 'signup' | 'forgot';

export default function Auth() {
  const { login, signup, resetPassword } = useAuth();

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else if (mode === 'signup') {
        await signup(email, password);
        toast('החשבון נוצר! מתחבר...');
      } else {
        await resetPassword(email);
        setForgotSent(true);
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : 'אירעה שגיאה');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Forgot password — success screen ──────────────────────────────────────
  if (mode === 'forgot' && forgotSent) {
    return (
      <AuthShell>
        <div className="text-center">
          <div className="text-4xl mb-4">📬</div>
          <h2 className="text-xl font-bold mb-2">בדוק את המייל שלך</h2>
          <p className="text-sm text-muted-foreground mb-6">
            שלחנו קישור לאיפוס הסיסמה לכתובת <strong>{email}</strong>.
          </p>
          <button
            onClick={() => { setMode('login'); setForgotSent(false); }}
            className="text-primary text-sm underline"
          >
            חזרה להתחברות
          </button>
        </div>
      </AuthShell>
    );
  }

  // ── Forgot password form ───────────────────────────────────────────────────
  if (mode === 'forgot') {
    return (
      <AuthShell>
        <button
          onClick={() => setMode('login')}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          ← חזרה
        </button>
        <h2 className="text-xl font-bold mb-1">איפוס סיסמה</h2>
        <p className="text-sm text-muted-foreground mb-6">
          נשלח לך קישור לאיפוס הסיסמה למייל.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
            placeholder="you@example.com"
            autoComplete="email"
          />
          <button
            type="submit"
            disabled={isLoading}
            className={submitCls}
          >
            {isLoading ? 'שולח...' : 'שלח קישור לאיפוס'}
          </button>
        </form>
      </AuthShell>
    );
  }

  // ── Login / Signup ─────────────────────────────────────────────────────────
  return (
    <AuthShell>
      {/* Brand */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">CountMe</h1>
        <p className="text-muted-foreground mt-1 text-sm">ניהול פיננסי לעצמאים</p>
      </div>

      {/* Tab toggle */}
      <div className="flex rounded-xl bg-muted p-1 mb-6">
        {(['login', 'signup'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === m ? 'bg-card shadow-soft text-foreground' : 'text-muted-foreground'
            }`}
          >
            {m === 'login' ? 'התחברות' : 'הרשמה'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="email">
            כתובת מייל
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium" htmlFor="password">
              סיסמה
            </label>
            {mode === 'login' && (
              <button
                type="button"
                onClick={() => setMode('forgot')}
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                שכחתי סיסמה
              </button>
            )}
          </div>
          <input
            id="password"
            type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputCls}
            placeholder="לפחות 6 תווים"
          />
        </div>

        <button type="submit" disabled={isLoading} className={submitCls}>
          {isLoading ? 'טוען...' : mode === 'login' ? 'התחבר' : 'צור חשבון'}
        </button>
      </form>
    </AuthShell>
  );
}

// ── Shared helpers ────────────────────────────────────────────────────────────

function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-card p-8 max-w-md w-full animate-scale-in">
        {children}
      </div>
    </div>
  );
}

const inputCls =
  'w-full border border-border rounded-xl px-4 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30';

const submitCls =
  'w-full gradient-primary text-primary-foreground font-semibold py-2.5 rounded-xl transition-opacity disabled:opacity-60';
