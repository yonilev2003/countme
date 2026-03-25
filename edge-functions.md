# ⚡ Edge Functions

## monthly-reminders

**מיקום:** `supabase/functions/monthly-reminders/index.ts`

### תיאור
שולח תזכורות חודשיות לכל המשתמשים הרשומים. יוצר רשומות בטבלת `notifications` לפי סוג העוסק.

### לוגיקה
1. שולף כל הפרופילים עם `is_registration_complete = true`
2. לכל משתמש — מחשב משימות לפי `user_type`
3. בודק אילו התראות כבר נוצרו החודש (מניעת כפילויות)
4. יוצר התראות חדשות

### משימות לפי סוג עוסק

| סוג | משימות |
|-----|--------|
| `zaair` | דיווח מקדמות לביטוח לאומי (עד ה-15) |
| `patur` | תשלום מקדמות מס הכנסה (עד ה-15), הצהרת עוסק פטור למע"מ (סוף חודש) |
| `murshe` | דיווח מע"מ (עד ה-15), מקדמות מס הכנסה (עד ה-15), עדכון הכנסה לביטוח לאומי (עד ה-15) |

### API

```
POST /functions/v1/monthly-reminders
Authorization: Bearer <service_role_key>
```

**Response:**
```json
{
  "success": true,
  "message": "Created 5 notifications for 3 users"
}
```

---

## send-invoice-email

**מיקום:** `supabase/functions/send-invoice-email/index.ts`

### תיאור
שולח חשבונית מס בפורמט HTML במייל באמצעות Resend API.

### אבטחה
- ✅ JWT verification — חילוץ ואימות טוקן מה-Authorization header
- ✅ Input validation — סכמת Zod לכל שדה
- ✅ HTML escaping — מניעת XSS ב-email content
- ✅ Rate limiting (Resend built-in)

### Secrets נדרשים
| Secret | תיאור |
|--------|--------|
| `RESEND_API_KEY` | מפתח API של Resend לשליחת מיילים |

### API

```
POST /functions/v1/send-invoice-email
Authorization: Bearer <user_jwt>
Content-Type: application/json

{
  "recipientEmail": "client@example.com",
  "income": {
    "amount": 5000,
    "description": "שירותי ייעוץ",
    "customerName": "חברה בע\"מ",
    "paymentMethod": "העברה בנקאית",
    "incomeDate": "2025-01-15"
  },
  "seller": {
    "name": "ישראל ישראלי",
    "email": "israel@example.com",
    "idNumber": "123456789"
  },
  "invoiceNumber": "INV-001"
}
```

### Input Validation (Zod)

```typescript
RequestSchema = z.object({
  recipientEmail: z.string().email().max(255),
  income: z.object({
    amount: z.number().positive().max(999999999),
    description: z.string().min(1).max(1000),
    customerName: z.string().max(255).nullable(),
    paymentMethod: z.string().min(1).max(50),
    incomeDate: z.string().min(1).max(20),
  }),
  seller: z.object({
    name: z.string().min(1).max(255),
    email: z.string().email().max(255),
    idNumber: z.string().max(20),
  }),
  invoiceNumber: z.string().min(1).max(50),
});
```

### Email Template
- HTML email בעיצוב מקצועי
- RTL support
- כולל: פרטי מוכר, פרטי לקוח, מספר חשבונית, תיאור, סכום
- ברנדינג: "CountMe"
