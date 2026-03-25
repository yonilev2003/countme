# 🎨 עיצוב ו-Design System

## פילוסופיה

עיצוב מינימליסטי-חם עם גווני בז' וחום. גופן עברי Heebo. RTL מלא.

## צבעים (Light Mode)

| Token | HSL | שימוש |
|-------|-----|-------|
| `--background` | 40 20% 96% | רקע כללי |
| `--foreground` | 30 10% 10% | טקסט ראשי |
| `--card` | 0 0% 100% | רקע כרטיסים |
| `--primary` | 30 10% 15% | כפתורים ראשיים, אייקונים |
| `--primary-foreground` | 0 0% 100% | טקסט על primary |
| `--secondary` | 35 20% 92% | רקע משני |
| `--muted` | 35 15% 90% | רקע מעומעם |
| `--muted-foreground` | 30 10% 45% | טקסט משני |
| `--accent` | 35 30% 75% | הדגשות |
| `--success` | 160 50% 40% | הצלחה / ירוק |
| `--destructive` | 0 65% 50% | שגיאה / אדום |
| `--border` | 35 15% 85% | גבולות |

## Gradients

| Class | תיאור |
|-------|--------|
| `.gradient-primary` | כפתורים ואלמנטים ראשיים |
| `.gradient-hero` | רקע hero sections |
| `.gradient-card` | רקע כרטיסים premium |
| `.gradient-accent` | הדגשות |

## Shadows

| Class | תיאור |
|-------|--------|
| `.shadow-soft` | צל עדין (4px blur) |
| `.shadow-card` | צל כרטיסים (12px) |
| `.shadow-elevated` | צל מורם (24px) |
| `.shadow-glow` | זוהר (50px, accent) |

## אנימציות

| Class | אפקט |
|-------|-------|
| `.animate-float` | ריחוף (6s infinite) |
| `.animate-fade-up` | כניסה מלמטה (0.6s) |
| `.animate-fade-in` | fade in (0.4s) |
| `.animate-scale-in` | כניסה עם scale (0.3s) |
| `.animate-slide-right` | כניסה מימין (0.4s) |

## טיפוגרפיה

```css
font-family: 'Heebo', sans-serif;
```

**משקלים בשימוש:** 300 (light), 400 (regular), 500 (medium), 600 (semibold), 700 (bold), 800 (extrabold)

## RTL

```css
html {
  direction: rtl;
}
```

כל הלייאאוטים, טקסט, ואנימציות תומכים ב-RTL.

## Dark Mode

מוגדר תחת `.dark` ב-`index.css`. הפוך צבעי רקע וטקסט עם שמירה על contrast ratio מספק.

## Button Variants

| Variant | שימוש |
|---------|--------|
| `default` | כפתור סטנדרטי |
| `hero` | CTA ראשי (gradient) |
| `outline` | כפתור משני |
| `ghost` | כפתור שקוף |
| `destructive` | פעולות מחיקה |

## כללי עיצוב

1. **אל תשתמש בצבעים ישירות** — רק semantic tokens
2. כל הצבעים חייבים להיות HSL
3. רדיוס ברירת מחדל: `1rem` (`--radius`)
4. spacing עקבי: 4px grid (Tailwind)
