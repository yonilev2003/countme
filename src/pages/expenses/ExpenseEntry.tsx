import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const CATEGORIES = [
  'משרד ביתי', 'רכב', 'ציוד', 'תקשורת', 'הדרכה', 'שיווק',
  'ביטוח לאומי', 'מקדמות מס', 'מזון ואירוח', 'ביגוד מקצועי',
  'ביטוח מקצועי', 'שירותים מקצועיים', 'תוכנה ומנויים', 'אחר',
];

const RECOGNITION_OPTIONS = [
  { value: 100, label: '100% — מוכר במלואו' },
  { value: 75,  label: '75% — הכרה גבוהה' },
  { value: 50,  label: '50% — הכרה חלקית' },
  { value: 25,  label: '25% — הכרה מינימלית' },
];

export default function ExpenseEntry() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, userId, refreshFinancialData } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    amount: '',
    category: '',
    description: '',
    expense_date: new Date().toISOString().slice(0, 10),
    recognition_percentage: 100,
    supplier_phone: '',
    supplier_email: '',
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate('/');
  }, [isAuthenticated, isLoading, navigate]);

  function patch(updates: Partial<typeof form>) {
    setForm((f) => ({ ...f, ...updates }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.amount || !form.category) {
      toast('יש לבחור קטגוריה ולמלא סכום');
      return;
    }
    setIsSaving(true);
    const { error } = await supabase.from('expenses').insert({
      user_id: userId!,
      amount: parseFloat(form.amount),
      category: form.category,
      description: form.description || null,
      expense_date: form.expense_date,
      recognition_percentage: form.recognition_percentage,
      supplier_phone: form.supplier_phone || null,
      supplier_email: form.supplier_email || null,
    });
    if (error) {
      toast('שגיאה בשמירת ההוצאה');
    } else {
      toast('ההוצאה נשמרה ✓');
      refreshFinancialData();
      navigate('/expenses');
    }
    setIsSaving(false);
  }

  if (isLoading) return <Loader />;

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-4 shadow-soft">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate('/expenses')}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-muted transition-colors"
          >
            <ChevronIcon />
          </button>
          <h1 className="text-lg font-bold">הוצאה חדשה</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Category grid */}
          <div>
            <label className="block text-sm font-semibold mb-3">קטגוריה *</label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => patch({ category: cat })}
                  className={`text-right px-3 py-2 rounded-xl text-sm border-2 transition-all ${
                    form.category === cat
                      ? 'border-primary bg-secondary font-semibold'
                      : 'border-border hover:border-accent'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Amount + date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">סכום (₪) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={(e) => patch({ amount: e.target.value })}
                className={inputCls}
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">תאריך</label>
              <input
                type="date"
                value={form.expense_date}
                onChange={(e) => patch({ expense_date: e.target.value })}
                className={inputCls}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">תיאור</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => patch({ description: e.target.value })}
              className={inputCls}
              placeholder="תיאור קצר (אופציונלי)"
            />
          </div>

          {/* Recognition */}
          <div>
            <label className="block text-sm font-semibold mb-2">אחוז הכרה</label>
            <div className="space-y-2">
              {RECOGNITION_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => patch({ recognition_percentage: opt.value })}
                  className={`w-full text-right px-4 py-2.5 rounded-xl text-sm border-2 transition-all ${
                    form.recognition_percentage === opt.value
                      ? 'border-primary bg-secondary font-semibold'
                      : 'border-border hover:border-accent'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Supplier (optional) */}
          <details className="group">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors select-none">
              פרטי ספק (אופציונלי) ▸
            </summary>
            <div className="mt-3 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">טלפון ספק</label>
                <input
                  type="tel"
                  value={form.supplier_phone}
                  onChange={(e) => patch({ supplier_phone: e.target.value })}
                  className={inputCls}
                  placeholder="050-0000000"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">מייל ספק</label>
                <input
                  type="email"
                  value={form.supplier_email}
                  onChange={(e) => patch({ supplier_email: e.target.value })}
                  className={inputCls}
                  placeholder="supplier@example.com"
                />
              </div>
            </div>
          </details>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full gradient-primary text-primary-foreground font-semibold py-3 rounded-xl disabled:opacity-50 transition-opacity shadow-soft text-base"
          >
            {isSaving ? 'שומר...' : 'שמור הוצאה'}
          </button>
        </form>
      </main>
    </div>
  );
}

const inputCls =
  'w-full border border-border rounded-xl px-3 py-2 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30';

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
