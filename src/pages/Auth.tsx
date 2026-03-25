import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

type Mode = 'login' | 'signup';

export default function Auth() {
  const navigate = useNavigate();
  const { login, signup, resendVerificationEmail } = useAuth();

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setShowResend(false);

    try {
      if (mode === 'login') {
        await login(email, password);
        // AuthContext will redirect via profile check in App.tsx
      } else {
        await signup(email, password);
        setSignupSuccess(true);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'אירעה שגיאה';
      if (msg === 'EMAIL_NOT_CONFIRMED') {
        setShowResend(true);
        toast('המייל שלך טרם אומת', {
          description: 'בדוק את תיבת הדואר שלך ולחץ על הקישור לאימות.',
        });
      } else {
        toast(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await resendVerificationEmail(email);
      toast('מייל האימות נשלח מחדש');
    } catch {
      toast('שגיאה בשליחת מייל האימות');
    }
  };

  if (signupSuccess) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl shadow-card p-8 max-w-md w-full text-center animate-scale-in">
          <div className="text-4xl mb-4">📬</div>
          <h2 className="text-2xl font-bold mb-2">בדוק את המייל שלך</h2>
          <p className="text-muted-foreground mb-6">
            שלחנו קישור אימות לכתובת <strong>{email}</strong>.<br />
            לחץ על הקישור כדי להפעיל את חשבונך.
          </p>
          <button
            onClick={() => setMode('login')}
            className="text-primary underline text-sm"
          >
            חזרה להתחברות
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-card p-8 max-w-md w-full animate-scale-in">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight">CountMe</h1>
          <p className="text-muted-foreground mt-1 text-sm">ניהול פיננסי לעצמאים</p>
        </div>

        {/* Tab toggle */}
        <div className="flex rounded-xl bg-muted p-1 mb-6">
          <button
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === 'login'
                ? 'bg-card shadow-soft text-foreground'
                : 'text-muted-foreground'
            }`}
            onClick={() => setMode('login')}
          >
            התחברות
          </button>
          <button
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === 'signup'
                ? 'bg-card shadow-soft text-foreground'
                : 'text-muted-foreground'
            }`}
            onClick={() => setMode('signup')}
          >
            הרשמה
          </button>
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
              className="w-full border border-border rounded-xl px-4 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="password">
              סיסמה
            </label>
            <input
              id="password"
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-border rounded-xl px-4 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="לפחות 6 תווים"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full gradient-primary text-primary-foreground font-semibold py-2.5 rounded-xl transition-opacity disabled:opacity-60"
          >
            {isLoading ? 'טוען...' : mode === 'login' ? 'התחבר' : 'צור חשבון'}
          </button>
        </form>

        {showResend && (
          <div className="mt-4 p-3 bg-secondary rounded-xl text-sm text-center">
            <span className="text-muted-foreground">לא קיבלת מייל? </span>
            <button
              onClick={handleResend}
              className="text-primary font-medium underline"
            >
              שלח שוב
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
