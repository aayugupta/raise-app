# Raise — Build Log

What we built, what broke, and how we fixed it. Newest entries at the top.

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
