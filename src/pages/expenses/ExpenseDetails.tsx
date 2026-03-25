import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string | null;
  expense_date: string;
  recognition_percentage: number;
}

const CATEGORY_EMOJI: Record<string, string> = {
  'משרד ביתי': '🏠', 'רכב': '🚗', 'ציוד': '🔧', 'תקשורת': '📱',
  'הדרכה': '📚', 'שיווק': '📣', 'ביטוח לאומי': '🛡️', 'מקדמות מס': '📋',
  'מזון ואירוח': '☕', 'אחר': '📦',
};

export default function ExpenseDetails() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, userId } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate('/');
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from('expenses')
      .select('id, amount, category, description, expense_date, recognition_percentage')
      .eq('user_id', userId)
      .order('expense_date', { ascending: false })
      .then(({ data }) => {
        if (data) setExpenses(data as Expense[]);
        setIsFetching(false);
      });
  }, [userId]);

  const total = expenses.reduce(
    (s, e) => s + (Number(e.amount) * Number(e.recognition_percentage)) / 100,
    0
  );

  if (isLoading) return <Loader />;

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-4 shadow-soft">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-muted transition-colors"
            >
              <ChevronIcon />
            </button>
            <h1 className="text-lg font-bold">הוצאות</h1>
          </div>
          <button
            onClick={() => navigate('/expense')}
            className="gradient-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-xl shadow-soft"
          >
            + הוצאה חדשה
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Summary */}
        <div className="bg-card rounded-2xl shadow-card p-5">
          <p className="text-xs text-muted-foreground">סה"כ הוצאות מוכרות השנה</p>
          <p className="text-2xl font-extrabold text-destructive">
            ₪{total.toLocaleString('he-IL')}
          </p>
        </div>

        {/* List */}
        {isFetching ? (
          <div className="text-center py-8 text-muted-foreground text-sm">טוען...</div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">💸</p>
            <p className="text-muted-foreground text-sm">עוד אין הוצאות מתועדות</p>
            <button onClick={() => navigate('/expense')} className="mt-3 text-primary text-sm underline">
              הוסף הוצאה ראשונה
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {expenses.map((exp) => (
              <div
                key={exp.id}
                className="bg-card rounded-2xl shadow-soft px-5 py-4 flex items-center justify-between animate-fade-in"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xl flex-shrink-0">
                    {CATEGORY_EMOJI[exp.category] ?? '📦'}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{exp.category}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {exp.description && `${exp.description} · `}
                      {new Date(exp.expense_date).toLocaleDateString('he-IL', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>
                <div className="text-left flex-shrink-0 mr-3">
                  <p className="text-sm font-bold text-destructive">
                    -₪{Number(exp.amount).toLocaleString('he-IL')}
                  </p>
                  <p className="text-xs text-muted-foreground">{exp.recognition_percentage}% מוכר</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function Loader() {
  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center">
      <div className="w-7 h-7 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
