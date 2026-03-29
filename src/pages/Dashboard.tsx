import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { UserType } from '@/types/user';
import { INCOME_LIMIT } from '@/types/user';
import KpiCard from '@/components/KpiCard';
import { formatCurrency } from '@/lib/utils';

export default function Dashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, userProfile, financialData, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate('/');
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) return <Loader />;
  if (!isAuthenticated) return null;

  const { totalIncome, totalExpenses, year } = financialData;
  const profit = totalIncome - totalExpenses;
  const incomeProgress = Math.min((totalIncome / INCOME_LIMIT) * 100, 100);
  const userType = userProfile?.userType ?? null;
  const firstName = userProfile?.firstName || 'משתמש';

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="bg-card border-b border-border px-5 py-4 flex items-center justify-between shadow-soft">
        <div className="flex items-center gap-2">
          <span className="text-lg font-extrabold tracking-tight">CountMe</span>
          {userType && <UserTypeBadge type={userType} />}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden sm:block">
            שלום, {firstName}
          </span>
          <button
            onClick={logout}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            יציאה
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Year heading */}
        <h2 className="text-xl font-bold">{year} — סקירה שנתית</h2>

        {/* KPI cards */}
        <div className="grid grid-cols-3 gap-3">
          <KpiCard label="הכנסות" value={totalIncome} color="text-success" sign="+" />
          <KpiCard label="הוצאות" value={totalExpenses} color="text-destructive" sign="-" />
          <KpiCard
            label="רווח נקי"
            value={Math.abs(profit)}
            color={profit >= 0 ? 'text-success' : 'text-destructive'}
            sign={profit >= 0 ? '+' : '-'}
          />
        </div>

        {/* Income limit progress (zaair/patur only) */}
        {(userType === 'zaair' || userType === 'patur') && (
          <div className="bg-card rounded-2xl shadow-card p-5 animate-fade-up">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-semibold">מחזור מול תקרה שנתית</p>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(totalIncome)} / {formatCurrency(INCOME_LIMIT)}
              </p>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  incomeProgress >= 90 ? 'bg-destructive' : incomeProgress >= 70 ? 'bg-amber-500' : 'bg-success'
                }`}
                style={{ width: `${incomeProgress}%` }}
              />
            </div>
            {incomeProgress >= 90 && (
              <p className="text-xs text-destructive mt-1.5 font-medium">
                ⚠️ הגעת ל-{Math.round(incomeProgress)}% מהתקרה — שקול/י שינוי סוג עוסק
              </p>
            )}
          </div>
        )}

        {/* Quick actions */}
        <div className="bg-card rounded-2xl shadow-card p-5">
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground">פעולות מהירות</h3>
          <div className="grid grid-cols-2 gap-3">
            <ActionButton
              emoji="💰"
              label="הכנסות"
              sublabel="הוסף / צפה"
              onClick={() => navigate('/income')}
            />
            <ActionButton
              emoji="💸"
              label="הוצאות"
              sublabel="הוסף / צפה"
              onClick={() => navigate('/expenses')}
            />
            <ActionButton
              emoji="➕"
              label="הוצאה חדשה"
              sublabel="הזנה מהירה"
              onClick={() => navigate('/expense')}
            />
            <ActionButton
              emoji="📊"
              label="דוחות"
              sublabel="בקרוב"
              onClick={() => {}}
              disabled
            />
          </div>
        </div>

        {/* Deductions teaser (if summary exists) */}
        {userProfile && (userProfile as unknown as { deductions_summary?: DeductionTeaserData }).deductions_summary && (
          <DeductionsTeaser summary={(userProfile as unknown as { deductions_summary: DeductionTeaserData }).deductions_summary} />
        )}
      </main>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Loader() {
  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center">
      <div className="w-7 h-7 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function UserTypeBadge({ type }: { type: UserType }) {
  const labels: Record<UserType, string> = {
    zaair: 'עוסק זעיר',
    patur: 'עוסק פטור',
    murshe: 'עוסק מורשה',
  };
  return (
    <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">
      {labels[type]}
    </span>
  );
}


function ActionButton({
  emoji, label, sublabel, onClick, disabled,
}: {
  emoji: string;
  label: string;
  sublabel: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-accent hover:bg-secondary transition-all text-right disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <span className="text-xl flex-shrink-0">{emoji}</span>
      <div>
        <p className="text-sm font-semibold leading-none">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{sublabel}</p>
      </div>
    </button>
  );
}

interface DeductionTeaserData {
  totalMonthly: number;
  totalAnnual: number;
  items: { category: string }[];
}

function DeductionsTeaser({ summary }: { summary: DeductionTeaserData }) {
  return (
    <div className="bg-card rounded-2xl shadow-card p-5 border-r-4 border-success animate-fade-up">
      <div className="flex items-start gap-3">
        <span className="text-2xl">🔍</span>
        <div>
          <p className="text-sm font-bold">ניכויים שזיהה הבלש</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {summary.items.length} קטגוריות · {formatCurrency(summary.totalMonthly)} לחודש ·{' '}
            <span className="text-success font-semibold">
              {formatCurrency(summary.totalAnnual)} לשנה
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
