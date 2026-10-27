-- Raise: anonymous events and the completed-conversation metric.
-- Paste this whole file into Supabase → SQL Editor → Run. Safe to run again.
--
-- Privacy: this table only ever holds fixed labels (e.g. "card_viewed", "walk", "yes").
-- No names, no nickname, no reflection notes, nothing a parent typed. The app's server
-- checks every event against an allowed list (lib/eventSchema.ts) before saving it.

create table if not exists public.events (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  anon_id    text not null,            -- random id made on the phone; identifies no one
  event      text not null,            -- e.g. card_viewed, plan_set, talk_done
  topic      text,                     -- e.g. relationships (never shown to anyone)
  plan_id    text,                     -- random id of one planned talk
  props      jsonb not null default '{}'::jsonb  -- fixed-choice fields only
);

create index if not exists events_event_idx on public.events (event);
create index if not exists events_plan_idx  on public.events (plan_id);
create index if not exists events_anon_topic_idx on public.events (anon_id, topic);

-- Lock the table: nobody can read or write it from the browser.
-- Only the app's server (with the secret service key) can add rows.
alter table public.events enable row level security;

-- ---------------------------------------------------------------------------
-- View 1: the funnel. How many parents reached each step.
-- ---------------------------------------------------------------------------
create or replace view public.funnel with (security_invoker = true) as
select event,
       count(*)                as times,
       count(distinct anon_id) as parents
from public.events
group by event
order by parents desc;

-- ---------------------------------------------------------------------------
-- View 2: completed conversations (Step 2 definition).
-- A topic counts as COMPLETED when, within 14 days of first opening its card, the parent:
--   1. planned it                                   (plan_set)
--   2. started on time and talked 5+ minutes        (talk_done, on_time = true)
--   3. reflected within 24 hours, and it happened   (reflection_saved, yes/partly)
--   4. answered the 3-day follow-up and it matched  (follow_up_answered, matched = true)
-- Topics where help was offered are left out (crisis topics don't count either way).
-- ---------------------------------------------------------------------------
create or replace view public.topic_outcomes with (security_invoker = true) as
with started as (
  select anon_id, topic, min(created_at) as started_at
  from public.events where event = 'card_viewed'
  group by anon_id, topic
),
crisis as (
  select distinct anon_id, topic
  from public.events where event = 'reflection_saved' and (props->>'help_offered')::boolean
),
plans as (
  select anon_id, topic, plan_id, created_at as planned_at
  from public.events where event = 'plan_set'
),
done as (
  select plan_id, created_at as done_at, (props->>'on_time')::boolean as on_time
  from public.events where event = 'talk_done'
),
reflected as (
  select plan_id, created_at as reflected_at, props->>'happened' as happened
  from public.events where event = 'reflection_saved'
),
followed as (
  select plan_id, created_at as followed_at, (props->>'matched')::boolean as matched
  from public.events where event = 'follow_up_answered'
),
per_plan as (
  select p.anon_id, p.topic, p.plan_id,
         (d.on_time is true
          and r.happened in ('yes', 'partly')
          and r.reflected_at <= d.done_at + interval '24 hours'
          and f.matched is true
          and f.followed_at <= s.started_at + interval '14 days') as completed
  from plans p
  join started s on s.anon_id = p.anon_id and s.topic = p.topic
  left join done d      on d.plan_id = p.plan_id
  left join reflected r on r.plan_id = p.plan_id
  left join followed f  on f.plan_id = p.plan_id
)
select s.anon_id, s.topic, s.started_at,
       exists (select 1 from plans p where p.anon_id = s.anon_id and p.topic = s.topic)                 as planned,
       coalesce((select bool_or(pp.completed) from per_plan pp
                 where pp.anon_id = s.anon_id and pp.topic = s.topic), false)                           as completed,
       (s.started_at > now() - interval '14 days')                                                       as still_open
from started s
where not exists (select 1 from crisis c where c.anon_id = s.anon_id and c.topic = s.topic);

-- ---------------------------------------------------------------------------
-- View 3: the headline number. Target: 40% of topics started reach a completed conversation.
-- "still open" topics are under 14 days old and can still complete, so they're shown separately.
-- ---------------------------------------------------------------------------
create or replace view public.completion_rate with (security_invoker = true) as
select count(*)                                       as topics_started,
       count(*) filter (where completed)              as topics_completed,
       round(100.0 * count(*) filter (where completed) / nullif(count(*), 0), 1) as completion_rate_pct,
       count(*) filter (where still_open and not completed) as still_within_14_days,
       count(distinct anon_id)                        as parents,
       count(distinct anon_id) filter (where completed) as parents_with_a_completed_talk
from public.topic_outcomes;

-- Views are for the Supabase dashboard only, never the browser.
revoke all on public.funnel, public.topic_outcomes, public.completion_rate from anon, authenticated;
