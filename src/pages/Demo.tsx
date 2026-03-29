import { useNavigate } from 'react-router-dom';

const MOCK = {
  year: 2026,
  firstName: 'ישראל',
  userType: 'עוסק מורשה',
  totalIncome: 150_000,
  totalExpenses: 45_000,
  profit: 105_000,
  deductions: {
    totalMonthly: 3_750,
    totalAnnual: 45_000,
    items: [
      { category: 'ציוד ומחשבים' },
      { category: 'תקשורת ואינטרנט' },
      { category: 'רכב ונסיעות' },
      { category: 'השכלה מקצועית' },
    ],
  },
};

export default function Demo() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Registration banner */}
      <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between gap-3 sticky top-0 z-50 shadow-md">
        <p className="text-sm font-medium leading-snug">
          אתה צופה בדשבורד לדוגמה — הירשם כדי להתחיל לעקוב אחרי הכספים שלך
        </p>
        <button
          onClick={() => navigate('/auth')}
          className="flex-shrink-0 bg-white text-primary text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-white/90 transition-colors"
        >
          הירשם חינם
        </button>
      </div>

      {/* Header */}
      <header className="bg-card border-b border-border px-5 py-4 flex items-center justify-between shadow-soft">
        <div className="flex items-center gap-2">
          <span className="text-lg font-extrabold tracking-tight">CountMe</span>
          <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">
            {MOCK.userType}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden sm:block">
            שלום, {MOCK.firstName}
          </span>
          <button
            onClick={() => navigate('/auth')}
            className="text-sm text-primary font-medium hover:underline transition-colors"
          >
            הירשם
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Year heading */}
        <h2 className="text-xl font-bold">{MOCK.year} — סקירה שנתית</h2>

        {/* KPI cards */}
        <div className="grid grid-cols-3 gap-3">
          <KpiCard label="הכנסות" value={MOCK.totalIncome} color="text-success" sign="+" />
          <KpiCard label="הוצאות" value={MOCK.totalExpenses} color="text-destructive" sign="-" />
          <KpiCard label="רווח נקי" value={MOCK.profit} color="text-success" sign="+" />
        </div>

        {/* Quick actions — disabled, clicking prompts registration */}
        <div className="bg-card rounded-2xl shadow-card p-5">
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground">פעולות מהירות</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { emoji: '💰', label: 'הכנסות', sublabel: 'הוסף / צפה' },
              { emoji: '💸', label: 'הוצאות', sublabel: 'הוסף / צפה' },
              { emoji: '➕', label: 'הוצאה חדשה', sublabel: 'הזנה מהירה' },
              { emoji: '📊', label: 'דוחות', sublabel: 'בקרוב' },
            ].map(({ emoji, label, sublabel }) => (
              <button
                key={label}
                onClick={() => navigate('/auth')}
                className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary hover:bg-secondary transition-all text-right relative group"
              >
                <span className="text-xl flex-shrink-0">{emoji}</span>
                <div>
                  <p className="text-sm font-semibold leading-none">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{sublabel}</p>
                </div>
                <span className="absolute inset-0 rounded-xl flex items-center justify-center bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-primary">
                  הירשם כדי להשתמש
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Deductions teaser */}
        <div className="bg-card rounded-2xl shadow-card p-5 border-r-4 border-success animate-fade-up">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🔍</span>
            <div>
              <p className="text-sm font-bold">ניכויים שזיהה הבלש</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {MOCK.deductions.items.length} קטגוריות ·{' '}
                ₪{MOCK.deductions.totalMonthly.toLocaleString('he-IL')} לחודש ·{' '}
                <span className="text-success font-semibold">
                  ₪{MOCK.deductions.totalAnnual.toLocaleString('he-IL')} לשנה
                </span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {MOCK.deductions.items.map((i) => i.category).join(' · ')}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="bg-card rounded-2xl shadow-card p-6 text-center border border-primary/20">
          <p className="text-base font-bold mb-1">רוצה לראות את המספרים האמיתיים שלך?</p>
          <p className="text-sm text-muted-foreground mb-4">
            הירשם בחינם ותתחיל לעקוב אחרי הכנסות והוצאות תוך דקות.
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="gradient-primary text-primary-foreground font-semibold px-8 py-2.5 rounded-xl transition-opacity hover:opacity-90"
          >
            צור חשבון חינמי
          </button>
        </div>
      </main>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({
  label, value, color, sign,
}: {
  label: string;
  value: number;
  color: string;
  sign: string;
}) {
  return (
    <div className="bg-card rounded-2xl shadow-card p-4 animate-fade-up">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={`text-lg font-extrabold ${color} leading-none`}>
        {sign}₪{value.toLocaleString('he-IL', { maximumFractionDigits: 0 })}
      </p>
    </div>
  );
}
