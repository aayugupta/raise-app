# Raise — Build Log

What we built, what broke, and how we fixed it. Newest entries at the top.

---

## 2026-10-27 — New Welcome screen (brainstorm screen 1)

**Built**
- `components/Logo.tsx`: the **Raise wordmark** in deep teal with a **sprout** (an orange and a green leaf) above the "i", as in the brainstorm.
- `components/GreenHills.tsx`: soft rolling green hills with a warm glow, a few small trees and a path.
- Welcome screen rebuilt to match brainstorm screen 1: the logo, the tagline **"Better conversations. A stronger tomorrow."**, "Practical support for parents to have meaningful conversations with their teenagers.", the hills, and a wide rounded **Get Started** button (Continue for returning parents).
- Kept from earlier rules: Help at the top, and "No sign-up. Stays private on your phone."
- The tagline is now also the app's description (shown when the link is shared), and the phone's top-bar colour matches the new screen.

**Broke**
- On the smallest phone (320 × 640) the page was a little taller than the screen, so the privacy line was cut off.

**Fix**
- The hills shrink on short screens, cropping only sky from the top. Now fits with no scrolling.

**Checked**
- 375 × 812 and 320 × 640. New visitor → Get Started → Setup; returning → Continue → Home. `npm test` 9/9, build passes.

---

## 2026-10-27 — Progress + confidence before → after (brainstorm screen 13)

**Built**
- **Confidence**, using the parent survey's exact question (Q14), so it compares with the survey baseline (2.8 / 5 for parents putting a talk off):
  - **Before:** a new Setup question (now 8): "How confident do you feel about starting a hard talk with your child?" 1 Not at all … 5 Very.
  - **After:** an optional question at the end of each reflection: "How confident do you feel about your next talk?"
  - Parents who did setup before this change get a one-tap prompt on Progress.
  - `lib/confidence.ts` saves ratings on the phone; only the number goes out (new event `confidence_rated`: value 1–5, setup or after_talk).
  - `components/ConfidenceScale.tsx`: the 1–5 buttons, shared by Setup, Reflection and Progress.
- **Progress screen** ("Your journey"):
  - A ring with **talks done / total** (done = reflected and happened; total adds in-progress journeys), plus a legend.
  - **Your confidence: Before x/5 → Now y/5**. Rising: "Up 2 since you started. Every talk makes the next one easier." Same or lower: "Confidence goes up and down. Every talk still counts." (never a judgement).
  - **Your talks:** newest first, with topic, date, how the teen responded (emoji), "Your teen talked more 💛", and what you learned.
  - "Only you can see this. It stays on your phone." No streaks, no scores.
- `supabase/schema.sql`: new view **confidence_change**: average before, average after, average change, parents more confident. That's the Step 6 number.

**Broke**
- With no talks yet, the progress ring showed a stray teal dot (the rounded end of a zero-length bar).

**Fix**
- The ring draws nothing when no talks are done.

**Checked**
- Empty Progress → tapped "2" → Before 2/5, Now "–".
- Reflected on a talk with "4" → Progress: 1/2 talks, **2/5 → 4/5 "Up 2"**, the talk listed with 😊 and the note. Stored on the phone: setup 2, after_talk 4.
- Setup shows the question as 7 of 8. 320 px fits. `npm test` 9/9 (events test now covers confidence, refusing 9). Build passes.

---

## 2026-10-27 — Bottom tab bar + new Home (brainstorm screen 3)

**Built**
- `components/BottomNav.tsx`: **Home · Topics · AI Coach · Progress · Profile**, with simple line icons and the current tab in teal. It's shown **only on the 5 main screens**; it's hidden during setup, the Talk Card, the Planner, Talk mode and Reflection, which have their own bottom buttons and need focus.
- **New Home**, following brainstorm screen 3:
  - "Good afternoon, Mumma · Small steps. Big conversations." with Help.
  - The "It's time" banner and the 3-day question, as before.
  - **Continue your journey:** one card per active topic, with **Step x of 3 (Prepare → Talk → Reflect)**, a 3-part progress bar, the time, and the next action (Plan this talk / See your first line / Open Talk mode / Tell us how it went). Most urgent first. It **replaces** the old "next talk", "open topics" and check-in lists, so nothing shows twice. When nothing is active: a small "Ready when you are".
  - **Start a new conversation:** a 2-column grid of all 8 topics with icons.
  - 💬 I had a talk.
- `lib/journey.ts`: works out each topic's step. `lib/topics.ts`: each topic now has a short name and an icon.
- Topics screen: has the tab bar; Back now returns to the previous screen.
- Placeholder AI Coach, Progress and Profile screens with the tab bar.
- `tests/journey.test.mjs`: 8 checks.

**Broke**
- The tab buttons had no names for screen readers.

**Fix**
- Added labels.

**Checked**
- Home with a talk now, one yesterday, one tomorrow and an open topic: the banner shows the current one; the journey shows Reflect, Talk and Prepare in that order with the right actions.
- Empty state; tab switching (Progress highlighted); Topics has the bar, the Talk Card doesn't; 320 px wide fits.
- `npm test` 9/9 files. Build passes.

---

## 2026-10-27 — Brainstorm flow: decisions, new age bands, 2 new topics

**Decided (Aayushi, from her brainstorm `docs/brainstorm-app-flow.webp`; recorded in CLAUDE.md)**
- Build: **bottom tab bar + new Home**, **Progress with confidence before → after**, **Profile / Settings**, and the **AI Coach chat** (was v2 in the docs).
- Topics: **8**, the docs' 6 + **Study and future** + **Screen time**.
- Age bands: **10–13 / 14–16 / 17–19** (was 13–15 / 16–18).
- Kept: no push notifications; Help shows public helplines only (the counsellor/doctor network stays cut); no log in / log out, no save button.

**Built in this step**
- **Age bands** switched everywhere: Setup ("How old is your child?", 3 choices), the AI instructions (10–13: friends and school only, never the child's own romantic life; 14–16: friends first; 17–19: their own life and choices, respecting independence), the server's allowed values, events, and the Privacy example. Old saved answers move to the nearest new band (13–15 → 14–16, 16–18 → 17–19).
- **Two new base cards** drafted in `content/base-talk-cards.md` (for Aayushi to edit), using only facts from the research:
  - **Study and future**: "What would you choose if no one else's opinion mattered?" (NCERT 2022: 81% say exams cause anxiety).
  - **Screen time**: "What's a fair phone rule for everyone at home, parents too?" (IAP 2022: no fixed limit; protect sleep, screens off an hour before bed, rules made together). The "Avoid" list warns against phone threats and checking secretly.
- Both topics added everywhere: topic list (8), events, card converter (expects 8), and Setup text matching ("career / college / tuition" → Study; "phone / gaming / reels" → Screen time).

**Broke**
- Nothing broke. Moving "phone / gaming / reels" from Online safety to Screen time could have changed an existing Setup suggestion ("instagram and reels"); the test confirmed it still points to Online safety.

**Checked**
- Live AI cards: Study (mother, 10–13, Hinglish), Screen time (father, 17–19, Hindi) and Relationships (10–13, English, kept to friends' crushes). All personalised, about 2 s each.
- Topics screen shows 8; Setup shows 3 age bands.
- `npm test` 8/8 files (card safety now checks all 8 base cards; setup test has the 2 new topics). Build passes.

**Next (in order)**
1. Bottom tab bar + new Home
2. Progress + confidence before → after
3. Profile / Settings
4. AI Coach chat (with safety checks on every message, and the 30-message test extended to it)

---

## 2026-10-27 — "I had a talk" (logging unplanned talks)

**Why**
- Aayushi spotted that parents could only reflect on a talk they had **planned** in Raise. A talk that just happened (in the car, at dinner) had nowhere to go.

**Decided (Aayushi)**
- Add an "I had a talk" button.
- **Unplanned talks count in the metric.** This changes Step 2: an unplanned talk is completed when it's reflected on within 24 hours of logging (and it happened) and the 3-day follow-up matches, within 14 days. Recorded in `CLAUDE.md`.
- No "My talks" history for now.

**Built**
- **"💬 I had a talk"** on Home, under Start a new topic.
- `app/log/page.tsx`: "Had a talk? Note it here. Talks that just happen count too." Three taps: **what** (6 topics), **when** (Today / Yesterday / Earlier this week), **where** (walk, evening, chores, meal, car). Then the same 30-second reflection, with the danger-sign check, repair path and 3-day follow-up.
- The talk is saved on the phone as already done and marked unplanned. Reflection asks **"Did you get into the topic?"** with Yes / Partly only (no "Not yet", since it already happened).
- New anonymous event `talk_logged` (topic, moment, when: fixed choices only).
- `supabase/schema.sql`: logged talks start a topic, count toward completion, and **completion_rate now also shows `completed_after_a_plan` and `completed_unplanned_only` separately**, so Raise's own effect stays visible.

**Broke**
- The 6 topic buttons on the new screen had no names for screen readers.

**Fix**
- Added labels.

**Checked**
- Home → I had a talk → Friends, Yesterday, In the car → reflection shows Yes / Partly. Saved as unplanned, 1 day ago, done.
- `npm test`: 8/8 files (events test now includes `talk_logged`, and refuses a free-text place). Build passes.

---

## 2026-10-27 — Safety and polish pass

**Built**
- **Help on every screen.** Added a shared Help button (`components/HelpPill.tsx`) to Welcome, Setup, Privacy, the card's loading view, and the "done" screens of the Planner, Reflection and Follow-up. Help's back button now returns to wherever the parent came from (it always went to topics before). The general Help screen also lists cybercrime.gov.in, Take It Down and NIMHANS (SHUT clinic).
- **The 30-message safety test** (`tests/safety-30.test.mjs`), from Step 3 section 6D: 17 danger signs (9 plain, 8 hidden warning signs), 6 spying requests, 5 diagnosis or medicine questions, 2 identity questions, in English, Hinglish and Hindi. **Every danger sign is tested in both places a parent can type** (setup box and reflection). It prints the two launch numbers.
- **Anonymous events**, phone → our server → Supabase:
  - `lib/eventSchema.ts`: **the only things that can ever leave the phone.** 10 fixed events (setup_completed, card_viewed, topic_not_now, plan_set, talk_started, talk_done, reflection_saved, follow_up_answered, recovery_chosen, help_shown) with fixed-choice fields only. The server **refuses** any event with an unknown field or free text (e.g. a nickname or reflection notes).
  - `lib/events.ts`: a random anonymous ID made on the phone; sending never slows or breaks the app.
  - `app/api/event/route.ts`: checks each event, then saves it to Supabase with a secret key that never reaches the phone. **Until Supabase is set up, events are accepted and dropped.**
  - `help_shown` records only *that* help was shown and where, never which crisis.
  - Every screen sends its event at the right moment, e.g. `talk_done` carries `on_time` (the 5-minute and window rule).
- `supabase/schema.sql`: the `events` table (locked: nothing can read or write it from a browser) and 3 dashboard views: **funnel** (parents per step), **topic_outcomes** and **completion_rate**, which works out the Step 2 completed-conversation rate (planned → on time and 5+ min → reflected within 24 h → follow-up matched, within 14 days; help-offered topics excluded).
- `tests/events.test.mjs`: 12 checks that only allowed labels get through.

**Broke**
1. **The first run of the 30-message test: only 10 of 17 danger signs (59%) showed the help offer.** It missed every *hidden* warning sign ("better off without her", "gave away his favourite things", "saying goodbye to his friends", "wants to disappear forever", "sab uske bina khush rahenge"), plus "khud ko khatam kar dega" and "teacher touches her". It also missed one spying request ("see who he chats with").
2. My first "disappear" pattern would have flagged "he just wants to disappear into his room", which is normal teen behaviour.
3. Opening Help sent its event twice in the test version of the app.

**Fix**
1. Added patterns for each hidden warning sign, Hinglish forms, "touches", and "see who … chats". **Now 30 of 30: 100% of danger signs show the offer; 100% of refusals offer a better topic.**
2. Narrowed it to "disappear forever / for good / from everyone", and added ordinary examples to the reflection test (24/24).
3. One event per visit (a guard in `TrackOnView`).

**Checked**
- Welcome and Setup with Help fit a 320 px phone.
- Events go out from screens; valid → accepted (204); with nickname or notes → refused (400).
- `npm test`: **8 of 8 files, 164 checks.** Build passes.

**Still to do**
- Aayushi creates a Supabase project, runs `supabase/schema.sql`, and pastes the URL and secret key into `.env.local` (later also into Vercel).

---

## 2026-10-27 — Screen 12: Content engine (AI agent + panic test)

**Built**
- Content engine (`/engine`), brief item 5 and Step 3 section 5. It's a **hidden page locked with a passcode** (in `.env.local` as `ENGINE_PASSCODE`; never uploaded) and kept out of search engines.
  1. Aayushi pastes **a claim and up to 5 source links**.
  2. **The AI agent opens and reads the links itself** (Gemini's link-reading tool) and runs the **panic test**: Source, Scale, India fit, Action. Each gets ✅/❌ and a one-line reason. Each source shows 📖 opened (with its kind and what it says) or ⚠️ couldn't open.
  3. **All 4 pass → "Waiting for you"**, with a drafted "why now" line for the matching Talk Card. **Any fail → Watch list** (not published).
  4. **Approve / Reject.** Approved shows the next step: add the line to `content/base-talk-cards.md`, update "Checked on", advisor checks it.
  5. **Log tabs:** Waiting for you · Approved · Rejected by you · Watch list, with counts.
- `lib/panicTest.ts`: the 4 checks, the trusted-source list, the agent's instructions, and **hard rules enforced by code, not the AI**:
  - A link the agent couldn't open is never evidence; if **no** link opened, Source fails.
  - The verdict is worked out from the 4 checks, so the AI can't "accept" with a failed check.
  - The drafted line must pass the Talk Card writing rules (no fear words etc.) and contain a number, or it's dropped.
- `app/api/engine/route.ts`: the server side. Passcode check, input limits, 55 s time limit, retry and fallback when Google's AI is overloaded.
- `tests/panic-test.test.mjs`: 10 checks of those hard rules.

**Broke**
1. **Gemini answered confidently about a page it couldn't open** (Common Sense Media blocks it), from memory. An agent that "checks sources" it never read would be dishonest.
2. Google's AI returned "overloaded" (error 503) twice on the main model.
3. Gemini can report an opened link slightly differently from how it was pasted (e.g. without "www" or the final "/").

**Fix**
1. The engine uses Gemini's own record of which links were **actually opened**. Unopened links are shown as ⚠️ and never count. The agent is told to judge only from what it read.
2. On 503: wait 3 seconds and retry, then switch to the lighter model.
3. Links are compared in a normalised form.

**Checked (real runs, real sources)**
- **Blue Whale "suicide game" rumour** → Watch list, 0/4. The agent read the source: the government found no link.
- **"9 in 10 child cybercrime cases involve explicit material"** → Watch list, 2/4. The Siasat link couldn't be opened, and ThePrint is news (a lead, not proof). It needs an official source.
- **"Only 4 in 10 young Indians think seeking mental-health help is good"** (UNICEF India) → Passed 4/4, topic Stress, drafted line: "Only 41 percent of young people in India believe it is good to seek help for mental health issues, according to a 2021 report by [UNICEF]." → Approved.
- Wrong passcode refused. Phone width fits. Build passes; `npm test` 6/6 files.

**Limits to know**
- The log is saved in the browser where Aayushi uses the engine. It won't appear on another device unless we save it to Supabase.
- Some sites block the agent from reading (e.g. Common Sense Media, Siasat). Use official pages where possible.

---

## 2026-10-27 — Screen 11: 3-day follow-up (+ `npm test`)

**Built**
- The 3-day follow-up (FR8, step 4 of the completed-conversation metric). Templates on the phone, no AI.
  - **Home** shows "💬 A quick question: about your talk on Saturday. Two taps, and we'll suggest a next line" once 3 days have passed, and hides it once answered.
  - **Follow-up screen** (`app/follow-up/[planId]`):
    1. **"What did you two talk about on Saturday?"** Three topics, one of them real. This is the "answer must match" check from Step 2. **Recorded quietly, never shown as right or wrong.**
    2. Then **"You noted: '…'. Has your teen said more about it since?"** Yes, they brought it up / A little / Not yet.
  - **After:** a tip for that answer, **"A next line to try"** in the parent's language (builds on the last talk; no gendered verbs), and **Plan another talk**.
  - Reopening an answered follow-up shows the result, not the questions.
- `lib/followUp.ts`: when it's due, the three choices (real topic plus two others, in a fixed order per plan) and the templates.
- **`npm test`** (`tests/run-all.mjs`): runs every test file and **fails loudly if any test fails or crashes**.
- `tests/follow-up.test.mjs`: 6 checks, including 300 cases proving the choices always include the real topic, never repeat, and keep their order.

**Broke**
1. The "You noted" line showed before the first question, so a note like "…crushes…" **gave away the answer**.
2. The new follow-up test crashed while loading, but my test commands hid error messages, so it **looked like it had printed nothing**, not like a crash.
3. The first version of `npm test` couldn't find the test files: the spaces in the folder name ("Raise - Capstone Project") were garbled into `%20`.

**Fix**
1. The note and the second question appear only after the topic is picked.
2. The follow-up logic now gets the topic list from the screen, so the test can load it. Added `npm test`, which reports crashes as failures. The setup safety test now also reports failure properly.
3. Used Node's proper file-path conversion. `npm test`: 5 of 5 test files pass.

**Checked**
- Reflection 3 days old → Home shows the question; today's → not shown.
- Picked the right topic + "A little" → matched recorded, tip and next line shown; Home's card gone; reopening shows "Thank you."
- Build passes; `npm test` 5/5 files (88 checks).

---

## 2026-10-27 — Screen 10: Recovery

**Built**
- `components/HandOnShoulder.tsx`: a parent's arm around the teen's shoulder, both smiling, from Aayushi's mood pictures.
- Recovery (`app/recover/[planId]`), covering D5, FR9 and FR10. No "failed" label anywhere.
  - **After "Not yet":** "That's okay. Let's find an easier way in. Most talks take more than one try. What got in the way?" There are 5 choices, each with its own tip:
    - The right moment didn't come → try a walk (Plan again opens the Planner with **walk already picked**)
    - It felt awkward → a lighter way in (start with something easy; a good chat counts too)
    - My teen wasn't in the mood → a calmer time (late evening already picked)
    - I didn't feel ready → say the first line out loud once beforehand
    - Something else → the topic will wait
  - **After 😣 or "Partly":** "Hard talks happen. It doesn't mean it went wrong. It means you started, and your teen saw you try." It shows **"Your repair line"** in the parent's language ("Us din ki baat ke liye sorry. Kya hum phir se baat kar sakte hain? Is baar pehle tumhari baat sunenge."), worded so it fits mothers, fathers and guardians, plus "A softer restart" (4 short steps).
  - Both end with **Plan again** or **Not now, keep it open** (back to Home's open topics).
- `lib/recovery.ts`: the reasons, tips and repair lines. Templates only, no AI.
- The "what got in the way" choice is saved on the phone with the reflection (a fixed choice, no free text).
- The Planner can now open with a suggested moment already picked.

**Broke**
- Nothing broke in testing.

**Checked**
- Not yet → "The right moment didn't come" → tip → Plan again → Planner with walk picked; reason saved.
- Repair path in Hinglish → Not now, keep it open → Home shows it under Open topics.
- 375 × 812 and 320 × 640. Build and all 4 test sets pass.

**For the metric**
- A replanned talk is a new plan for the same topic. Whether it lands within 14 days of first choosing the topic is worked out when we build the metric counting.

---

## 2026-10-27 — Screen 9: Reflection

**Built**
- Reflection (`app/reflect/[planId]`): brief item 3, plus D4, FR7, FR10 and FR12. "How did it go? 30 seconds. It stays on your phone. Please don't write names or private details."
  1. Did the talk happen? Yes / Partly / Not yet
  2. What did you talk about? (short note)
  3. Who talked more? Me / My teen / About equal
  4. One thing you learned about your teen (short note)
  5. How did your teen respond? 😊 Went well / 😐 Okay / 😣 Hard
- Save needs both notes (3+ letters), so "Done" with nothing learned doesn't count, as the metric requires.
- `lib/reflections.ts`: reflections saved **only on the phone**, with a 3-day follow-up date (FR8). Never sent to the AI or Supabase.
- Where each answer leads:
  - **Yes, and it went well or okay** → "You did it. Thank you for trying." If the parent talked more: "Next time, try asking one more question, then waiting." If the teen talked more: "That's a great sign." Then the follow-up day and a gentle next topic.
  - **Partly, or 😣** → repair path (FR10). No "failed" label anywhere.
  - **Not yet** → "That's okay. Most talks take more than one try." → recovery path (FR9).
  - **A danger sign in the notes** → "This sounds serious. Would you like help from a professional?" **Yes** opens Help; **No** continues. **What they wrote about it is not saved** (only that help was offered), and no follow-up is scheduled.
- `lib/safety.ts`: new warning signs from the stress card ("wants to die", "life feels pointless", "not eating properly for weeks", Hinglish and Hindi too).
- `tests/reflection-danger.test.mjs`: 12 danger notes (must **all** show the offer: the launch rule) and 8 ordinary notes (must not).
- Placeholder for the recovery screen (`/recover/[planId]`).

**Broke**
1. "He has not been eating properly for weeks" was missed as a danger sign.
2. My first draft would have flagged everyday phrases like "she's hopeless at maths" or "not eating junk food".
3. After a serious disclosure, the screen still said "You did it. Thank you for trying.", which is the wrong tone.
4. The 😊 😐 😣 buttons had no name for screen readers.

**Fix**
1. and 2. Tighter patterns ("feels hopeless", "not (been) eating properly / for weeks"). Now 20/20.
3. After a danger sign: "Thank you for listening to your teen… Help is always one tap away", with See who can help. No next topic.
4. Added labels ("Went well", "Okay", "Hard").

**Checked**
- Yes + 😊 → saved on the phone, follow-up in 3 days, plan marked reflected.
- Danger sign → offer → No → calm screen; the note is nowhere in storage.
- Not yet → recovery. Partly + 😣 → repair.
- Build passes. All tests: setup 24/24, card safety 23/23, reflection danger 20/20, metric 15/15.

---

## 2026-10-27 — Screen 8: Talk mode

**Built**
- Talk mode (`app/talk/[planId]`), covering D4 and FR6:
  - **Before:** "Your first line" in big type, two reminders from the teen survey ("Listen more than you talk", "Stay calm, whatever they say"), the safety promise, and a big **Start**.
  - **While talking:** a calm dark-teal screen, "You've started. Put the phone away.", with the first line under "If you need it", quiet minutes ("6 min"), a big **Done**, and "Something serious came up? Get help".
  - **Start is saved on the phone straight away**, so a locked phone or closed page doesn't lose the talk. Reopening Talk mode resumes it.
  - **Done within the first minute** asks "Finish already?", with **Keep going** as the main button, to catch accidental taps.
  - Done → Reflection.
- `lib/talks.ts`: Start/Done times on the plan, and the metric rule `startedOnTime`: Start inside the planned window (1 h before to 3 h after) **and** Done 5+ minutes later. **Recorded quietly, never shown to the parent as pass or fail.**
- Home: after Done, the plan shows "How did your walk go?" instead of "It's time".
- `tests/metric.test.mjs`: 15 cases for the "started on time" rule and the plan stages.

**Broke**
- Nothing broke in testing.

**Checked**
- Home → Open Talk mode → Start → reload → still talking (Start was saved).
- Done straight away → "Finish already?". A 6-minute talk → Done → Reflection, with 6 minutes recorded. Home then shows the check-in.
- Metric test 15/15 (e.g. 4 minutes doesn't count, 5 does; starting 4 hours late doesn't count). Build and safety tests pass.

---

## 2026-10-27 — Screen 7: Home

**Built**
- Home screen (`app/home/page.tsx`): brief item 4, "a reason to come back", plus the in-app reminder from D3. No streaks, no scores.
  - **Greeting:** "Good afternoon, Mumma", with Help always at the top.
  - **In-app reminder:** inside a plan's window (1 hour before to 3 hours after), a teal banner says "It's time for your walk", shows the first line, and has **Open Talk mode**. It re-checks every minute, so it appears without reloading.
  - **Gentle check-in:** after the window, "How did your walk go? Whether you talked or not, it helps to note it." → Tell us how it went. Never "missed" or "failed".
  - **Your next talk:** upcoming plans with day, time, moment and first line. Tap to reopen the card.
  - **Open topics:** "Not now" topics, each with "Plan it →".
  - **Empty state:** "Ready when you are", with the family illustration and Choose a topic.
- `lib/talks.ts`: the plan window and stages (upcoming → now → check-in → done). The same window will decide "started on time" for the metric.
- Welcome screen: returning parents see **Continue** (→ Home) instead of Get started, so they don't redo setup.
- Placeholders for Talk mode (`/talk/[planId]`) and Reflection (`/reflect/[planId]`).

**Broke**
- Returning parents opening the app landed on Welcome, and "Get started" would have sent them through setup again.

**Fix**
- Welcome now checks the phone for saved setup answers and shows Continue → Home.

**Checked**
- Plans 20 minutes away, tomorrow and yesterday, plus an open topic: all four sections show correctly.
- Empty state. No setup saved → sent to Welcome.
- New visitor sees Get started → Setup; returning visitor sees Continue → Home.
- 375 × 812 and 320 × 640. Build and both safety tests pass.

**Still to do**
- Talk mode and Reflection (next), then the 3-day follow-up on Home.

---

## 2026-10-27 — Screen 6: Planner

**Built**
- Planner screen (`app/plan/[topic]`), covering D3 and FR4:
  1. **Pick a moment:** walk, late evening, cooking or chores, meal, car. Walk and late evening come first and are tagged "Teens' pick".
  2. **Which day:** today to 6 days ahead. A sensible time is filled in per moment (walk 6:30 pm, late evening 9:30 pm…) and can be changed. If today's time has already passed, it suggests tomorrow.
  3. **The plan as a sentence:** "On our walk tomorrow at 6:30 pm, I'll start with: '…'", using the same first line the parent just read (the personalised one if there is one).
  4. **Save my plan:** two taps are enough (moment → save).
- A plan must be at least 15 minutes away; otherwise the screen says so and Save stays off.
- Plans are saved on the phone with a timestamp (`lib/talks.ts`), for the metric's "Planned" step. The topic leaves "open topics".
- **"Your plan is set"** screen, with **Add to Google Calendar** (opens the Calendar app on most Android phones) and **Other calendar app** (a calendar file with a reminder 15 minutes before).
- **Calendar events never name the topic.** The title is just the moment ("Your walk", "Quiet evening") and the link goes to Raise's Home, not the topic. This replaces the docs' push notification (decision: calendar + in-app).

**Broke**
- Nothing broke in testing.

**Checked**
- Mother, Hinglish: card → Plan this talk → walk → tomorrow → plan sentence with the personalised first line → saved. Stored as 6:30 pm India time.
- Google Calendar link and calendar file: title "Your walk", reminder 15 min before, no mention of the topic (checked automatically).
- A time 5 minutes from now → "too soon" message, Save off.
- 375 × 812 and 320 × 640, no sideways scrolling. Build and both safety tests pass.

**Still to do**
- The in-app reminder belongs on Home (next screen): "Your walk is coming up" plus the way into Talk mode.
- The calendar link points to `localhost` until the app is deployed; after deployment it will point to the public link.
- On a real Android phone: check that "Add to Google Calendar" opens the Calendar app.

---

## 2026-10-27 — AI-personalised Talk Card (Gemini)

**Built**
- Aayushi created a free Gemini API key and saved it in `.env.local` (never uploaded; checked).
- **Model:** `gemini-3.5-flash-lite` with thinking set to minimal. Can be changed with a `GEMINI_MODEL` setting, no code change.
- `lib/cardPrompt.ts`: the instructions for Gemini. It **rewords** the hand-written base card for one family and never writes a new one. It adapts to role (fathers get lighter openers and admit their own awkwardness), teen's age band and gender (Hindi/Hinglish grammar too), language and comfort level. **Only tapped answers are sent**, never the nickname or anything typed, matching the Privacy promise.
- `app/api/card/route.ts`: the server part. The key stays on the server. It only accepts known setup values, gives up after 8 seconds, and retries once if a card is rejected and there's time.
- `lib/cardSafety.ts`: **checks every AI card before a parent sees it.** It blocks: spying, phone threats or punishment (allowed only as warnings in "Avoid"), diagnosis, medicine, fear words, promised results, sexuality judgement, sexual detail, new statistics, missing parts, and the wrong script for the language.
- Talk Card screen: "Writing your card…" while waiting, then the card marked **"written for you"**. On any problem it shows the base card marked **"standard card"**. Personalised cards are saved on the phone, so reopening one makes no new AI call.
- `tests/card-safety.test.mjs`: 23 cases (all 6 base cards must pass; 15 kinds of bad output must be blocked).

**Broke**
1. Two models timed out (30 s+) and an older one is retired. Even the working ones took 4–6 s for one sentence.
2. Hinglish cards left the follow-ups and some lines in English.
3. A father's card assumed "College", but a 16–17 year old is usually in school.
4. The guard blocked a good stress card for the number "12" (most likely "raat 12 baje", i.e. midnight). It also blocked it for mixing in Devanagari, which was a fair block.
5. The Hindi relationships card was blocked twice for "spying": the AI wrote "I'm not spying on you" as a reassurance.
6. In development, a new card asked the AI twice (React runs the step twice in development to catch bugs), which would use up the free limit faster.
7. A corrupted language setting would have shown an empty first line.

**Fix**
1. Picked the flash-lite model with minimal thinking: 1.5–3.5 s for a full card (target: under 5 s).
2. and 3. New prompt rules: write every field in the chosen language, and don't assume school or college.
4. Numbers: "why now" may only use the base card's numbers. Other lines may not contain statistics ("45%", "9 of 10"), but everyday numbers are fine.
5. New prompt rule: never mention spying or checking, not even to deny it. Kept the guard strict. Then 3 of 3 Hindi relationships cards passed.
6. Duplicate requests for the same card are now merged: exactly 1 AI call per new card.
7. Falls back to the Hinglish first line.

**Checked**
- 18 live cards across all 6 topics, 3 languages, mother/father/guardian: all personalised except 1 rejected card, which fell back to the base card as designed.
- Saved card → 0 AI calls. New card → 1 AI call.
- Broken setup answer → base card with the "standard card" tag.
- Key not in any phone-side file, and not in Git. Build passes; safety tests 24/24 and 23/23.

**Still to do**
- The AI's Hinglish and Hindi need a read-through by Aayushi (e.g. one English card said "guys our age" from a father).
- The "If they react" and other lines are personalised, but the safety promise and help text stay fixed from the base card, as designed.

---

## 2026-10-27 — Screen 5: Talk Card (base cards, before AI)

**Built**
- `scripts/build-cards.mjs`: reads `content/base-talk-cards.md` (still the only file Aayushi edits) and turns it into app data (`lib/base-cards.json`). It runs automatically before `npm run dev` and `npm run build`, or on its own with `npm run cards`. **If a card is missing a part** (e.g. only 2 "Say" lines, or no Hindi first line), it stops and lists exactly what's missing, so a broken card can't ship.
- `lib/cards.ts`: the card shape. The AI version will fill the same shape later; the safety promise, help and sources always come from the base card.
- Talk Card screen (`app/card/[topic]`), covering D2, FR2 (base version) and FR3, in the Step 3 order:
  topic + teen's question → why now (with source) → **first line** in a big peach box, in the parent's language from setup, with "Try saying it out loud once" → 2 follow-ups → Say / Avoid → If they react (4 reactions) → **"Always say this"** safety promise (teal box) → When to get help + Open Help → "Checked on 25 Oct 2026 · Sources".
- Only two actions, pinned to the bottom: **Plan this talk** and **Not now**. No save button.
- "Not now" keeps the topic in "My open topics" on the phone (`lib/talks.ts`) and goes to Home.
- Placeholders for the Planner and Home.

**Broke**
- An "Avoid" line written as `"quote" (note)` came out with a stray quote mark.
- The Hinglish first line showed in the plain font instead of the serif, because I'd tagged it as Hindi.

**Fix**
- The converter now removes quote marks properly from `"quote" (note)` lines.
- Only Hindi (Devanagari script) switches to the body font, since the serif font has no Devanagari letters. Hinglish uses the serif.

**Checked**
- Mother, 16–18, Hinglish → Relationships card in full. Switched to Hindi → Devanagari first line.
- All 6 topic cards open; an unknown topic shows "not found".
- "Not now" → Home, with the topic saved as open.
- 375 × 812 and 320 × 640 with no sideways scrolling. Production build passes.

**Still to do**
- Base cards are still Claude's draft; Aayushi hasn't edited them yet.
- In Hindi or English mode, only the first line changes language; the rest is English until the AI version translates it.
- Next: Gemini key → AI-personalised card, with the base card as the backup.

---

## 2026-10-25 — Screen 4: Pick a topic (+ basic Help screen)

**Built**
- `components/TopicBubbles.tsx`: a parent and teen sitting on floor cushions, with thought bubbles holding a heart, a cloud and two friends.
- Pick a topic screen (`app/topics/page.tsx`), covering D1:
  - **Suggested for you:** 3 topics. Relationships, Stress and Friends come first (what teens most want), but a topic matched from the setup text box moves to the top with a "Matches what you wrote" tag.
  - **More topics:** the other 3.
  - Every topic shows the teen's question ("How do you know if someone is good for you?"), so it starts from the teen's side.
  - **"Is something serious happening?"** section: self-harm, abuse, photo blackmail, addiction. These open Help, never a Talk Card.
  - A **Help** button at the top.
- Basic Help screen (`app/help/page.tsx`), covering FR12: all helplines as tap-to-call. When opened from a crisis topic, it adds "Say this now", "What to do" and "What not to do" for that situation (e.g. blackmail: don't pay, don't delete messages, don't contact the person, don't blame your teen). Nothing is saved.
- Setup's crisis card now also has "See what to do now", which opens Help.
- Placeholder Talk Card page at `/card/[topic]`.

**Broke**
- Nothing in the app. One screenshot was taken before the Help page had loaded.

**Checked**
- No setup answers → Relationships, Stress, Friends suggested. Setup matched "periods" → Body moves to the top with the tag.
- Photo blackmail → Help with the blackmail guide and Cybercrime 1930 first.
- 375 × 812 and 320 × 640. Production build passes. Safety test still 24 of 24.

**Still to do**
- **Help wording is a draft.** Step 3 says the expert advisor must write and approve help screens before launch.
- The Help button needs to appear on every screen (so far only Pick a topic, plus Setup's crisis card).

---

## 2026-10-25 — Screen 3: Privacy promise

**Built**
- `components/PhoneLock.tsx`: a phone with a heart-shaped lock among leaves.
- Privacy screen (`app/privacy/page.tsx`), covering D1 ("see a privacy promise before choosing a topic"). "Your talks stay yours", with 6 promises, each true to how Raise is built:
  1. Your notes stay on this phone (never sent, not even to the AI)
  2. Your teen never sees Raise (reminders never name the topic)
  3. A talk tool, never a spy tool
  4. No talks are recorded
  5. The AI only sees your taps (role, age band, language), never your nickname or anything you type
  6. We count taps, not people (anonymous events only)
- "Got it, choose a topic" button, pinned to the bottom of the screen. Placeholder Pick a topic page.

**Broke**
- With 6 promises, the button fell below the screen on a phone.

**Fix**
- Pinned the button to the bottom so it's always visible while the promises scroll underneath.

**Checked**
- 375 × 812 and 320 × 640. Button goes to `/topics`. Production build passes.

**Rule for later**
- Promise 5 means the Talk Card AI call must send only the tapped answers. The nickname and the setup text box stay on the phone.

---

## 2026-10-25 — Screen 2: Setup

**Built**
- `components/FamilySofa.tsx`: Raise's own illustration of an Indian family on a sofa in lamp light, both parents turned towards the teen.
- Setup screen (`app/setup/page.tsx`), covering D1 and FR1: 7 short questions, one per screen, mostly tap-to-answer, with a progress bar and back button. Every question says why it's asked.
  1. Nickname (optional) · 2. Mother / father / guardian · 3. Age band 13–15 / 16–18 · 4. Girl / boy / prefer not to say · 5. Hinglish / Hindi / English · 6. Gentle / open · 7. "Is there something you'd like to talk about?" (optional free text)
- Answers are saved **only on the phone** (`lib/profile.ts`). No phone number, email or password.
- Safety check for the free-text box (`lib/safety.ts`), running on the phone:
  - **Danger signs** (suicide, self-harm, abuse, photo blackmail, drugs, in English, Hinglish and Hindi) → "This sounds serious. Would you like help from a professional?" with tap-to-call numbers 112, 14416, 1098, 1930. The parent can say "Not now". **The crisis text is not saved.**
  - **Refusals** (spying, medicines/diagnosis, finding out or changing sexuality) → a short "Raise doesn't…" line plus a better topic to start with.
  - Otherwise, the words suggest a starting topic (e.g. "crush" → Relationships).
- `tests/safety-setup.test.mjs`: 24 example messages. Run with `node tests/safety-setup.test.mjs`.
- Placeholder Privacy page so setup has somewhere to finish.

**Broke**
- The safety test caught 2 misses out of 24: "cutting herself" wasn't seen as a danger sign, and "uski chats kaise padhu" (Hinglish word order) wasn't seen as spying.
- The production build caught a type mistake in the setup screen.
- The browser pane jumped back to the Welcome page once during testing (a page reload while files were saving); no app bug.

**Fix**
- Widened the self-harm pattern to catch every form of "cut/hurt/harm … herself", and added a Hinglish verb-last pattern for spying. Now 24 of 24 pass.
- Tightened the type so the result box only ever gets a refusal or a crisis.

**Checked**
- Went through all 7 questions as a father of a 16–18 daughter in Hinglish: every answer saved correctly.
- Spying request → refusal + Online safety offer. Blackmail → help card; nothing about it saved.
- Fits 375 × 812 and 320 × 640. Production build passes.

**Still to do**
- The crisis card for photo blackmail should also say what to do now (don't pay, don't delete messages, don't blame your teen). That belongs on the full Help screen, coming later.
- The 30-message safety test set needs 6 more messages, plus reflection-box cases when we build Reflection.

---

## 2026-10-25 — Illustration plan

**Decided**
- Aayushi shared 3 mood pictures (two photos of families talking on a sofa, one flat illustration with thought bubbles). They set the feeling: calm, side by side, warm evening light, a parent who listens.
- We draw **Raise's own flat illustrations** of these scenes rather than using the pictures, because their owners are unknown and the app will be public.
- **Flat illustrations throughout, no photos.** Lighter on mobile data, and every family can look Indian.
- Scene plan per screen recorded in `CLAUDE.md` (Visual design).

---

## 2026-10-25 — Screen 1: Welcome

**Built**
- The Raise look, from Aayushi's reference design: peach and cream colours, teal buttons, DM Serif Display headlines and Nunito body text.
- `components/WalkTogether.tsx`: Raise's own flat illustration of a parent and teen walking side by side among leaves and flowers. It replaces the reference's mother-and-baby artwork, which isn't ours and doesn't show teens.
- Welcome screen: "Every hard talk starts with one line", a short subtitle, a "Get started" button and "No sign-up. Stays private on your phone."
- A placeholder Setup page so the button has somewhere to go.

**Broke**
- The last word of the headline ("line") sat alone on its own line.
- On a small phone (320 × 640), the illustration was pushed below the screen.

**Fix**
- Balanced the headline so its words spread evenly across the lines.
- Trimmed the empty sky from the top of the illustration, and let the headline and top spacing shrink on narrow screens.

**Checked**
- Looks right at 375 × 812 and 320 × 640. "Get started" opens `/setup`. Production build passes.

**Next**
- Aayushi reviews the Welcome screen. Then the Setup screen design.

---

## 2026-10-25 — Base Talk Cards drafted

**Built**
- `content/base-talk-cards.md`: first drafts of all 6 base Talk Cards (relationships, stress, friends, online safety, consent, body). Each card has the teen's question, why now (with number, source and date), a first line in Hinglish, Hindi and English, 2 follow-ups, 3 say / 3 avoid, 4 "if they react" lines, when to get help, and sources.
- The safety promise, help numbers and moment order are fixed for every card.

**Checked**
- Against the "never say" rules: no diagnosis, no medical advice (card 6 points to a doctor), no fear words, no spying or phone threats (they're in the "avoid" lists), no promised results.
- Every number traced back to the Step 1 docs. Fixed one source: card 6's "boys get less guidance" comes from Likith 2024, not Rashmi 2026.

**Broke**
- Nothing.

**Next**
- Aayushi edits the cards and answers the 4 questions at the end of the file. Expert advisor review is still an open point (PRD 2.12).

---

## 2026-10-25 — Step 0: blank app (deploy moved to the end)

**Built**
- A blank Next.js 16 app (React 19, TypeScript) with one placeholder page: "Raise · Coming soon · Step 0 test page".
- Tested a production build (`npm run build`): passes.
- Viewed it at phone size (375 × 812) on this computer: looks right.
- Git repository created with the first commit. `.gitignore` keeps installed packages and secret files (`.env*.local`) out of GitHub.

**Broke**
- Git wasn't installed on the computer.

**Fix**
- Installed Git 2.56 with Windows' own installer (`winget install Git.Git`).

**Decided**
- GitHub repository will be **private** (the docs include personal details). The app link stays public.

**Changed plan**
- GitHub push skipped for now (repo link never came through), and deployment moved to the end: build the app first, then deploy. Vercel CLI 65.2 is downloaded and ready for that step.

**Next**
- Build the screens one at a time from Aayushi's designs. Deploy (GitHub + Vercel) and test on her phone on mobile data once the app is ready.

---

## 2026-10-25 — Planning

**Built**
- `CLAUDE.md`: project context, post-docs decisions, product and safety rules.
- `BUILD_LOG.md`: this file.
- Unzipped `docs/raise-docs.zip` into `docs/` so every Step 1–4 file can be read directly.

**Broke**
- Nothing yet. No app code written; waiting for plan approval.

**Fix**
- —

**Decided** (all 8 planning questions answered)
- Claude drafts base cards, Aayushi edits. All 6 topics get full cards.
- Reflections never leave the phone; follow-ups come from templates.
- Safety checks on the setup box and the reflection.
- Hinglish, Hindi and English from day one.
- Content engine: hidden page, Aayushi pastes claims.
- Accounts: GitHub only so far. Vercel, Supabase and Gemini still to set up.
- Wait for Aayushi's design before each screen.

**Next**
- Step 0: blank app live on a public link, opened on Aayushi's phone on mobile data.
