import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Income {
  id: string;
  amount: number;
  description: string;
  income_date: string;
  payment_method: string;
  customer_name: string | null;
}

const PAYMENT_METHODS = ['העברה בנקאית', 'מזומן', 'אשראי', "צ'ק", 'ביט/פייבוקס'];

export default function IncomeDetails() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, userId, refreshFinancialData } = useAuth();

  const [incomes, setIncomes] = useState<Income[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    amount: '',
    description: '',
    customer_name: '',
    income_date: new Date().toISOString().slice(0, 10),
    payment_method: 'העברה בנקאית',
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate('/');
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (!userId) return;
    fetchIncomes();
  }, [userId]);

  async function fetchIncomes() {
    setIsFetching(true);
    const { data, error } = await supabase
      .from('incomes')
      .select('id, amount, description, income_date, payment_method, customer_name')
      .eq('user_id', userId!)
      .order('income_date', { ascending: false });
    if (!error && data) setIncomes(data as Income[]);
    setIsFetching(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.amount || !form.description) {
      toast('יש למלא סכום ותיאור');
      return;
    }
    setIsSaving(true);
    const { error } = await supabase.from('incomes').insert({
      user_id: userId!,
      amount: parseFloat(form.amount),
      description: form.description,
      customer_name: form.customer_name || null,
      income_date: form.income_date,
      payment_method: form.payment_method,
    });
    if (error) {
      toast('שגיאה בשמירת ההכנסה');
    } else {
      toast('ההכנסה נשמרה בהצלחה ✓');
      setForm({ amount: '', description: '', customer_name: '', income_date: new Date().toISOString().slice(0, 10), payment_method: 'העברה בנקאית' });
      setShowForm(false);
      fetchIncomes();
      refreshFinancialData();
    }
    setIsSaving(false);
  }

  const total = incomes.reduce((s, i) => s + Number(i.amount), 0);

  if (isLoading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <PageHeader title="הכנסות" onBack={() => navigate('/dashboard')} />

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Summary bar */}
        <div className="bg-card rounded-2xl shadow-card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">סה"כ השנה</p>
            <p className="text-2xl font-extrabold text-success">
              ₪{total.toLocaleString('he-IL')}
            </p>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="gradient-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-xl shadow-soft"
          >
            {showForm ? '✕ ביטול' : '+ הכנסה חדשה'}
          </button>
        </div>

        {/* Add income form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-card rounded-2xl shadow-card p-5 space-y-4 animate-scale-in"
          >
            <h3 className="font-semibold text-base">הוספת הכנסה</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="סכום (₪)" required>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  className={inputClass}
                  placeholder="1,500"
                />
              </Field>
              <Field label="תאריך">
                <input
                  type="date"
                  value={form.income_date}
                  onChange={(e) => setForm((f) => ({ ...f, income_date: e.target.value }))}
                  className={inputClass}
                />
              </Field>
            </div>
            <Field label="תיאור" required>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className={inputClass}
                placeholder="עבודת עיצוב ללקוח X"
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="שם לקוח">
                <input
                  type="text"
                  value={form.customer_name}
                  onChange={(e) => setForm((f) => ({ ...f, customer_name: e.target.value }))}
                  className={inputClass}
                  placeholder="אופציונלי"
                />
              </Field>
              <Field label="אמצעי תשלום">
                <select
                  value={form.payment_method}
                  onChange={(e) => setForm((f) => ({ ...f, payment_method: e.target.value }))}
                  className={inputClass}
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </Field>
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="w-full gradient-primary text-primary-foreground font-semibold py-2.5 rounded-xl disabled:opacity-50"
            >
              {isSaving ? 'שומר...' : 'שמור הכנסה'}
            </button>
          </form>
        )}

        {/* Income list */}
        {isFetching ? (
          <div className="text-center py-8 text-muted-foreground text-sm">טוען...</div>
        ) : incomes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">💰</p>
            <p className="text-muted-foreground text-sm">עוד אין הכנסות מתועדות</p>
            <button onClick={() => setShowForm(true)} className="mt-3 text-primary text-sm underline">
              הוסף הכנסה ראשונה
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {incomes.map((income) => (
              <div
                key={income.id}
                className="bg-card rounded-2xl shadow-soft px-5 py-4 flex items-center justify-between animate-fade-in"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{income.description}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {income.customer_name && `${income.customer_name} · `}
                    {formatDate(income.income_date)} · {income.payment_method}
                  </p>
                </div>
                <p className="text-base font-bold text-success flex-shrink-0 mr-4">
                  +₪{Number(income.amount).toLocaleString('he-IL')}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

const inputClass =
  'w-full border border-border rounded-xl px-3 py-2 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30';

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1">
        {label}{required && <span className="text-destructive mr-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function PageLoader() {
  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center">
      <div className="w-7 h-7 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function PageHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <header className="bg-card border-b border-border px-4 py-4 flex items-center gap-3 shadow-soft">
      <div className="max-w-2xl mx-auto w-full flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-muted transition-colors"
          aria-label="חזרה"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
        <h1 className="text-lg font-bold">{title}</h1>
      </div>
    </header>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('he-IL', { day: 'numeric', month: 'short' });
}
