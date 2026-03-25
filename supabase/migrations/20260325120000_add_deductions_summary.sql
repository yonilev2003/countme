-- Add AI-generated expense deductions summary column to profiles
-- Run via: Supabase Dashboard → SQL Editor, or `supabase db push`

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS deductions_summary JSONB DEFAULT NULL;

COMMENT ON COLUMN public.profiles.deductions_summary IS
  'AI-generated monthly deductible expense summary from the onboarding Expense Detective conversation';
