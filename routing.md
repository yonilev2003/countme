# 🧭 ניתוב ודפים

## מפת ניתוב

| נתיב | קומפוננטה | תיאור | הגנה |
|------|-----------|--------|------|
| `/` | `Auth` | עמוד כניסה/הרשמה | Public |
| `/auth` | `Auth` | כנ"ל (redirect target) | Public |
| `/onboarding` | `Onboarding` | תהליך הרשמה 6 שלבים | Authenticated |
| `/dashboard` | `Dashboard` | דשבורד ראשי | Authenticated |
| `/income` | `IncomeDetails` | רשימת הכנסות + הוספה | Authenticated |
| `/expenses` | `ExpenseDetails` | רשימת הוצאות | Authenticated |
| `/expense` | `ExpenseEntry` | הזנת הוצאה חדשה | Authenticated |
| `/invoice/simple` | `InvoiceSimple` | חשבונית פשוטה | Authenticated |
| `/invoice/tax` | `InvoiceTax` | חשבונית מס | Authenticated |
| `/reports/zaair` | `ZaairReports` | דוח עוסק זעיר | Authenticated |
| `/reports/patur` | `PaturReports` | דוח עוסק פטור | Authenticated |
| `/reports/murshe` | `MursheReports` | דוח עוסק מורשה | Authenticated |
| `/management-reports` | `ManagementReports` | דוחות ניהוליים | Authenticated |
| `/tax-report-1301` | `AnnualTaxReportWizard` | שאלון דוח שנתי | Authenticated |
| `*` | `NotFound` | 404 | Public |

## הגנת נתיבים

הגנה מתבצעת ברמת הקומפוננטה (לא ב-Router):

```tsx
// Dashboard.tsx
React.useEffect(() => {
  if (!isLoading && !isAuthenticated) {
    navigate('/');
  }
}, [isAuthenticated, isLoading]);
```

## ניווט מותנה לפי סוג עוסק

### דוחות
```
zaair  → /reports/zaair
patur  → /reports/patur
murshe → /reports/murshe
```

### חשבוניות
```
murshe → /invoice/tax (חשבונית מס)
אחר   → /invoice/simple (חשבונית פשוטה)
```

## Quick Actions (דשבורד)

| פעולה | אייקון | נתיב |
|-------|--------|------|
| הפקת חשבונית | Receipt | conditional |
| הפקת דוחות | FileText | conditional |
| הוצאות | Wallet | /expenses |
| דוחות ניהוליים | TrendingUp | /management-reports |

כפתור FAB נוסף (`QuickActionsFAB`) זמין למובייל.
