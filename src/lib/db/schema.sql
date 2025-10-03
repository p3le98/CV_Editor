-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- CV Parsed Data Table
create table parsed_cvs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users,
  original_text text not null,
  parsed_data jsonb not null,
  language text not null,
  confidence_score float not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table parsed_cvs enable row level security;

create policy "Users can view their own parsed CVs"
  on parsed_cvs for select
  using (auth.uid() = user_id);

create policy "Users can insert their own parsed CVs"
  on parsed_cvs for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own parsed CVs"
  on parsed_cvs for update
  using (auth.uid() = user_id);

-- Trigger for updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger update_parsed_cvs_updated_at
  before update on parsed_cvs
  for each row
  execute function update_updated_at_column();

-- Index for faster queries
create index parsed_cvs_user_id_idx on parsed_cvs(user_id);
create index parsed_cvs_language_idx on parsed_cvs(language);
