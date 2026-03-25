# 👩‍💻 מדריך למפתח

## התקנה

```bash
git clone <YOUR_GIT_URL>
cd countme
npm install
npm run dev
```

### דרישות
- Node.js 18+
- npm / bun

### משתני סביבה
מנוהלים אוטומטית ע"י Lovable Cloud:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

## מוסכמות קוד

### מבנה קובץ
```
imports (external → internal → types → assets)
interfaces / types
constants
component function
export
```

### שמות
- **קומפוננטות:** PascalCase (`InvoicePreviewModal`)
- **Hooks:** camelCase עם `use` prefix (`useUser`)
- **קבצים:** PascalCase לקומפוננטות, camelCase ל-hooks
- **טבלאות DB:** snake_case (`invoice_sends`)
- **TypeScript types:** PascalCase (`UserType`, `WizardAnswers`)

### קבצים שאסור לערוך ⚠️
| קובץ | סיבה |
|------|-------|
| `src/integrations/supabase/client.ts` | Auto-generated |
| `src/integrations/supabase/types.ts` | Auto-generated from DB schema |
| `.env` | Managed by platform |
| `supabase/migrations/*` | Managed by platform |

### ייבוא Supabase Client
```typescript
import { supabase } from "@/integrations/supabase/client";
```

### Path Aliases
```
@/* → ./src/*
```

## הוספת פיצ'ר חדש

### 1. דף חדש
1. צור קומפוננטה ב-`src/pages/`
2. הוסף Route ב-`src/App.tsx` (מעל ה-catch-all `*`)
3. הוסף ניווט מהדשבורד או מדף רלוונטי

### 2. טבלה חדשה
1. צור migration דרך כלי ה-migration (לא ידנית)
2. הוסף RLS policies
3. Types יתעדכנו אוטומטית ב-`types.ts`

### 3. Edge Function חדשה
1. צור תיקייה ב-`supabase/functions/<name>/`
2. צור `index.ts` עם `Deno.serve()` handler
3. Deploy אוטומטי
4. הוסף CORS headers

### 4. לוגיקה לפי סוג עוסק
```typescript
import { UserType } from '@/types/user';

switch (userType) {
  case 'zaair':  // עוסק זעיר
  case 'patur':  // עוסק פטור
  case 'murshe': // עוסק מורשה
}
```

## בדיקות

### Build
```bash
npm run build
```

### Type Check
```bash
npx tsc --noEmit
```

## Deploy

- **Frontend:** לחץ "Publish" → "Update" ב-Lovable
- **Backend (Edge Functions, Migrations):** Deploy אוטומטי
- **Custom Domain:** Settings → Domains
- **Published URL:** https://countme.lovable.app
