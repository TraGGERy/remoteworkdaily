-- ==============================================================================
-- Migration: 20261024_public_sector_government_jobs.sql
-- Module: Government, Civil Service & International Public Sector Aggregation
-- Schema upgrades for public sector roles & standardized application packages
-- ==============================================================================

-- 1. Upgrade jobs table with public-sector metadata
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

-- 2. Indexes for fast public-sector search & filtering
create index if not exists idx_jobs_is_public_sector on public.jobs (is_public_sector);
create index if not exists idx_jobs_public_sector_type on public.jobs (public_sector_type);
create index if not exists idx_jobs_eligibility_type on public.jobs (eligibility_type);
create index if not exists idx_jobs_jurisdiction on public.jobs (jurisdiction);
create index if not exists idx_jobs_application_deadline on public.jobs (application_deadline);
create index if not exists idx_jobs_agency on public.jobs (agency);

-- 3. Upgrade user_profiles with public sector credentials & screening attributes
alter table public.user_profiles add column if not exists citizenship text default 'EU';
alter table public.user_profiles add column if not exists secondary_citizenship text;
alter table public.user_profiles add column if not exists degree_level text default 'Masters (EQF 7)';
alter table public.user_profiles add column if not exists language_proficiencies jsonb default '[]'::jsonb;
alter table public.user_profiles add column if not exists security_clearance text default 'None';
alter table public.user_profiles add column if not exists civil_service_grade_preference text;

-- 4. Create public.applications table for Easy Apply & compliance tracking
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

create index if not exists idx_applications_clerk_user on public.applications (clerk_user_id);
create index if not exists idx_applications_email on public.applications (candidate_email);
create index if not exists idx_applications_job_id on public.applications (job_id);
create index if not exists idx_applications_status on public.applications (status);

-- 5. Row Level Security for applications table
alter table public.applications enable row level security;

drop policy if exists "Allow select on applications" on public.applications;
create policy "Allow select on applications" on public.applications
  for select using (true);

drop policy if exists "Allow insert and update on applications" on public.applications;
create policy "Allow insert and update on applications" on public.applications
  for all using (true) with check (true);
