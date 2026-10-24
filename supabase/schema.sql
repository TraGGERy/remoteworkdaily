-- ==============================================================================
-- Supabase Schema for Remote Work Daily
-- Production-ready PostgreSQL schema with RLS policies, indexing & constraints
-- Idempotent: Safe to run on fresh or existing databases without error.
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

-- Ensure all columns exist on jobs even if table was created in an earlier migration
alter table public.jobs add column if not exists location_code text default 'WW';
alter table public.jobs add column if not exists workplace_type text default 'remote' check (workplace_type in ('remote', 'hybrid', 'on-site'));
alter table public.jobs add column if not exists company_website text;
alter table public.jobs add column if not exists verified boolean default true;
alter table public.jobs add column if not exists featured boolean default false;
alter table public.jobs add column if not exists sticky boolean default false;
alter table public.jobs add column if not exists requirements text[] default array[]::text[];
alter table public.jobs add column if not exists views_count integer default 0;
alter table public.jobs add column if not exists applies_count integer default 0;
alter table public.jobs add column if not exists source text default 'direct';
alter table public.jobs add column if not exists employer_email text;
alter table public.jobs add column if not exists canonical_hash text;

-- Public Sector & Government metadata columns
alter table public.jobs add column if not exists is_public_sector boolean default false;
alter table public.jobs add column if not exists is_government boolean default false;
alter table public.jobs add column if not exists agency text;
alter table public.jobs add column if not exists agency_logo text;
alter table public.jobs add column if not exists jurisdiction text;
alter table public.jobs add column if not exists public_sector_type text check (public_sector_type in ('eu_institutions', 'national_government', 'un_international', 'regional_local'));
alter table public.jobs add column if not exists grade text;
alter table public.jobs add column if not exists eligibility_type text check (eligibility_type in ('open_worldwide', 'citizenship_required', 'visa_sponsored'));
alter table public.jobs add column if not exists citizenship_requirements text[] default array[]::text[];
alter table public.jobs add column if not exists security_clearance_required boolean default false;
alter table public.jobs add column if not exists security_clearance_level text;
alter table public.jobs add column if not exists application_deadline timestamptz;
alter table public.jobs add column if not exists languages_required text[] default array[]::text[];
alter table public.jobs add column if not exists required_documents text[] default array[]::text[];
alter table public.jobs add column if not exists original_apply_url text;
alter table public.jobs add column if not exists selection_ref text;
alter table public.jobs add column if not exists europass_ready boolean default true;
alter table public.jobs add column if not exists p11_ready boolean default false;
alter table public.jobs add column if not exists portal_type text;

-- 2. Candidate Passes Table (Subscriptions & Passes)
create table if not exists public.candidate_passes (
  id text primary key default ('pass_' || gen_random_uuid()),
  email text not null,
  amount numeric not null default 17.99,
  currency text default 'USD',
  stripe_session_id text unique,
  stripe_payment_intent text,
  status text default 'active' check (status in ('active', 'refunded', 'expired')),
  plan text default 'monthly',
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- Ensure all columns exist on candidate_passes if table existed previously
alter table public.candidate_passes add column if not exists plan text default 'monthly';
alter table public.candidate_passes add column if not exists stripe_payment_intent text;
alter table public.candidate_passes add column if not exists currency text default 'USD';

-- 3. Subscribers Table (Newsletter & Job Alerts)
create table if not exists public.subscribers (
  id text primary key default ('sub_' || gen_random_uuid()),
  email text not null unique,
  category text not null default 'all',
  status text default 'active' check (status in ('active', 'unsubscribed')),
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- 3.5 Applications Table (Government & Standard Easy Apply Packages)
create table if not exists public.applications (
  id text primary key default ('app_' || gen_random_uuid()),
  clerk_user_id text,
  candidate_email text not null,
  candidate_name text not null,
  job_id text references public.jobs(id) on delete cascade,
  job_title text not null,
  agency text not null,
  format_type text default 'europass' check (format_type in ('europass', 'un_p11', 'standard_ats')),
  eligibility_status text default 'eligible' check (eligibility_status in ('eligible', 'warning', 'ineligible')),
  eligibility_details jsonb default '{}'::jsonb,
  prefilled_package jsonb default '{}'::jsonb,
  motivation_letter text,
  status text default 'draft' check (status in ('draft', 'prefilled', 'submitted', 'archived')),
  submitted_at timestamptz,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- 4. Optimized Indexes for High-Traffic Filtering
create index if not exists idx_jobs_status on public.jobs (status);
create index if not exists idx_jobs_category on public.jobs (category);
create index if not exists idx_jobs_workplace_type on public.jobs (workplace_type);
create index if not exists idx_jobs_posted_at on public.jobs (posted_at desc);
create index if not exists idx_jobs_sticky_featured on public.jobs (sticky desc, featured desc, posted_at desc);
create index if not exists idx_jobs_tags on public.jobs using gin (tags);
create index if not exists idx_jobs_is_public_sector on public.jobs (is_public_sector);
create index if not exists idx_jobs_public_sector_type on public.jobs (public_sector_type);
create index if not exists idx_jobs_eligibility_type on public.jobs (eligibility_type);
create index if not exists idx_jobs_jurisdiction on public.jobs (jurisdiction);
create index if not exists idx_jobs_application_deadline on public.jobs (application_deadline);
create index if not exists idx_candidate_passes_email on public.candidate_passes (email);
create index if not exists idx_subscribers_email on public.subscribers (email);
create index if not exists idx_applications_clerk_user on public.applications (clerk_user_id);
create index if not exists idx_applications_email on public.applications (candidate_email);
create index if not exists idx_applications_job_id on public.applications (job_id);

-- 5. Row Level Security (RLS)
alter table public.jobs enable row level security;
alter table public.candidate_passes enable row level security;
alter table public.subscribers enable row level security;
alter table public.applications enable row level security;

drop policy if exists "Allow select on applications" on public.applications;
create policy "Allow select on applications" on public.applications
  for select using (true);

drop policy if exists "Allow insert and update on applications" on public.applications;
create policy "Allow insert and update on applications" on public.applications
  for all using (true) with check (true);

-- Public can read all active jobs
drop policy if exists "Public read access for active jobs" on public.jobs;
create policy "Public read access for active jobs"
  on public.jobs for select
  using (status = 'active');

-- Service role full access
drop policy if exists "Service role full access on jobs" on public.jobs;
create policy "Service role full access on jobs"
  on public.jobs for all
  using (auth.role() = 'service_role');

-- Allow server backend / anon key to insert and update jobs
drop policy if exists "Allow server insert on jobs" on public.jobs;
create policy "Allow server insert on jobs"
  on public.jobs for insert
  with check (true);

drop policy if exists "Allow server update on jobs" on public.jobs;
create policy "Allow server update on jobs"
  on public.jobs for update
  using (true);

-- Service role full access on candidate passes
drop policy if exists "Service role full access on candidate passes" on public.candidate_passes;
create policy "Service role full access on candidate passes"
  on public.candidate_passes for all
  using (auth.role() = 'service_role');

-- Allow server backend to insert and update candidate passes
drop policy if exists "Allow server insert on candidate passes" on public.candidate_passes;
create policy "Allow server insert on candidate passes"
  on public.candidate_passes for insert
  with check (true);

drop policy if exists "Allow server update on candidate passes" on public.candidate_passes;
create policy "Allow server update on candidate passes"
  on public.candidate_passes for update
  using (true);

-- Service role full access on subscribers
drop policy if exists "Service role full access on subscribers" on public.subscribers;
create policy "Service role full access on subscribers"
  on public.subscribers for all
  using (auth.role() = 'service_role');

-- Allow server backend to insert and update subscribers
drop policy if exists "Allow server insert on subscribers" on public.subscribers;
create policy "Allow server insert on subscribers"
  on public.subscribers for insert
  with check (true);

drop policy if exists "Allow server update on subscribers" on public.subscribers;
create policy "Allow server update on subscribers"
  on public.subscribers for update
  using (true);


