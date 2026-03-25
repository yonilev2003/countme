import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface RequestBody {
  messages: ChatMessage[];
  userType: 'zaair' | 'patur' | 'murshe';
  firstName: string;
}

// ─── System prompt ────────────────────────────────────────────────────────────

function buildSystemPrompt(userType: string, firstName: string): string {
  const userTypeHebrew: Record<string, string> = {
    zaair: 'עוסק זעיר',
    patur: 'עוסק פטור',
    murshe: 'עוסק מורשה',
  };
  const typeHe = userTypeHebrew[userType] ?? 'עצמאי';

  return `אתה "בלש ההוצאות" (Expense Detective) של CountMe — יועץ מס ישראלי בכיר, מומחה בחוקי מס 2026.
אתה שוחח עם ${firstName}, ${typeHe}.

**סגנון השיחה:**
- עברית ידידותית, חמה, לא-פורמלית
- שאלה אחת בלבד בכל תגובה — קצרה, ממוקדת
- כשרלוונטי, ציין בקצרה את הניכוי האפשרי (לא יותר ממשפט)
- אחרי 6–9 שאלות שאספת מידע מספיק, קרא לכלי record_deductions

**כשמקבלת "__init__" מהמשתמש** — התחל מיד עם ברכה חמה, הצג את עצמך כ"בלש ההוצאות", ושאל מה הוא/היא עושה/ת לפרנסה.

══════ חוקי ניכוי מס ישראל 2026 ══════

1. **משרד ביתי — 30% מהוצאות הבית**
   ארנונה, חשמל, גז, אינטרנט ביתי, שכירות/משכנתא (ריבית)
   תנאי: חלק מהבית מוגדר לעסק בלבד

2. **רכב — 45% מכלל ההוצאות** (דלק, ביטוח, אחזקה, טיפולים, חניה לפגישות)
   רכב ספר/עבודה (נגרות, שליחויות, נהג): עד 100%
   לעוסק מורשה: ניכוי מע"מ 2/3 מהוצאות הרכב

3. **טלפון נייד — 50%** מחשבון הטלפון
   קו עסקי נפרד: 100%

4. **מחשב/לפטופ/טאבלט — 75–100%**
   שימוש עסקי בלבד: 100% | שימוש מעורב: 75%

5. **ציוד מקצועי — 100%** מכל ציוד הקשור ישירות לעסק
   DJ: מיקסרים, רמקולים, כבלים, תוכנות מוזיקה, תאורה
   צלם: מצלמות, עדשות, תאורה, כונן גיבוי
   נגר: כלי עבודה, מכונות
   מאמן כושר: ציוד כושר, מזרנים

6. **נסיעות לגיגים/לקוחות/כנסים — 100%** (אוטובוס, רכבת, מונית, חניון בנסיעה עסקית)

7. **הכשרות מקצועיות — 100%** קורסים, סמינרים, ספרים, כנסים, מנויי לימוד

8. **שיווק ופרסום — 100%** (מודעות Meta/Google, עיצוב לוגו, אתר אינטרנט, כרטיסי ביקור, צלם לפרסום)

9. **תוכנות ומנויים עסקיים — 100%** (Adobe, Canva Pro, CRM, כלי ניהול, Spotify/Apple Music לDJ, Dropbox)

10. **ביגוד עם לוגו עסקי — 80%** (חולצות מודפסות, מדים)

11. **פגישות עסקיות — 80%** (קפה/מסעדה עם לקוח/שותף)

12. **ביטוח מקצועי — 100%** (אחריות מקצועית, ביטוח ציוד)

13. **שירותים מקצועיים — 100%** (רואה חשבון, עו"ד, יועץ עסקי)

14. **ריבית על הלוואה עסקית — 100%**

══════ לפי סוג עוסק ══════

**עוסק זעיר (${userType === 'zaair' ? '← זה המשתמש' : userType})**:
יש ניכוי נורמטיבי אוטומטי של 30% מההכנסה. אם הניכויים הספציפיים עולים על 30%, כדאי לתעד אותם.
מס 3% בלבד. מדווח פעם בשנה.

**עוסק פטור**:
לא גובה מע"מ, לא מנכה מע"מ. ניכויים פעים כמו זעיר.

**עוסק מורשה**:
מנכה מע"מ מהוצאות (17%). חשוב לתעד חשבוניות עם מע"מ.
דיווח דו-חודשי למע"מ.

══════════════════════════════════════

**שאלות מומלצות לכסות:**
1. מה העיסוק הבסיסי?
2. עובד/ת מהבית או ממשרד חיצוני?
3. משתמש/ת ברכב לעסק?
4. איזה ציוד מקצועי?
5. טלפון/מחשב — כמה לעסק?
6. קורסים/הכשרות לאחרונה?
7. הוצאות שיווק?
8. נסיעות לגיגים/לקוחות?
9. עוד משהו שהוצאת עבור העסק?

כשתגיע לסיכום, הערך כמה ₪ לחודש כל ניכוי ממוצע. היה שמרן אך מציאותי.`;
}

// ─── Tool definition ──────────────────────────────────────────────────────────

const RECORD_DEDUCTIONS_TOOL = {
  name: 'record_deductions',
  description:
    'קרא לכלי זה בסוף השיחה, לאחר שאספת מספיק מידע — פעם אחת בלבד. הכלי שומר את סיכום ניכויי המס החודשיים של המשתמש.',
  input_schema: {
    type: 'object',
    properties: {
      summaryMessage: {
        type: 'string',
        description: 'הודעת סיכום ידידותית בעברית למשתמש (2-3 משפטים)',
      },
      items: {
        type: 'array',
        description: 'רשימת ניכויים שזוהו',
        items: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              description: 'שם הקטגוריה בעברית (לדוגמה: משרד ביתי)',
            },
            description: {
              type: 'string',
              description: 'תיאור קצר של הניכוי (לדוגמה: 30% מארנונה וחשמל)',
            },
            estimatedMonthly: {
              type: 'number',
              description: 'הערכת סכום חודשי בשקלים',
            },
            recognitionPercentage: {
              type: 'number',
              description: 'אחוז הכרה (25, 50, 75 או 100)',
              enum: [25, 50, 75, 100],
            },
            taxRule: {
              type: 'string',
              description: 'הכלל/סעיף שמאפשר את הניכוי (משפט קצר)',
            },
          },
          required: [
            'category',
            'description',
            'estimatedMonthly',
            'recognitionPercentage',
            'taxRule',
          ],
        },
      },
      totalMonthly: {
        type: 'number',
        description: 'סה"כ ניכויים חודשיים בשקלים',
      },
      totalAnnual: {
        type: 'number',
        description: 'סה"כ ניכויים שנתיים בשקלים',
      },
    },
    required: ['summaryMessage', 'items', 'totalMonthly', 'totalAnnual'],
  },
};

// ─── Handler ──────────────────────────────────────────────────────────────────

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Auth — verify the caller is a valid Supabase user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request body
    const { messages, userType, firstName }: RequestBody = await req.json();

    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicKey) {
      return new Response(
        JSON.stringify({ error: 'ANTHROPIC_API_KEY secret not set' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For initial load, inject the __init__ trigger
    const messagesForAPI: ChatMessage[] =
      messages.length === 0 ? [{ role: 'user', content: '__init__' }] : messages;

    // Call Anthropic
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: buildSystemPrompt(userType, firstName),
        messages: messagesForAPI,
        tools: [RECORD_DEDUCTIONS_TOOL],
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      console.error('Anthropic error:', errText);
      return new Response(
        JSON.stringify({ error: 'Anthropic API error', detail: errText }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const anthropicData = await anthropicRes.json();

    // Handle tool_use (completion signal)
    if (anthropicData.stop_reason === 'tool_use') {
      const toolUseBlock = anthropicData.content?.find(
        (b: { type: string }) => b.type === 'tool_use'
      );
      if (toolUseBlock?.name === 'record_deductions') {
        const summary = {
          ...toolUseBlock.input,
          generatedAt: new Date().toISOString(),
        };
        return new Response(
          JSON.stringify({
            isComplete: true,
            message: toolUseBlock.input.summaryMessage,
            summary,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Regular text response
    const textBlock = anthropicData.content?.find(
      (b: { type: string }) => b.type === 'text'
    );
    const message =
      textBlock?.text ?? 'מצטער, נתקלתי בבעיה טכנית. בוא/י ננסה שוב.';

    return new Response(
      JSON.stringify({ isComplete: false, message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('expense-detective error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
