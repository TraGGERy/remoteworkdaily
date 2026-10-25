-- ==============================================================================
-- Migration: 20261025_tasks_micro_gigs.sql
-- Module: Tasks, Micro-Gigs, Bounties & Make-Money Agents Aggregation
-- Schema upgrades for task and gig jobs
-- ==============================================================================

alter table public.jobs add column if not exists is_task boolean default false;
alter table public.jobs add column if not exists task_type text check (task_type in ('ugc_creator', 'research_interview', 'usability_testing', 'game_playtesting', 'ai_training_rlhf', 'transcription', 'code_bounty', 'design_contest', 'search_rating', 'tutoring'));
alter table public.jobs add column if not exists estimated_time text;
alter table public.jobs add column if not exists payout_reward text;
alter table public.jobs add column if not exists payout_type text check (payout_type in ('fixed', 'hourly', 'bounty', 'per_item'));
alter table public.jobs add column if not exists difficulty text check (difficulty in ('easy', 'intermediate', 'expert'));
alter table public.jobs add column if not exists instructions_url text;

create index if not exists idx_jobs_is_task on public.jobs (is_task);
create index if not exists idx_jobs_task_type on public.jobs (task_type);
