# 📚 CountMe - תיעוד טכני מלא

## תוכן עניינים

| מסמך | תיאור |
|------|--------|
| [סקירה כללית](./overview.md) | מהות המוצר, קהל יעד, ותכונות עיקריות |
| [ארכיטקטורה](./architecture.md) | מבנה טכני, טכנולוגיות, ותשתית |
| [מסד נתונים](./database.md) | סכמת טבלאות, RLS, ויחסים |
| [אימות משתמשים](./authentication.md) | תהליך הרשמה, התחברות, והרשאות |
| [ניתוב ודפים](./routing.md) | מפת ניתוב, דפים, ומבנה קומפוננטות |
| [Edge Functions](./edge-functions.md) | פונקציות צד שרת |
| [עיצוב ו-Design System](./design-system.md) | טוקנים, צבעים, ואנימציות |
| [מדריך למפתח](./developer-guide.md) | התקנה, הפעלה, ומוסכמות קוד |

---

## מהירות התחלה

```bash
git clone <YOUR_GIT_URL>
cd countme
npm install
npm run dev
```

## טכנולוגיות ליבה

- **Frontend:** React 18.3 + TypeScript + Vite
- **UI:** Tailwind CSS + shadcn/ui
- **Backend:** Lovable Cloud (Supabase)
- **State:** React Query + React Context
