import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

type Mode = 'login' | 'signup' | 'forgot' | 'verify-email';

export default function Auth() {
  const { login, signup, signInWithGoogle, resetPassword, resendVerificationEmail } = useAuth();

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
        setMode('verify-email');
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

  // ── Email verification gate ────────────────────────────────────────────────
  if (mode === 'verify-email') {
    return (
      <AuthShell>
        <div className="text-center">
          <div className="text-5xl mb-4">✉️</div>
          <h2 className="text-xl font-bold mb-2">אמת את כתובת המייל שלך</h2>
          <p className="text-sm text-muted-foreground mb-1">
            שלחנו קישור אימות לכתובת
          </p>
          <p className="font-medium text-sm mb-6 break-all">{email}</p>
          <p className="text-xs text-muted-foreground mb-6">
            לחץ על הקישור במייל כדי לאמת את החשבון ולהמשיך.
          </p>
          <button
            onClick={async () => {
              setIsLoading(true);
              try {
                await resendVerificationEmail(email);
                toast('מייל אימות נשלח מחדש');
              } catch (err) {
                toast(err instanceof Error ? err.message : 'שגיאה בשליחה');
              } finally {
                setIsLoading(false);
              }
            }}
            disabled={isLoading}
            className="w-full border border-border rounded-xl py-2.5 text-sm font-medium hover:bg-muted transition-colors mb-3 disabled:opacity-60"
          >
            {isLoading ? 'שולח...' : 'שלח שוב'}
          </button>
          <button
            onClick={() => { setMode('login'); }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            חזרה להתחברות
          </button>
        </div>
      </AuthShell>
    );
  }

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

      {/* Google OAuth */}
      <button
        type="button"
        onClick={async () => {
          setIsLoading(true);
          try { await signInWithGoogle(); }
          catch (err) { toast(err instanceof Error ? err.message : 'שגיאה בהתחברות עם Google'); setIsLoading(false); }
        }}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 border border-border rounded-xl py-2.5 bg-background hover:bg-muted transition-colors text-sm font-medium disabled:opacity-60"
      >
        <GoogleIcon />
        המשך עם Google
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 my-2">
        <div className="flex-1 border-t border-border" />
        <span className="text-xs text-muted-foreground">או</span>
        <div className="flex-1 border-t border-border" />
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

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.16 7.09-10.29 7.09-17.65z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.16C6.51 42.62 14.62 48 24 48z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.5-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.16C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.55 10.75l7.98-6.16z"/>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.55 13.25l7.98 6.16C12.43 13.72 17.74 9.5 24 9.5z"/>
    </svg>
  );
}
