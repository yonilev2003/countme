import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import StepIndicator from './StepIndicator';
import ExpenseDetectiveChat from './ExpenseDetectiveChat';
import type { DeductionsSummary } from './ExpenseDetectiveChat';
import type { UserType } from '@/types/user';

// ─── Types ────────────────────────────────────────────────────────────────────

interface OnboardingData {
  firstName: string;
  lastName: string;
  idNumber: string;
  userType: UserType | null;
}

const TOTAL_STEPS = 3; // Personal info → User type → Expense Detective

// ─── Main flow ────────────────────────────────────────────────────────────────

export default function OnboardingFlow() {
  const navigate = useNavigate();
  const { completeRegistration } = useAuth();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    firstName: '',
    lastName: '',
    idNumber: '',
    userType: null,
  });

  const handleNext = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  // Called when user completes or skips the Expense Detective chat
  const handleChatDone = async (_summary?: DeductionsSummary) => {
    // deductions_summary is saved by ExpenseDetectiveChat itself before calling onComplete
    setIsSubmitting(true);
    try {
      await completeRegistration({
        firstName: data.firstName,
        lastName: data.lastName,
        idNumber: data.idNumber,
        userType: data.userType!,
      });
      navigate('/dashboard');
    } catch {
      toast('שגיאה בשמירת הפרופיל. נסה שוב.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 3 fills the entire screen — no card wrapper
  if (step === 3) {
    return (
      <ExpenseDetectiveChat
        userType={data.userType!}
        firstName={data.firstName}
        onComplete={handleChatDone}
        onSkip={() => handleChatDone()}
      />
    );
  }

  // Steps 1–2: compact card
  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-elevated p-8 max-w-lg w-full animate-scale-in">
        <h2 className="text-2xl font-bold text-center mb-2">ברוכים הבאים ל-CountMe</h2>
        <p className="text-muted-foreground text-center text-sm mb-6">
          כמה פרטים קצרים ונתחיל
        </p>

        <StepIndicator currentStep={step} totalSteps={TOTAL_STEPS} />

        <div className="mt-8">
          {step === 1 && (
            <PersonalInfoStep
              data={data}
              onChange={(d) => setData((prev) => ({ ...prev, ...d }))}
            />
          )}
          {step === 2 && (
            <UserTypeStep
              value={data.userType}
              onChange={(userType) => setData((prev) => ({ ...prev, userType }))}
            />
          )}
        </div>

        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <button
              onClick={handleBack}
              className="flex-1 border border-border rounded-xl py-2.5 text-sm font-medium hover:bg-muted transition-colors"
            >
              חזרה
            </button>
          )}
          {step < TOTAL_STEPS ? (
            <button
              onClick={handleNext}
              disabled={
                (step === 1 && (!data.firstName.trim() || !data.lastName.trim())) ||
                (step === 2 && !data.userType)
              }
              className="flex-1 gradient-primary text-primary-foreground rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50 transition-opacity"
            >
              {step === 2 ? 'המשך לגילוי הוצאות ←' : 'המשך'}
            </button>
          ) : (
            <button
              onClick={() => handleChatDone()}
              disabled={isSubmitting}
              className="flex-1 gradient-primary text-primary-foreground rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50 transition-opacity"
            >
              {isSubmitting ? 'שומר...' : 'סיים'}
            </button>
          )}
        </div>

        {step === 2 && (
          <p className="text-center text-xs text-muted-foreground mt-4">
            השלב הבא: בלש ההוצאות יאתר ניכויי מס שמגיעים לך 🔍
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Step 1: Personal Info ────────────────────────────────────────────────────

function PersonalInfoStep({
  data,
  onChange,
}: {
  data: Pick<OnboardingData, 'firstName' | 'lastName' | 'idNumber'>;
  onChange: (d: Partial<OnboardingData>) => void;
}) {
  return (
    <div className="space-y-4 animate-fade-in">
      <h3 className="text-lg font-semibold">פרטים אישיים</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">שם פרטי</label>
          <input
            type="text"
            value={data.firstName}
            onChange={(e) => onChange({ firstName: e.target.value })}
            className="w-full border border-border rounded-xl px-4 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="ישראל"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">שם משפחה</label>
          <input
            type="text"
            value={data.lastName}
            onChange={(e) => onChange({ lastName: e.target.value })}
            className="w-full border border-border rounded-xl px-4 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="ישראלי"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">תעודת זהות</label>
        <input
          type="text"
          value={data.idNumber}
          onChange={(e) => onChange({ idNumber: e.target.value })}
          className="w-full border border-border rounded-xl px-4 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="9 ספרות"
          maxLength={9}
        />
      </div>
    </div>
  );
}

// ─── Step 2: User Type ────────────────────────────────────────────────────────

const USER_TYPES: { value: UserType; label: string; description: string; emoji: string }[] = [
  {
    value: 'zaair',
    label: 'עוסק זעיר',
    emoji: '🌱',
    description: 'מחזור עד ₪122,833 · מס 3% · ניכוי נורמטיבי 30%',
  },
  {
    value: 'patur',
    label: 'עוסק פטור',
    emoji: '🛡️',
    description: 'מחזור עד ₪122,833 · פטור ממע"מ · אין ניכוי מע"מ',
  },
  {
    value: 'murshe',
    label: 'עוסק מורשה',
    emoji: '🏢',
    description: 'ללא הגבלת מחזור · מע"מ 17% · דיווח דו-חודשי',
  },
];

function UserTypeStep({
  value,
  onChange,
}: {
  value: UserType | null;
  onChange: (v: UserType) => void;
}) {
  return (
    <div className="space-y-3 animate-fade-in">
      <h3 className="text-lg font-semibold">סוג עוסק</h3>
      {USER_TYPES.map((type) => (
        <button
          key={type.value}
          onClick={() => onChange(type.value)}
          className={`w-full text-right p-4 rounded-xl border-2 transition-all flex items-start gap-3 ${
            value === type.value
              ? 'border-primary bg-secondary shadow-soft'
              : 'border-border hover:border-accent'
          }`}
        >
          <span className="text-xl flex-shrink-0 mt-0.5">{type.emoji}</span>
          <div>
            <p className="font-semibold text-sm">{type.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{type.description}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
