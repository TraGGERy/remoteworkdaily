-- ==============================================================================
-- Supabase Schema for Remote Work Daily
-- Production-ready PostgreSQL schema with RLS policies, indexing & constraints
-- ==============================================================================

-- 1. Jobs Table
create table if not exists public.jobs (
  id text primary key,
  slug text not null unique,
  title text not null,
  company text not null,
  company_slug text not null,
  company_logo text,
  company_website text,
  verified boolean default true,
  featured boolean default false,
  sticky boolean default false,
  location text default 'Worldwide',
  location_code text default 'WW',
  workplace_type text default 'remote' check (workplace_type in ('remote', 'hybrid', 'on-site')),
  category text not null default 'dev',
  tags text[] default array[]::text[],
  benefits text[] default array[]::text[],
  salary_min numeric,
  salary_max numeric,
  salary_currency text default 'USD',
  description text default '',
  requirements text[] default array[]::text[],
  apply_url text not null,
  posted_at timestamptz default timezone('utc'::text, now()) not null,
  views_count integer default 0,
  applies_count integer default 0,
  source text default 'direct',
  status text default 'pending_payment' check (status in ('active', 'pending_payment', 'archived')),
  employer_email text,
  canonical_hash text unique,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- 2. Candidate Passes Table (One-Time Hunter Pass Purchases)
create table if not exists public.candidate_passes (
  id text primary key default ('pass_' || gen_random_uuid()),
  email text not null,
  amount numeric not null default 39,
  currency text default 'USD',
  stripe_session_id text unique,
  stripe_payment_intent text,
  status text default 'active' check (status in ('active', 'refunded', 'expired')),
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 3. Optimized Indexes for High-Traffic Filtering
create index if not exists idx_jobs_status on public.jobs (status);
create index if not exists idx_jobs_category on public.jobs (category);
create index if not exists idx_jobs_workplace_type on public.jobs (workplace_type);
create index if not exists idx_jobs_posted_at on public.jobs (posted_at desc);
create index if not exists idx_jobs_sticky_featured on public.jobs (sticky desc, featured desc, posted_at desc);
create index if not exists idx_jobs_tags on public.jobs using gin (tags);
create index if not exists idx_candidate_passes_email on public.candidate_passes (email);

-- 4. Row Level Security (RLS)
alter table public.jobs enable row level security;
alter table public.candidate_passes enable row level security;

-- Public can read all active jobs
create policy "Public read access for active jobs"
  on public.jobs for select
  using (status = 'active');

-- Service role has full unrestricted access (for server actions and webhooks)
create policy "Service role full access on jobs"
  on public.jobs for all
  using (auth.role() = 'service_role');

-- Service role full access on candidate passes
create policy "Service role full access on candidate passes"
  on public.candidate_passes for all
  using (auth.role() = 'service_role');
