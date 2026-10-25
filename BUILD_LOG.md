# Raise — Build Log

What we built, what broke, and how we fixed it. Newest entries at the top.

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
