import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import type { UserType } from '@/types/user';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DeductionItem {
  category: string;
  description: string;
  estimatedMonthly: number;
  recognitionPercentage: 25 | 50 | 75 | 100;
  taxRule: string;
}

export interface DeductionsSummary {
  items: DeductionItem[];
  totalMonthly: number;
  totalAnnual: number;
  summaryMessage: string;
  generatedAt: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ApiMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface Props {
  userType: UserType;
  firstName: string;
  onComplete: (summary: DeductionsSummary) => void;
  onSkip: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ExpenseDetectiveChat({
  userType,
  firstName,
  onComplete,
  onSkip,
}: Props) {
  const { userId } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [apiHistory, setApiHistory] = useState<ApiMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [summary, setSummary] = useState<DeductionsSummary | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Load first AI message on mount
  useEffect(() => {
    callAI([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── API call ──────────────────────────────────────────────────────────────

  async function callAI(history: ApiMessage[]) {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('expense-detective', {
        body: { messages: history, userType, firstName },
      });

      if (error) throw error;

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.message ?? 'מצטער, נתקלתי בבעיה. אנא נסה שוב.',
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setApiHistory((prev) => [...prev, { role: 'assistant', content: assistantMsg.content }]);

      if (data.isComplete && data.summary) {
        setIsComplete(true);
        setSummary(data.summary as DeductionsSummary);
      }
    } catch (err) {
      console.error('expense-detective error:', err);
      toast('שגיאה בחיבור לבלש ההוצאות. אפשר לנסות שוב או לדלג.');
    } finally {
      setIsLoading(false);
    }
  }

  // ─── Send message ──────────────────────────────────────────────────────────

  async function sendMessage() {
    const text = input.trim();
    if (!text || isLoading || isComplete) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
    };
    setMessages((prev) => [...prev, userMsg]);
    const newHistory: ApiMessage[] = [...apiHistory, { role: 'user', content: text }];
    setApiHistory(newHistory);
    setInput('');
    // Reset textarea height
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    await callAI(newHistory);
  }

  // ─── Confirm & save ────────────────────────────────────────────────────────

  async function handleConfirm() {
    if (!summary) return;
    setIsSaving(true);
    try {
      if (userId) {
        await supabase
          .from('profiles')
          .update({ deductions_summary: summary as never })
          .eq('user_id', userId);
      }
      onComplete(summary);
    } catch (err) {
      console.error('save deductions error:', err);
      // Still proceed — don't block onboarding due to save failure
      toast('לא הצלחנו לשמור את הסיכום, אבל ממשיכים.');
      onComplete(summary);
    } finally {
      setIsSaving(false);
    }
  }

  // ─── Textarea auto-grow ────────────────────────────────────────────────────

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="flex-shrink-0 bg-card border-b border-border px-5 py-4 shadow-soft">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center text-lg shadow-soft">
              🔍
            </div>
            <div>
              <h1 className="text-base font-bold leading-none">בלש ההוצאות</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                יועץ מס AI · חוקי 2026
              </p>
            </div>
          </div>
          <button
            onClick={onSkip}
            className="text-xs text-muted-foreground hover:text-foreground underline transition-colors"
          >
            דלג לדשבורד
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 shadow-soft max-w-[80%]">
                <TypingDots />
              </div>
            </div>
          )}

          {/* Deductions summary card */}
          {isComplete && summary && (
            <div className="animate-fade-up mt-2">
              <DeductionsSummaryCard summary={summary} />
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 bg-card border-t border-border px-4 py-4 shadow-soft">
        <div className="max-w-2xl mx-auto">
          {isComplete ? (
            <div className="flex gap-3">
              <button
                onClick={onSkip}
                className="px-5 py-2.5 text-sm text-muted-foreground border border-border rounded-xl hover:bg-muted transition-colors"
              >
                דלג
              </button>
              <button
                onClick={handleConfirm}
                disabled={isSaving}
                className="flex-1 gradient-primary text-primary-foreground text-sm font-semibold rounded-xl py-2.5 disabled:opacity-60 transition-opacity shadow-soft"
              >
                {isSaving ? 'שומר...' : '✓ אשר סיכום וסיים הרשמה'}
              </button>
            </div>
          ) : (
            <div className="flex items-end gap-3">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                rows={1}
                placeholder="כתוב/י תשובה..."
                className="flex-1 resize-none bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 transition-all leading-relaxed"
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="h-11 w-11 gradient-primary text-primary-foreground rounded-xl flex items-center justify-center disabled:opacity-40 transition-opacity shadow-soft flex-shrink-0"
                aria-label="שלח"
              >
                <SendIcon />
              </button>
            </div>
          )}
          <p className="text-center text-xs text-muted-foreground mt-2">
            Enter לשליחה · Shift+Enter לשורה חדשה
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex animate-fade-in ${isUser ? 'justify-start' : 'justify-end'}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-xl gradient-primary flex items-center justify-center text-xs ml-2 flex-shrink-0 self-end mb-1 shadow-soft">
          🔍
        </div>
      )}
      <div
        className={`max-w-[78%] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-secondary border border-border text-foreground rounded-2xl rounded-br-sm'
            : 'gradient-primary text-primary-foreground rounded-2xl rounded-tr-sm shadow-soft'
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex gap-1 items-center h-4">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce"
          style={{ animationDelay: `${i * 150}ms`, animationDuration: '800ms' }}
        />
      ))}
    </div>
  );
}

function DeductionsSummaryCard({ summary }: { summary: DeductionsSummary }) {
  return (
    <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
      {/* Card header */}
      <div className="gradient-primary px-5 py-4">
        <div className="flex items-center gap-2 text-primary-foreground">
          <span className="text-lg">📊</span>
          <div>
            <h3 className="font-bold text-sm">סיכום ניכויי מס חודשיים</h3>
            <p className="text-xs opacity-80 mt-0.5">{summary.summaryMessage}</p>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="divide-y divide-border">
        {summary.items.map((item, i) => (
          <div key={i} className="px-5 py-3 flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{item.category}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{item.description}</p>
              <p className="text-xs text-muted-foreground/70 mt-1 leading-snug">{item.taxRule}</p>
            </div>
            <div className="text-left flex-shrink-0">
              <p className="text-sm font-bold text-foreground">
                ₪{item.estimatedMonthly.toLocaleString('he-IL')}
              </p>
              <p className="text-xs text-muted-foreground text-left">
                {item.recognitionPercentage}% הכרה
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="px-5 py-4 bg-secondary border-t border-border">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-muted-foreground">סה"כ לחודש</span>
          <span className="text-base font-bold text-foreground">
            ₪{summary.totalMonthly.toLocaleString('he-IL')}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">סה"כ לשנה</span>
          <span className="text-lg font-extrabold text-success">
            ₪{summary.totalAnnual.toLocaleString('he-IL')}
          </span>
        </div>
      </div>
    </div>
  );
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}
