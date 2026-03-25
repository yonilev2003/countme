# 🏗 ארכיטקטורה טכנית

## תרשים מבנה גבוה

```
┌─────────────────────────────────────┐
│           React SPA (Vite)          │
│  ┌─────────┐  ┌──────────────────┐  │
│  │ Pages   │  │ Components       │  │
│  │ (Routes)│  │ (UI + Business)  │  │
│  └────┬────┘  └────────┬─────────┘  │
│       │                │            │
│  ┌────┴────────────────┴─────────┐  │
│  │     Contexts & Hooks          │  │
│  │  AuthContext, Notifications   │  │
│  │  useUser, useToast            │  │
│  └────────────┬──────────────────┘  │
│               │                     │
│  ┌────────────┴──────────────────┐  │
│  │   Supabase Client SDK        │  │
│  │   @supabase/supabase-js      │  │
│  └────────────┬──────────────────┘  │
└───────────────┼─────────────────────┘
                │ HTTPS
┌───────────────┼─────────────────────┐
│  Lovable Cloud (Supabase)           │
│  ┌────────────┴──────────────────┐  │
│  │  PostgreSQL + RLS             │  │
│  │  Tables: profiles, incomes,   │  │
│  │  expenses, notifications,     │  │
│  │  invoice_sends                │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │  Edge Functions (Deno)        │  │
│  │  • monthly-reminders          │  │
│  │  • send-invoice-email         │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │  Auth (Email + Password)      │  │
│  │  Email Verification Required  │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

## מבנה תיקיות

```
src/
├── assets/              # לוגו ותמונות סטטיות
├── components/
│   ├── auth/            # UserGuideModal
│   ├── dashboard/       # QuickActionsFAB, TaxPaymentModal, NationalInsurancePaymentModal
│   ├── income/          # InvoicePreviewModal
│   ├── notifications/   # NotificationsContext, NotificationsPanel
│   ├── onboarding/      # OnboardingFlow, OnboardingContext, StepIndicator, steps/*
│   └── ui/              # shadcn/ui components (~50 קומפוננטות)
├── contexts/
│   └── AuthContext.tsx   # אימות, פרופיל, נתונים פיננסיים, cache
├── hooks/
│   ├── useUser.ts        # נתוני משתמש (demo/legacy)
│   ├── use-mobile.tsx    # זיהוי מובייל
│   └── use-toast.ts      # התראות toast
├── integrations/
│   └── supabase/
│       ├── client.ts     # ⚠️ AUTO-GENERATED — DO NOT EDIT
│       └── types.ts      # ⚠️ AUTO-GENERATED — DO NOT EDIT
├── lib/
│   └── utils.ts          # cn() utility
├── pages/
│   ├── Auth.tsx           # עמוד כניסה/הרשמה
│   ├── Dashboard.tsx      # דשבורד ראשי (~760 שורות)
│   ├── Onboarding.tsx     # wrapper ל-OnboardingFlow
│   ├── NotFound.tsx       # 404
│   ├── expenses/
│   │   ├── ExpenseEntry.tsx
│   │   └── ExpenseDetails.tsx
│   ├── income/
│   │   └── IncomeDetails.tsx
│   ├── invoices/
│   │   ├── InvoiceSimple.tsx
│   │   └── InvoiceTax.tsx
│   ├── reports/
│   │   ├── ZaairReports.tsx
│   │   ├── PaturReports.tsx
│   │   ├── MursheReports.tsx
│   │   └── ManagementReports.tsx
│   └── tax-report/
│       └── AnnualTaxReportWizard.tsx
├── types/
│   └── user.ts           # UserType, UserData, getIncomeLimit
├── App.tsx               # Router + Providers
├── main.tsx              # Entry point
└── index.css             # Design tokens + animations

supabase/
├── config.toml           # ⚠️ AUTO-GENERATED project config
├── functions/
│   ├── monthly-reminders/index.ts
│   └── send-invoice-email/index.ts
└── migrations/           # ⚠️ READ-ONLY — managed by platform
```

## טכנולוגיות

| שכבה | טכנולוגיה | גרסה | תפקיד |
|------|-----------|-------|--------|
| Build | Vite | 5.4 | Dev server + production build |
| UI Framework | React | 18.3 | Component rendering |
| Language | TypeScript | 5.8 | Type safety |
| Styling | Tailwind CSS | 3.4 | Utility-first CSS |
| Components | shadcn/ui | - | ~50 Radix-based components |
| Routing | React Router | 6.30 | Client-side navigation |
| State | React Query | 5.83 | Server state + caching |
| State | React Context | - | Auth + Notifications |
| Charts | Recharts | 2.15 | Data visualization |
| Icons | Lucide React | 0.462 | Icon system |
| PDF | jsPDF + html2canvas | 4.0 / 1.4 | PDF generation |
| Forms | React Hook Form + Zod | 7.61 / 3.25 | Form handling + validation |
| Backend | Supabase JS | 2.90 | DB, Auth, Edge Functions |
| SEO | react-helmet-async | 2.0 | Meta tags |
| Dates | date-fns | 3.6 | Date formatting |
| Sanitize | DOMPurify | 3.3 | XSS prevention |

## Providers Hierarchy

```tsx
<HelmetProvider>
  <QueryClientProvider>
    <AuthProvider>           // Auth state + financial data + profile
      <NotificationsProvider> // Notifications state
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes />
          </BrowserRouter>
        </TooltipProvider>
      </NotificationsProvider>
    </AuthProvider>
  </QueryClientProvider>
</HelmetProvider>
```

## Data Flow

### Financial Data Caching
`AuthContext` implements a localStorage cache (`countme_financial_cache`) with 5-minute TTL:
1. On auth → load cached data immediately
2. Fetch fresh data from DB in parallel
3. Update cache on every refresh

### Realtime Subscriptions
Dashboard subscribes to `postgres_changes` on `incomes` and `expenses` tables to auto-refresh financial data on any CRUD operation.
