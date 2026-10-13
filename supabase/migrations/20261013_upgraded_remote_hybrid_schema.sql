-- ==============================================================================
-- Migration: 20261013_upgraded_remote_hybrid_schema.sql
-- Module 1 & Module 3: User Profiles & Upgraded Remote/Hybrid Jobs Schema
-- Production-ready, idempotent PostgreSQL migration with RLS & performance indexes
-- ==============================================================================

-- 1. Create user_profiles table for Clerk onboarding & Pro Candidate membership
create table if not exists public.user_profiles (
  id text primary key default ('usr_' || gen_random_uuid()),
  clerk_user_id text not null unique,
  email text,
  work_type text not null default '100% Remote Anywhere',
  work_arrangement text default 'remote_global' check (work_arrangement in ('remote_global', 'remote_regional', 'hybrid_high_pay', 'both')),
  target_roles text[] default array[]::text[],
  skills text[] default array[]::text[],
  seniority text default 'Mid-level',
  min_salary numeric default 90000,
  preferred_location text default 'Worldwide',
  hybrid_city text,
  hybrid_country text,
  resume_text text default '',
  is_pro boolean default false,
  pro_plan text,
  stripe_customer_id text,
  stripe_subscription_id text,
  onboarding_completed boolean default true,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Ensure all columns exist on user_profiles if created previously
alter table public.user_profiles add column if not exists email text;
alter table public.user_profiles add column if not exists work_type text default '100% Remote Anywhere';
alter table public.user_profiles add column if not exists work_arrangement text default 'remote_global';
alter table public.user_profiles add column if not exists target_roles text[] default array[]::text[];
alter table public.user_profiles add column if not exists skills text[] default array[]::text[];
alter table public.user_profiles add column if not exists seniority text default 'Mid-level';
alter table public.user_profiles add column if not exists min_salary numeric default 90000;
alter table public.user_profiles add column if not exists preferred_location text default 'Worldwide';
alter table public.user_profiles add column if not exists hybrid_city text;
alter table public.user_profiles add column if not exists hybrid_country text;
alter table public.user_profiles add column if not exists resume_text text default '';
alter table public.user_profiles add column if not exists is_pro boolean default false;
alter table public.user_profiles add column if not exists pro_plan text;
alter table public.user_profiles add column if not exists stripe_customer_id text;
alter table public.user_profiles add column if not exists stripe_subscription_id text;
alter table public.user_profiles add column if not exists onboarding_completed boolean default true;

-- 2. Upgrade jobs table with Remote / High-Paying Hybrid metadata
alter table public.jobs add column if not exists work_arrangement text default 'remote_global' check (work_arrangement in ('remote_global', 'remote_regional', 'hybrid_high_pay', 'on_site'));
alter table public.jobs add column if not exists hybrid_city text;
alter table public.jobs add column if not exists hybrid_country text;
alter table public.jobs add column if not exists days_in_office text;
alter table public.jobs add column if not exists external_id text;
alter table public.jobs add column if not exists is_featured boolean default false;
alter table public.jobs add column if not exists is_active boolean default true;
alter table public.jobs add column if not exists employer_email text;

-- Backfill is_featured and is_active from existing columns if null
update public.jobs set is_featured = featured where is_featured is null and featured is not null;
update public.jobs set is_active = (status = 'active') where is_active is null;

-- 3. High-Performance Filter & Query Indexes
create index if not exists idx_jobs_work_arrangement on public.jobs (work_arrangement);
create index if not exists idx_jobs_hybrid_city on public.jobs (hybrid_city);
create index if not exists idx_jobs_is_featured on public.jobs (is_featured);
create index if not exists idx_jobs_is_active on public.jobs (is_active);
create index if not exists idx_jobs_employer_email on public.jobs (employer_email);
create index if not exists idx_jobs_external_id on public.jobs (external_id);
create index if not exists idx_jobs_salary_min on public.jobs (salary_min);

create index if not exists idx_user_profiles_clerk_id on public.user_profiles (clerk_user_id);
create index if not exists idx_user_profiles_email on public.user_profiles (email);
create index if not exists idx_user_profiles_is_pro on public.user_profiles (is_pro);
create index if not exists idx_user_profiles_onboarding on public.user_profiles (onboarding_completed);

-- 4. Row Level Security (RLS) for user_profiles
alter table public.user_profiles enable row level security;

drop policy if exists "Allow select on user_profiles" on public.user_profiles;
create policy "Allow select on user_profiles" on public.user_profiles
  for select using (true);

drop policy if exists "Allow insert and update on user_profiles" on public.user_profiles;
create policy "Allow insert and update on user_profiles" on public.user_profiles
  for all using (true) with check (true);
