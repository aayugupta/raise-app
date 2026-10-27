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
-- View 2: completed conversations (Aayushi's simple rule, 28 Oct 2026; replaces the Step 2 definition).
-- A topic is STARTED when its 14-day journey begins on the phone (journey_started).
-- It is COMPLETED when a reflection where the talk happened (reflection_saved, yes/partly) is saved
-- within 14 days of that start (and before the same topic's next journey).
-- Journeys where help was offered are left out (crisis topics don't count either way).
-- "Not yet" reflections don't complete a journey.
-- ---------------------------------------------------------------------------
drop view if exists public.completion_rate;
drop view if exists public.topic_outcomes;

create view public.topic_outcomes with (security_invoker = true) as
with journeys as (
  select anon_id, topic, created_at as started_at,
         lead(created_at) over (partition by anon_id, topic order by created_at) as next_start
  from public.events where event = 'journey_started'
),
windowed as (
  select j.*, least(j.started_at + interval '14 days', coalesce(j.next_start, 'infinity'::timestamptz)) as window_end
  from journeys j
)
select w.anon_id, w.topic, w.started_at,
       exists (select 1 from public.events r
               where r.event = 'reflection_saved' and r.anon_id = w.anon_id and r.topic = w.topic
                 and r.created_at between w.started_at and w.window_end
                 and r.props->>'happened' in ('yes', 'partly')
                 and not coalesce((r.props->>'help_offered')::boolean, false))              as completed,
       (w.started_at > now() - interval '14 days')                                           as still_open,
       exists (select 1 from public.events r
               where r.event = 'reflection_saved' and r.anon_id = w.anon_id and r.topic = w.topic
                 and r.created_at between w.started_at and w.window_end
                 and coalesce((r.props->>'help_offered')::boolean, false))                  as help_offered
from windowed w;

-- ---------------------------------------------------------------------------
-- View 3: the headline number. Completed Conversation Rate = completed ÷ topics started.
-- Target: 40%. Topics under 14 days old can still complete, so they're also shown separately.
-- ---------------------------------------------------------------------------
create view public.completion_rate with (security_invoker = true) as
select count(*)                                                      as topics_started,
       count(*) filter (where completed)                             as topics_completed,
       round(100.0 * count(*) filter (where completed) / nullif(count(*), 0), 1) as completion_rate_pct,
       count(*) filter (where still_open and not completed)          as still_within_14_days,
       count(distinct anon_id)                                       as parents,
       count(distinct anon_id) filter (where completed)              as parents_with_a_completed_talk
from public.topic_outcomes
where not help_offered;

-- ---------------------------------------------------------------------------
-- View 4: confidence before → after (Step 6 leading indicator; parent survey Q14, 1–5).
-- Before = each parent's first rating at setup. After = their latest rating after a talk.
-- Compare with the survey baseline: 2.8 / 5 for parents who were putting a talk off.
-- ---------------------------------------------------------------------------
create or replace view public.confidence_change with (security_invoker = true) as
with ratings as (
  select anon_id, created_at, props->>'when' as rated_when, (props->>'value')::int as value
  from public.events where event = 'confidence_rated'
),
before as (
  select distinct on (anon_id) anon_id, value from ratings where rated_when = 'setup' order by anon_id, created_at
),
after as (
  select distinct on (anon_id) anon_id, value from ratings where rated_when = 'after_talk' order by anon_id, created_at desc
)
select count(*)                                   as parents_with_before_and_after,
       round(avg(b.value), 2)                     as average_before,
       round(avg(a.value), 2)                     as average_after,
       round(avg(a.value - b.value), 2)           as average_change,
       count(*) filter (where a.value > b.value)  as parents_more_confident
from before b
join after a on a.anon_id = b.anon_id;

-- Views are for the Supabase dashboard only, never the browser.
revoke all on public.funnel, public.topic_outcomes, public.completion_rate, public.confidence_change from anon, authenticated;
