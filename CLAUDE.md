# Raise — project guide for Claude

Raise is Aayushi's capstone for the Airtribe AI-First PM course. It helps **parents of 13–18 year olds in urban India** start a hard talk with their teen by giving them **one ready first line, a planned teen-friendly moment, and coaching on how to react**. It is a talk tool, never a spy tool.

> In one line: Raise turns "have the talk" into "say one sentence on tonight's walk", in your own words, with no one watching.

## Who I'm working with

- Aayushi is a PM, **not a developer**. Explain things in plain language, one step at a time. Avoid jargon, or explain it in one short sentence when it's unavoidable.
- **Ask instead of assuming.** When something is unclear or a choice is hers to make, ask.
- She shares a design for each screen. **Build each screen from her design**; don't invent a visual style ahead of it.
- **No app code without her approval of the plan**, and work one screen at a time.
- ~~After every work session, update `BUILD_LOG.md`~~ **Paused (27 Oct 2026, Aayushi's request): don't update `BUILD_LOG.md` for now.** Its last entry is the new Welcome screen. Everything after that is in the Git history (`git log`); write those entries later, when she asks, from the commit messages.

## Source of truth

The research and decisions live in `docs/` (Steps 1–4; also bundled in `docs/raise-docs.zip`). Read them before planning a feature. Most important:

- `docs/3 Step 3 - Features, MVP, Talk Card, Library, Boundary.md` — features, the Talk Card, the content engine (panic test), the safety boundary
- `docs/4 Step 4 - Journeys, PRD, Design Rationale.md` — PRD, functional requirements FR1–FR13, user flow
- `docs/2 Step 2 - Frame the Problem.md` — the completed-conversation metric

## Decisions made after the docs (these WIN if the docs disagree)

| Topic | Decision | What it overrides in the docs |
| --- | --- | --- |
| Platform | **Mobile web app** (works in the phone's browser) | "Android first" |
| AI | **Google Gemini, free tier**. The API key lives only on the server (Vercel), never in the browser | — |
| Data | **Private notes stay on the phone** (browser storage). **Only anonymous events** go to Supabase | "Account optional after first card" — no accounts in this MVP |
| Reminders | **"Add to calendar" + in-app reminders.** No WhatsApp, no push notifications | "Notification 15 min before" |
| Hosting | **GitHub + Vercel**, on a public link | — |
| Users | **Parents only.** No teen involvement of any kind | — |
| Scope | **Thin MVP**, not the full v1 | The 11-feature v1 is the long-term plan |

## Build decisions (Q&A, 25 Oct 2026)

| Question | Decision |
| --- | --- |
| Base Talk Cards | Claude drafts each hand-written base card from the research; Aayushi edits the wording before it goes in the app |
| Topics | **All 6 v1 topics get a full base card and AI card**: relationships and crushes, stress and feelings, friends and peer pressure, online safety, consent and personal safety, body and growing up |
| Reflections | **Never sent to Gemini or anywhere else.** The 3-day follow-up and the "next first line" come from templates on the phone |
| Safety checks | Run on both free-text boxes: the setup "what do you want to talk about" box (refusals for spying / diagnosis / medicines, with a better card offered) and the reflection (danger signs, checked on the phone → help offer) |
| Language | Hinglish (default), Hindi and English from day one. The AI writes the card in the chosen language; app buttons stay in simple English/Hinglish |
| Content engine | A hidden page only Aayushi uses: she pastes a claim and its source link(s), the agent runs the panic test, explains each check, and she approves or rejects. The page shows the accepted / rejected / watch-list log |
| Accounts | GitHub exists. Vercel, Supabase and a Gemini API key still need creating; walk her through each when needed |
| Designs | **Wait for her design before building each screen** (Figma, screenshot or sketch). Behind-the-scenes work (Gemini, Supabase, safety checks) can go ahead meanwhile |

## Brainstorm flow decisions (27 Oct 2026, these WIN over the docs)

Aayushi's brainstorm of the app flow is in `docs/brainstorm-app-flow.webp` (14 screens). Use it as the reference for **flow and screens**; the look stays as in Visual design below.

| Question | Decision |
| --- | --- |
| Topics | **8 topics**: the docs' 6 (relationships, stress, friends, online safety, consent, body) **+ Study & future + Screen time**. Claude drafts the 2 new base cards; Aayushi edits |
| Age bands | **10–13 / 14–16 / 17–19** (replaces 13–15 / 16–18) |
| Navigation | **Bottom tab bar**: Home · Topics · AI Coach · Progress · Profile |
| Home | Brainstorm screen 3: greeting, "Continue your journey" with progress, a grid to start a new conversation |
| Progress | Brainstorm screen 13: talks completed / in progress, and **confidence before → after** (1–5, asked at setup and after talks; the Step 6 metric) |
| Profile | Brainstorm screen 14, adapted: no accounts, so no log in / log out; no "saved topics" (no save button) |
| AI Coach | **Build the open chat** (brainstorm screen 9; was v2 in the docs). Every message in and out goes through the safety checks; the 30-message test is extended to it |
| Kept from earlier decisions | No push notifications (calendar + in-app reminders). Help shows public helplines only: the counsellor/doctor network stays cut (Step 3) |

## Simplified flow decisions (28 Oct 2026, these WIN over everything above)

Aayushi's simplified wireframe (10 screens + Emergency help) replaces the 14-screen brainstorm as the reference for **flow and screens**. The look stays as in Visual design.

| # | Screen | Decision |
| --- | --- | --- |
| 1 | Welcome | Logo, tagline **"Better conversations. Brighter tomorrows."**, line "Guiding parents to build stronger bonds, one conversation at a time", parent-and-teen illustration (mother/father with daughter/son) |
| 2 | About you | "Hey there! You're not just a username, we want to get to know you!" · Mother / Father / Guardian. **No nickname step**: Home greets "Hello Mumma" / "Hello Papa" from the role |
| 3 | About your teen | Age band + gender (Girl / Boy / Prefer not to say) on **one screen** |
| 4 | Confidence + topic | Confidence 1–5, then pick a topic or "Skip, I'll choose later". **The free-text "what do you want to talk about" box is removed** |
| 5 | Home | "Hello Mumma/Papa", topic carousel, active 14-day journey card, "Choose topic from library" |
| 6 | Topic flashcards | The Talk Card split into **4 swipeable flashcards**: (1) opening lines, (2) gentle questions the parent can ask their teen, (3) what to say / what not to say, (4) how to respond when your child reacts (quiet, upset, disagrees, doesn't want to talk). Safety promise on every card |
| 7 | AI Coach | Where parents **share how a talk went, ask their doubts, and bring any topic not in the flashcards**. Calm guidance from real Gemini, safety checks on every message in and out. **Serious concerns get a dismissible "Would you like help from a professional?" option** leading to Emergency help; the parent decides |
| 8 | Plan the talk | When, time, setting, reminder, app's suggested best time |
| 9 | Reflection | What did you say · what did your child say · who spoke more · if it didn't go well, what got in the way → Save. Stays on the phone |
| 10 | Progress | Topics started vs completed, 14-day journey, confidence over time. Lives under the Journey tab |
| + | Emergency help | Its own tab. Public helplines + when to talk to a professional (no counsellor network) |

| Question | Decision |
| --- | --- |
| Navigation | **Bottom tab bar: Topics · AI Coach · Journey · Help · Profile.** The Topics tab opens Home (carousel + "Choose topic from library"); the Help tab is labelled "Help" (read aloud as "Emergency help"). Journey opens `/journey`: active journeys, completed vs started, confidence, past talks (`/progress` redirects there) |
| Home extras | **"I had a talk" and the 3-day follow-up are removed from Home** (Aayushi, 28 Oct 2026). The in-app "It's time" reminder stays |
| Age bands | **12–14 / 15–16 / 17–19** |
| Topics | **Back to the docs' 6** (relationships, stress, friends, online safety, consent, body). Study & future and Screen time come out |
| Reminders | **In-app only.** No push notifications, no "Add to calendar" |
| Language / comfort | Not asked in setup. Hinglish by default; both changeable in Profile |
| Streak | Shown as **"Day 5 of 14"**, never a streak counter (no-streaks rule stands) |
| AI Coach privacy | What the parent types in AI Coach **is sent to Google's Gemini** to write a reply. Coach and the Privacy screen say so plainly: "What you type here goes to Google's Gemini AI to write a reply. Don't use names." Reflections still never leave the phone. Coach messages are never sent to Supabase |
| AI Coach history | **Kept on this phone only**; "Clear my data" deletes it. If a message shows a crisis, the chat keeps only that help was shown, not the details |
| Metric | **Completed Conversation Rate = topics with a reflection saved within 14 days ÷ topics started.** Replaces the Start/Done timing, 24-hour and 3-day follow-up rule in "The metric" below |

## Visual design

Aayushi's reference design (25 Oct 2026) is a warm, illustrated parenting app: a peach welcome screen with a big serif headline, a teal button and a flat illustration filling the bottom; a cream home screen with a greeting, rounded illustrated cards and serif section titles.

**The reference is for look only: colours, fonts, illustration style and layout feel. All content, sections and screens come from Raise's docs and flows, never from the reference.**

- **Colours** are tokens in `app/globals.css`: peach `#f9d898`, cream `#fbf4ea`, teal `#0e716d` (buttons), ink `#1f2340` (headlines), coral `#e8735a`, mustard `#e7b04a`, leaf `#4e8a5e`.
- **Fonts:** DM Serif Display for headlines, Nunito for everything else (loaded in `app/layout.tsx`).
- **Illustrations** are Raise's own flat SVGs in the same style (e.g. `components/WalkTogether.tsx`). Never copy the reference's artwork, and show parents with teens, not babies.
- **Flat illustrations only, no photos** (decided 25 Oct 2026). Families look Indian: skin tones, clothes, homes. Show fathers as well as mothers, and sons as well as daughters.
- **Scene ideas from Aayushi's mood pictures** (drawn as our own, never copied):

  | Screen | Scene |
  | --- | --- |
  | Welcome | Raise logo with sprout, tagline "Better conversations. Brighter tomorrows.", a mother, father, daughter and son on soft green hills (simplified flow screen 1) |
  | Setup / late-evening moment | Family on a sofa in warm lamp light, parents listening |
  | Pick a topic | Family sitting together, each topic in a thought bubble |
  | Recovery / repair | Parent's hand on the teen's shoulder, both smiling |

- **Copy follows Raise's rules, not the reference.** No worry or fear hooks ("Are you worried…?").
- Reference sections like "Your friends" or "Activities done / Incomplete" are not Raise content. Home shows Raise's own sections (e.g. next planned talk, open topics, follow-up due, Help).
- Every screen must fit a 320 px-wide phone without sideways scrolling.

## What the MVP must do (Step 5 brief)

1. Onboarding that captures the teen's age band and what the parent wants to talk about.
2. An AI-generated Talk Card for at least one topic, using Gemini.
3. A way to record what happened after the talk (reflection).
4. A reason to come back.
5. A content engine: an AI agent that checks new claims against the panic test and shows what it accepted and rejected.
6. The safety boundary rules from Step 3, actually built in.
7. Works on a real phone, on mobile data, through a public link.

## Product rules (never break these)

**Privacy and trust**
- No login, phone number, email or password. A nickname at most.
- Reflections and anything the parent types stay on the phone. Events sent to Supabase carry **no free text, no names, no topic text a teen could see** — only things like `card_viewed`, `plan_set`, `talk_done`, with a random anonymous ID.
- Calendar events and any reminder text **never show the topic** (e.g. "Your walk" / "Your planned moment"), because a teen might see the parent's phone.
- Never store crisis details, only that help was shown.

**The Talk Card**
- AI fills a **fixed card** from a hand-written base card. (Open questions go to the AI Coach, built 28 Oct 2026: `app/coach`, `app/api/coach`, safety in `lib/coachSafety.ts`, tested in `tests/coach.test.mjs` and the 30-message test.)
- Parts: why now · first line · **10 gentle questions** (28 Oct 2026, was two) · 3 say / 3 avoid · "if they react" (quiet, upset, disagrees, doesn't want to talk). The "doesn't want to talk" line accepts the no without guilt, promises not to push, and leaves one easy door open (later, a walk, a text).
- The **safety promise** ("You won't be in trouble for telling me") and the escalation signs appear on every card, whatever the AI writes.
- Ends with **"Plan this talk"** or **"Not now"**. There is **no save button**.
- If the AI fails, is slow, or its output breaks a rule, show the hand-written base card instead.

**What Raise never says** (check every AI output against this)
- Never diagnoses, or gives medical, medicine or legal advice.
- Never shames or scares; no fear words ("dangerous new trend", "every parent must").
- Never suggests spying, tracking, reading messages, or taking the phone away as a threat; never physical punishment.
- Never judges or tries to change a teen's sexuality or gender identity.
- No graphic sexual detail. No promised results.

**Refusals always offer something better** (e.g. "How do I read her WhatsApp?" → "Raise doesn't help with monitoring" + a Talk Card on trust).

**Help and escalation**
- Help is reachable from every screen: 112, Tele-MANAS 14416, Childline 1098, Cybercrime 1930 / cybercrime.gov.in, Take It Down, NIMHANS SHUT.
- Picking a crisis topic (self-harm, abuse, photo blackmail, addiction) opens the help screen.
- Danger signs in a reflection show a **dismissible** card: "This sounds serious. Would you like help from a professional?" The parent decides; Raise never forces.
- Launch rule: the gentle offer appears for 100% of danger signs in the 30-message test set. Re-test whenever the AI prompt or cards change.

**No shame, no games**
- No "failed" labels, no streaks, points or badges. **One exception, Aayushi's decision (28 Oct 2026):** Home shows a **"Becoming a Super Parent"** goal bar: one step per topic the parent has had a talk about (`topicsTalkedAbout` in `lib/metric.ts`), "Super Parent ⭐" at all 6. Kind wording only: it never says a parent isn't one, it only goes up (nothing lost for missed days), no streaks. A missed or bad talk leads to recovery ("Not yet" → what got in the way → easier option; 😣 → repair line).

**Tone and language**
- Hinglish by default, with Hindi and English options. Warm, calm, short sentences.
- Lead with the teen's side of the topic (relationships, feelings, friends), with safety folded in.
- Suggest walks and late evenings first; meals and the car last.
- Fathers get lighter, side-by-side openers and extra reassurance.

**Content engine (panic test)** — a claim is accepted only if it passes all four:
1. Source: 2 independent trusted sources, or 1 official / peer-reviewed source. News is a lead, never proof.
2. Scale: many teens affected, not one case.
3. India fit: Indian data or Indian cases.
4. Action: a parent can do something useful about it in a talk.
Failures go on a watch list. Accepted claims still need human approval before reaching a card. Every card shows "Checked on [date] · Sources". No push alerts.

## The metric

**Current rule (28 Oct 2026, Aayushi's decision; replaces the definitions below):** Completed Conversation Rate = topics with a reflection where the talk happened (Yes or Partly) saved within 14 days of the topic's start ÷ topics started. A topic starts when its 14-day journey begins (flashcards first opened, picked in setup, or planned): the `journey_started` event. **A logged talk counts even if it went badly** (😣 Hard): only whether it happened matters, not how it went (Aayushi, 28 Oct 2026). "Not yet" doesn't complete a journey; journeys where help was offered are left out. **Reflection is two taps** (did it happen + how it went); what was said, who spoke more and the rest are optional. Computed on the phone in `lib/metric.ts` (tested in `tests/completion.test.mjs`) and in Supabase (`supabase/schema.sql`, views `topic_outcomes` and `completion_rate`). Parents see counts only, never a percentage.

*Earlier definitions, kept for the record:*

A **completed conversation** = a topic the parent planned, started in the planned window ("Start", then "Done" at least 5 minutes later), reflected on within 24 hours, and followed up at 3 days, all within 14 days of choosing it. Target: 40% of topics started. Crisis topics are left out.

**Change (27 Oct 2026, Aayushi's decision): unplanned talks count too.** A parent can log a talk that happened without a plan ("I had a talk" on Home). It counts as completed when it's reflected on within 24 hours of logging (and it happened) and the 3-day follow-up matches, within 14 days. The "planned" and "started on time" steps don't apply to it. Report planned and unplanned completions separately, so Raise's effect stays visible.

## How to work

- Plain explanations, one screen at a time, her design first.
- Before building a screen: restate what it does, which FR it covers, and ask anything unclear.
- After building: test it on a phone-sized screen, then tell her exactly what to check on her own phone.
- Keep secrets (Gemini key, Supabase keys) out of the code and out of GitHub; they go in Vercel's settings and a local `.env.local` that is never committed.
- Run `npm test` after any change to rules, safety checks or the metric. It runs every `tests/*.test.mjs` file and fails on any failure or crash. Add a test for every new safety rule.
- Base Talk Cards live in `content/base-talk-cards.md` (Aayushi edits this). `scripts/build-cards.mjs` turns it into `lib/base-cards.json` before every dev/build run, and refuses a card with missing parts.
- Build log: paused (see "Who I'm working with"). Write clear Git commit messages instead, so the log can be written later.
