alter table profiles
  add column if not exists chat_history jsonb default '[]'::jsonb;
