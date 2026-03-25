# 🔐 אימות משתמשים

## סקירה

המערכת משתמשת ב-Supabase Auth עם אימות מייל + סיסמה. **אימות מייל נדרש** — המשתמש חייב ללחוץ על לינק שנשלח למייל לפני שיכול להתחבר.

## Flow מלא

```
1. הרשמה (Signup)
   ├── supabase.auth.signUp({ email, password })
   ├── Trigger: יצירת רשומה בטבלת profiles
   ├── שליחת מייל אימות
   └── UI: "בדוק את המייל שלך"

2. אימות מייל
   ├── לחיצה על לינק → redirect ל-/auth
   └── email_confirmed_at מתעדכן

3. התחברות (Login)
   ├── supabase.auth.signInWithPassword()
   ├── בדיקת email_confirmed_at
   └── אם לא מאומת → הודעת שגיאה + אפשרות שליחה מחדש

4. Post-Login Check
   ├── fetchProfile(userId) → בדיקת is_registration_complete
   ├── אם false → redirect ל-/onboarding
   └── אם true → redirect ל-/dashboard

5. Onboarding Completion
   ├── completeRegistration() → עדכון profiles
   └── redirect ל-/dashboard
```

## AuthContext

`src/contexts/AuthContext.tsx` מנהל את כל מצב האימות:

### State
| שדה | סוג | תיאור |
|-----|------|--------|
| `isAuthenticated` | boolean | יש session + מייל מאומת |
| `userProfile` | UserProfile \| null | פרופיל מ-DB |
| `userId` | string \| null | auth user ID |
| `isLoading` | boolean | טוען session ראשוני |
| `financialData` | FinancialData | הכנסות והוצאות שנתיות |
| `isFinancialDataLoading` | boolean | טוען נתונים פיננסיים |

### Methods
| מתודה | תיאור |
|-------|--------|
| `login(email, password)` | התחברות |
| `signup(email, password)` | הרשמה + שליחת אימות |
| `resendVerificationEmail(email)` | שליחת מייל אימות מחדש |
| `logout()` | התנתקות |
| `updateProfile(updates)` | עדכון פרופיל |
| `completeRegistration(profile)` | סיום onboarding |
| `refreshFinancialData()` | רענון נתוני הכנסות/הוצאות |

### Caching
- נתונים פיננסיים נשמרים ב-localStorage (`countme_financial_cache`)
- TTL: 5 דקות
- Cache invalidation: logout, refresh, user change

### Session Management
- `onAuthStateChange` listener לשינויי מצב
- טיפול ב-token refresh errors — logout אוטומטי
- `getSession()` לטעינה ראשונית

## שגיאות נפוצות

| שגיאה | הודעה למשתמש |
|-------|-------------|
| `Invalid login credentials` | "מייל או סיסמה שגויים" |
| `Email not confirmed` | הצגת אפשרות שליחה מחדש |
| `User already registered` | "משתמש עם מייל זה כבר רשום. נסה להתחבר" |
| `Refresh Token` errors | logout אוטומטי + redirect |

## אבטחה

- ❌ אין signup אנונימי
- ❌ אין auto-confirm למיילים
- ✅ RLS על כל הטבלאות
- ✅ Email verification required
- ✅ JWT validation ב-Edge Functions
- ✅ HTML escaping ב-email templates (XSS prevention)
