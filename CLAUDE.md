# Raise — project guide for Claude

Raise is Aayushi's capstone for the Airtribe AI-First PM course. It helps **parents of 13–18 year olds in urban India** start a hard talk with their teen by giving them **one ready first line, a planned teen-friendly moment, and coaching on how to react**. It is a talk tool, never a spy tool.

> In one line: Raise turns "have the talk" into "say one sentence on tonight's walk", in your own words, with no one watching.

## Who I'm working with

- Aayushi is a PM, **not a developer**. Explain things in plain language, one step at a time. Avoid jargon, or explain it in one short sentence when it's unavoidable.
- **Ask instead of assuming.** When something is unclear or a choice is hers to make, ask.
- She shares a design for each screen. **Build each screen from her design**; don't invent a visual style ahead of it.
- **No app code without her approval of the plan**, and work one screen at a time.
- After every work session, update `BUILD_LOG.md`: what we built, what broke, and the fix.

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
- AI fills a **fixed card** from a hand-written base card. No open chat in this MVP.
- Parts: why now · first line · two follow-up questions · 3 say / 3 avoid · "if they react" (quiet, upset, disagrees, doesn't want to talk).
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
- No "failed" labels, no streaks, points or badges. A missed or bad talk leads to recovery ("Not yet" → what got in the way → easier option; 😣 → repair line).

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

A **completed conversation** = a topic the parent planned, started in the planned window ("Start", then "Done" at least 5 minutes later), reflected on within 24 hours, and followed up at 3 days, all within 14 days of choosing it. Target: 40% of topics started. Crisis topics are left out.

## How to work

- Plain explanations, one screen at a time, her design first.
- Before building a screen: restate what it does, which FR it covers, and ask anything unclear.
- After building: test it on a phone-sized screen, then tell her exactly what to check on her own phone.
- Keep secrets (Gemini key, Supabase keys) out of the code and out of GitHub; they go in Vercel's settings and a local `.env.local` that is never committed.
- Log every session in `BUILD_LOG.md`.
