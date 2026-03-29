# CountMe — CLAUDE.md

## Project overview
CountMe is a Hebrew-language web app for Israeli freelancers (עצמאים) to track income and expenses, classify deductions, and estimate tax liability.

## Tech stack
- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend/DB**: Supabase (PostgreSQL + Auth)
- **Hosting**: Vercel
- **State**: React Context (AuthContext), TanStack Query for server state

## Key directories
```
src/
  contexts/       AuthContext — auth state, profile, financial data cache
  pages/          Route-level pages (Auth, Onboarding, Dashboard, Income, Expenses)
  components/     Shared UI + feature components
  integrations/   Supabase client + generated types
```

## Auth flow
1. User lands on `/` → `RootRedirect` checks auth + profile
2. Not authenticated → shows `<Auth />`
3. Authenticated, no profile / incomplete → `/onboarding`
4. Authenticated, complete profile → `/dashboard`

**Important**: `isProfileLoading` must be awaited alongside `isLoading` before any routing decision. Free-tier Supabase can pause — profile fetches have a 10s AbortController timeout.

## Supabase tables
- `profiles` — user identity, `is_registration_complete`, `user_type` (zaair/patur/murshe)
- `incomes` — income records keyed by `user_id`
- `expenses` — expense records with `recognition_percentage` for partial deductions

## Session protocol
See `claude_progress.txt` for session state.
Session agent instructions: `.claude/agents/session_agent.md`

## Do not
- Mock Supabase in tests (integration tests must use real DB)
- Add speculative features or abstractions
- Skip the `isProfileLoading` guard when routing
