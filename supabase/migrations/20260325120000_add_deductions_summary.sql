-- CountMe — full schema
-- Run in: Supabase Dashboard → SQL Editor

-- ─── profiles ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL UNIQUE,
  email                   TEXT NOT NULL DEFAULT '',
  first_name              TEXT NOT NULL DEFAULT '',
  last_name               TEXT NOT NULL DEFAULT '',
  id_number               TEXT NOT NULL DEFAULT '',
  user_type               TEXT CHECK (user_type IN ('zaair', 'patur', 'murshe')),
  is_registration_complete BOOLEAN NOT NULL DEFAULT FALSE,
  deductions_summary      JSONB,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles: user manages own row"
  ON public.profiles FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Auto-create profile row on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── incomes ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.incomes (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL,
  amount         NUMERIC NOT NULL,
  description    TEXT NOT NULL,
  income_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT NOT NULL,
  customer_name  TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  document_url   TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.incomes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "incomes: user manages own rows"
  ON public.incomes FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ─── expenses ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.expenses (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID NOT NULL,
  amount                 NUMERIC NOT NULL,
  category               TEXT NOT NULL,
  description            TEXT,
  expense_date           DATE NOT NULL DEFAULT CURRENT_DATE,
  recognition_percentage NUMERIC NOT NULL DEFAULT 100,
  supplier_email         TEXT,
  supplier_phone         TEXT,
  document_url           TEXT,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "expenses: user manages own rows"
  ON public.expenses FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ─── notifications ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL,
  title      TEXT NOT NULL,
  message    TEXT NOT NULL,
  type       TEXT NOT NULL DEFAULT 'info'
               CHECK (type IN ('info','payment','submission','reminder','update')),
  read       BOOLEAN NOT NULL DEFAULT FALSE,
  due_date   DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications: user manages own rows"
  ON public.notifications FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ─── invoice_sends ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.invoice_sends (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL,
  income_id       UUID NOT NULL REFERENCES public.incomes(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  sent_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.invoice_sends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoice_sends: user manages own rows"
  ON public.invoice_sends FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ─── Realtime ─────────────────────────────────────────────────────────────────

ALTER PUBLICATION supabase_realtime ADD TABLE public.incomes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.expenses;
