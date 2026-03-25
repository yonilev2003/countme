# 🗄 מסד נתונים

## סכמת טבלאות

### profiles
פרופיל משתמש — נוצר בהרשמה, מתעדכן ב-onboarding.

| עמודה | סוג | ברירת מחדל | תיאור |
|-------|------|------------|--------|
| `id` | uuid | gen_random_uuid() | מפתח ראשי |
| `user_id` | uuid | — | מזהה משתמש (auth.users) |
| `email` | text | — | כתובת מייל |
| `first_name` | text | '' | שם פרטי |
| `last_name` | text | '' | שם משפחה |
| `id_number` | text | '' | תעודת זהות |
| `user_type` | text | null | `zaair` / `patur` / `murshe` |
| `is_registration_complete` | boolean | false | האם סיים onboarding |
| `created_at` | timestamptz | now() | תאריך יצירה |
| `updated_at` | timestamptz | now() | תאריך עדכון |

### incomes
הכנסות המשתמש.

| עמודה | סוג | ברירת מחדל | תיאור |
|-------|------|------------|--------|
| `id` | uuid | gen_random_uuid() | מפתח ראשי |
| `user_id` | uuid | — | מזהה משתמש |
| `amount` | numeric | — | סכום |
| `description` | text | — | תיאור ההכנסה |
| `income_date` | date | today | תאריך |
| `payment_method` | text | — | מזומן/העברה/אשראי/צ'ק |
| `customer_name` | text | null | שם לקוח |
| `customer_email` | text | null | מייל לקוח |
| `customer_phone` | text | null | טלפון לקוח |
| `document_url` | text | null | קישור למסמך מצורף |
| `created_at` | timestamptz | now() | — |
| `updated_at` | timestamptz | now() | — |

### expenses
הוצאות המשתמש.

| עמודה | סוג | ברירת מחדל | תיאור |
|-------|------|------------|--------|
| `id` | uuid | gen_random_uuid() | מפתח ראשי |
| `user_id` | uuid | — | מזהה משתמש |
| `amount` | numeric | — | סכום |
| `category` | text | — | קטגוריה |
| `description` | text | null | תיאור |
| `expense_date` | date | today | תאריך |
| `recognition_percentage` | numeric | 100 | אחוז הכרה (25/50/75/100) |
| `supplier_email` | text | null | מייל ספק |
| `supplier_phone` | text | null | טלפון ספק |
| `document_url` | text | null | קישור למסמך |
| `created_at` | timestamptz | now() | — |
| `updated_at` | timestamptz | now() | — |

### notifications
התראות ותזכורות.

| עמודה | סוג | ברירת מחדל | תיאור |
|-------|------|------------|--------|
| `id` | uuid | gen_random_uuid() | מפתח ראשי |
| `user_id` | uuid | — | מזהה משתמש |
| `title` | text | — | כותרת |
| `message` | text | — | תוכן ההתראה |
| `type` | text | 'info' | סוג: info/payment/submission/reminder/update |
| `read` | boolean | false | נקרא? |
| `due_date` | date | null | תאריך יעד |
| `created_at` | timestamptz | now() | — |

### invoice_sends
רישום שליחות חשבוניות במייל.

| עמודה | סוג | ברירת מחדל | תיאור |
|-------|------|------------|--------|
| `id` | uuid | gen_random_uuid() | מפתח ראשי |
| `user_id` | uuid | — | מזהה משתמש |
| `income_id` | uuid | — | FK → incomes.id |
| `recipient_email` | text | — | מייל הנמען |
| `sent_at` | timestamptz | now() | זמן שליחה |
| `created_at` | timestamptz | now() | — |

## יחסים (Relationships)

```
profiles.user_id → auth.users.id (logical, not FK)
incomes.user_id → auth.users.id (logical)
expenses.user_id → auth.users.id (logical)
notifications.user_id → auth.users.id (logical)
invoice_sends.user_id → auth.users.id (logical)
invoice_sends.income_id → incomes.id (FK)
```

> **הערה:** אין FK ישיר ל-`auth.users` — זו פרקטיקה מומלצת ב-Supabase. הקשר נשמר לוגית דרך `user_id`.

## Row Level Security (RLS)

כל הטבלאות מוגנות ב-RLS. כל משתמש רואה ומנהל רק את הנתונים שלו:

```sql
-- דוגמה כללית לפוליסת RLS
CREATE POLICY "Users can manage own data"
ON public.table_name
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
```

## Realtime

הטבלאות `incomes` ו-`expenses` מחוברות ל-Supabase Realtime. הדשבורד מאזין לשינויים ומרענן נתונים פיננסיים אוטומטית.
