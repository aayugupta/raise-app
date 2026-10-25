# Step 4: User flows, PRDs and Wireframes

Oct 25, 2026 · @Iuc

## 1. Journey maps

**Full maps on Miro:** [Raise - Journey Maps](https://miro.com/app/board/uXjVEVldtNk=/)

Each map follows Meera (persona) stage by stage: actions, touchpoints, feelings curve, pain points and design fixes.

| Journey | Goal | Key moment | Success metric |
| --- | --- | --- | --- |
| **1. First-time onboarding** | A useful first line within 2 minutes, with no login before then | The aha moment: reading her first Talk Card | First Talk Card seen within 2 minutes. A plan is set, or the topic saved, in the first session |
| **2. Preparing for one conversation** | About 3 minutes of prep, then the talk at the planned moment | Talk mode: Start, phone away, Done | **40% of topics started reach a completed conversation within 14 days** |
| **3. After a conversation goes badly** | Don't give up. Replan within 14 days | A repair line, then a softer restart | A new talk is replanned within 14 days, and still counts toward the 40% |

**Where the metric is captured (Journey 2):** Planned (planner) → Started (talk mode) → Reflected (30-second reflection) → Followed up (3-day question).

**A missed moment ("Not yet")** follows the Journey 3 path, starting with "What got in the way?"

### Design decisions shared across all three journeys

- **No login before value.** Only a nickname at setup. An account is optional, and comes after the first Talk Card.
- **Discreet notifications.** They never show the topic.
- **Action, not saving.** No save button, only "Plan this talk". "Not now" is fine, and keeps the topic open.
- **No failure labels or streaks.** A bad or missed talk leads to recovery, not a score.
- **The parent decides on professional help.** It appears as a small card she can dismiss, never forced.

## 2. PRD: Raise v1

### 2.1 Problem Statement

Parents of 14 to 18 year olds in urban India want to talk calmly with their teen about relationships, feelings and online risks. But they don't know how to start, and they fear their teen will shut down. In our survey, 56% of parents were putting off a talk, and 60% of them couldn't find a way to begin. Meanwhile, teens learn from friends (83%) and Instagram (58%) instead of parents (8%), and they hide problems like cyberbullying. Parenting content doesn't fix this: 79% of parents saved it or forgot it, and only 21% went on to talk.

### 2.2 Pain Points

| # | Pain point | Who | Evidence |
| --- | --- | --- | --- |
| 1 | Don't know how to start | Delaying parents | 60% can't begin or find the words. 70% want "what to say first" |
| 2 | Fear the teen's reaction | Parents and teens | 20% of parents fear the reaction. 92% of teens stop at anger or a lecture |
| 3 | Content gets saved, not used | Parents | 79% saved or forgot it. 21% talked |
| 4 | Wrong moments | Parents vs teens | Parents: meals 61%, car 44%. Teens: walks 75%, late night 58% |
| 5 | Talks feel like lectures | Teens | 83% want relationship talk. 0% want more safety lectures |
| 6 | Teens hide problems | Teens | 45% hid cyberbullying from parents |

### 2.3 User Stories

| Persona | High-level story | Sub-stories |
| --- | --- | --- |
| **Meera (parent)** | Start a hard talk | As a parent, I want a ready first line in my language, so that I can begin without awkwardness. As a parent, I want to plan a moment and get a reminder, so that the talk happens. |
|  | Handle the reaction | As a parent, I want to know what to say if my teen goes quiet or gets upset, so that I stay calm. |
|  | Recover | As a parent, I want an easier next step when I miss the moment, so that I don't give up. As a parent, I want a repair line after a bad talk, so that I can try again. |
|  | Stay private | As a parent, I want notifications that never show the topic, so that my teen's trust isn't broken. |
|  | Get help | As a parent, I want quick access to helplines, so that serious problems reach experts. |
| **Riya (teen, beneficiary)** | Be heard | As a teen, I want my parent to start with my side and listen first, so that I keep talking. *Riya never uses the app.* |

### 2.4 Mental Model

- **They wait for the "right moment",** which rarely comes. 56% have put off a talk for weeks or months.
- **They save content but don't use it.** 79% saved or forgot what they found.
- **They try at meals and in the car,** while teens prefer walks and late at night.
- **They want words, not facts.** 70% asked for "what to say first", and 0% for more facts.
- **What they compare it to:** advice from relatives, and school lectures. This varies by parent.
- **Their words:** "Kaise shuru karun?" (How do I start?) · "Sahi time nahi milta" (I never find the right time) · "Awkward lagta hai" (It feels awkward) · "Bachcha naraz ho jayega" (My child will get upset).
- **A "good" talk means:** the teen opens up, listens to advice and comes back later. This is subjective and differs between parents, so the reflection asks how it felt and what they learned, instead of scoring the talk.
- **The teen's view:** talks feel like lectures. 92% stop talking at anger or a lecture.

### 2.5 Design Requirements

**D1. Onboarding** *As a parent, I want to get a useful first line quickly, so that I see value before committing.* A user has succeeded when they can:

- Finish setup in under 1 minute with only a nickname, and no phone number or email.
- See why each setup question is asked.
- See a privacy promise before choosing a topic.
- Choose from 3 suggested topics, with relationships first.
- Create an account later, only if they want to save progress.

**D2. Talk Card** *As a parent, I want one card that tells me what to say, so that I feel ready.* A user has succeeded when they can:

- See the first line, two follow-up questions, what to say and avoid, and "if they react" tips on one screen.
- Read it in Hinglish, Hindi or English.
- Tap "Plan this talk" or "Not now". There is no save button.

**D3. Plan and remind** *As a parent, I want to set a moment and be reminded, so that the talk happens.* A user has succeeded when they can:

- Pick a moment in 2 taps, with walks and evenings suggested first.
- See the plan as a sentence: "On our Sunday walk, I'll ask..."
- Allow a reminder at the moment of planning.
- Get a reminder that never shows the topic.

**D4. Talk and reflect** *As a parent, I want to mark the talk and note how it went, so that I learn what works.* A user has succeeded when they can:

- Glance at the first line, tap Start, put the phone away, then tap Done.
- Reflect in 30 seconds: did it happen, what we discussed, who talked more, one thing learned, and how it felt.
- Answer one follow-up question 3 days later.

**D5. Recovery** *As a parent, I want help when a talk doesn't happen or goes badly, so that I keep going.* A user has succeeded when they can:

- After "Not yet", say what got in the way and get an easier option.
- After a bad talk, get a repair line and a softer restart.
- Replan without seeing any "failed" label.

**D6. Help and boundary** *As a parent, I want safe help when something is serious, so that I'm never alone with it.* A user has succeeded when they can:

- Reach emergency numbers in the Help tab at any time.
- Open help when they choose a crisis topic.
- See a dismissible "Would you like professional help?" card when they mention danger signs.
- Get a better alternative when they ask for something Raise won't do, such as spying.

### 2.6 Functional Requirements

| # | User story | Requirement | Acceptance criteria |
| --- | --- | --- | --- |
| FR1 | As a new parent, I want to start without an account | Full use with only a nickname. An account is optional after the first Talk Card | GIVEN a new user, WHEN setup is finished, THEN no phone number, email or password is asked, AND THEN the first Talk Card opens |
| FR2 | As a parent, I want the card to fit my family | Generate the card from a hand-written base card, using role, the teen's age and gender, language and comfort level | GIVEN a mother of a 16-year-old daughter choosing Hinglish, WHEN she opens "Relationships", THEN the first line is in Hinglish and fits her role and her daughter's age, AND THEN the safety promise is always shown. *The AI fills a fixed card only. No open chat in v1* |
| FR3 | As a parent, I want to act, not save | The card offers only "Plan this talk" and "Not now" | GIVEN a Talk Card, WHEN it is shown, THEN there is no save button, AND WHEN "Not now" is tapped, THEN the topic stays in My open topics |
| FR4 | As a parent, I want to set a time and a moment | Save the moment, date and time, and ask for notification permission then | GIVEN "Plan this talk" is tapped, WHEN "Walk, Sunday 6 pm" is chosen, THEN the plan is saved with a timestamp, AND THEN "Allow a reminder before your walk?" is shown once |
| FR5 | As a parent, I want a private reminder | Send a notification 15 minutes before, without the topic | GIVEN a plan for 6 pm, WHEN it is 5:45 pm, THEN the notification says "Your walk is in 15 minutes", AND THEN the topic never appears |
| FR6 | As a parent, I want to mark the talk | Record Start and Done. It counts only if 5 minutes or more | GIVEN talk mode is open, WHEN Start then Done are tapped 6 minutes apart, THEN the talk is marked "started", AND WHEN Done comes within 5 minutes, THEN it is not |
| FR7 | As a parent, I want to note how it went quickly | Show the reflection right after Done. Prompt once that evening if it isn't done. It must be done within 24 hours | GIVEN Done is tapped, WHEN the reflection opens, THEN it asks: did it happen, what we discussed, who talked more, one thing learned and how it felt, AND THEN it says "Don't write names or private details" |
| FR8 | As a parent, I want to build on what I learned | One question 3 days later, built from the reflection | GIVEN a saved reflection, WHEN 3 days pass, THEN one follow-up question refers to that reflection |
| FR9 | As a parent, I want help when the talk didn't happen | "Not yet" asks what got in the way and offers an easier option. The topic stays open | GIVEN "Not yet", WHEN "Felt awkward" is picked, THEN a lighter opener is offered, AND THEN replanning within 14 days still counts |
| FR10 | As a parent, I want to fix a bad talk | A 😣 or "Partly" reflection shows a repair line and a softer restart | GIVEN a 😣 reflection, WHEN it is saved, THEN a normalising message and a repair line appear, AND THEN no "failed" label is shown |
| FR11 | As the product team, we want to count only real talks | Completed = planned, started on time, reflected and followed up, all within 14 days | GIVEN a topic started on day 1, WHEN all 4 conditions are met by day 14, THEN it counts as completed, AND WHEN any one is missing, THEN it does not |
| FR12 | As a parent, I want help without being forced | Emergency numbers always in the Help tab. A crisis topic opens help. Danger signs show a dismissible offer | GIVEN a reflection mentions self-harm, WHEN it is saved, THEN "Would you like help from a professional?" appears, AND WHEN "No" is tapped, THEN the normal flow continues |
| FR13 | As a parent, I want a useful answer even when Raise says no | Refuse spying, diagnosis and medical questions, and offer an alternative | GIVEN "How do I read her WhatsApp?", WHEN Raise responds, THEN it says it doesn't help with monitoring, AND THEN it offers a Talk Card on trust |

### 2.7 Solution User Flow

1. **Welcome** → Start → **Setup** (6 questions) → **Privacy** → **Pick a topic**
2. **Talk Card** → *Decision:* "Plan this talk" → **Planner**, or "Not now" → **Home** (topic kept in My open topics)
3. **Planner** → allow reminder → **Home**
4. **Reminder** at the planned time → **Talk mode** → Start → Done
5. **Reflection** → *Decision:*
   - Yes, it felt okay → **Saved** → 3-day follow-up → next topic suggested
   - "Partly" or 😣 → **Repair** → softer restart → back to **Planner** *(loop)*
   - "Not yet" → **What got in the way?** → easier option → back to **Planner** *(loop)*
6. **Danger sign** at any point → gentle offer → *Decision:* Yes → **Help**, or No → continue
7. **Help tab** is available from every screen

### 2.8 v1 Scope

- **11 features:** quick setup, discreet notifications, teen-side topics, Talk Card, AI-personalised card, planner, reminder, talk mode, reflection with 3-day check, recovery path, get help now.
- **6 topics:** relationships and crushes, stress and feelings, friends and peer pressure, online safety, consent and personal safety, body and growing up.
- **Platform:** Android first.

### 2.9 Out of Scope

- **v2:** PIN lock, talk ladder, What I'm learning, AI Coach chat, remaining topics.
- **Cut:** Share to Raise, counsellor and doctor network, streaks and badges, content library and forum.
- **Not in this product:** a teen app or any teen involvement, WhatsApp, tracking or monitoring.

### 2.10 Non-Functional Requirements

| Area | Requirement |
| --- | --- |
| **Performance** | The Talk Card loads in under 5 seconds. Reminders arrive within 1 minute of the planned time |
| **Privacy** | No recording. No teen details stored. Crisis details never stored. Data encrypted. Follows India's DPDP Act, 2023 |
| **Safety** | Before launch, the 30-message test must show the gentle offer for 100% of danger signs. Re-test whenever the AI or cards change |
| **Language** | Hinglish, Hindi and English |
| **Platform** | Android first |

### 2.11 Success Metrics

| Metric | Target |
| --- | --- |
| **Completed conversation rate:** % of topics started that complete within 14 days | **40%** |
| Reach: % of parents with at least 1 completed talk | Set after the pilot |
| Onboarding: first Talk Card seen within 2 minutes | Set after the pilot |
| Guardrails: calm rate, teen reaction, 30-day return rate | Set after the pilot |

### 2.12 Open Points

1. **Expert advisor:** the child psychologist who checks the 6 base Talk Cards is still to be confirmed. The founder writes the cards.
2. **Pilot size:** not decided yet.
3. **Pilot length:** 3 days for now. That gives early signs (plans, starts, reflections) but can't test the 14-day 40% target. A 14-day run is needed for that.

## 3. Wireframes

*To be added once the app is built: the 3 screens most responsible for whether a parent actually starts.*

## 4. Design Rationale: notes on key design decisions

Two things stop parents from starting: **embarrassment** ("awkward lagta hai") and **the talk feeling too big** ("kaise shuru karun?").

### A. Reducing embarrassment

| Decision | Why |
| --- | --- |
| **Private by default:** nickname only, topic never shown in notifications | No one sees what the parent is preparing |
| **Their own words:** Hinglish or Hindi, gentle or open tone | Sounds natural, not scripted (78% speak Hinglish at home) |
| **Start from the teen's side** | Feels like curiosity, not a lecture (92% of teens stop at lectures) |
| **Side-by-side moments:** walks, late evenings | Less eye contact, less pressure (75% of teens open up on walks) |
| **No shame after a bad talk:** no "failed" label, no streaks | Honesty feels safe, so parents don't quit |

### B. Making starting feel smaller

| Decision | Why |
| --- | --- |
| **One sentence, not a whole talk** | 70% want just "what to say first" |
| **About 3 minutes of prep, on one screen** | No reading homework (79% saved content but never used it) |
| **Plan in 2 taps, with a reminder that holds the first line** | A specific plan, and the words are ready at the moment |
| **Ready for the reaction** (quiet, upset, disagrees) | Removes fear of the unknown |
| **"Not now", "Not yet" and a 5-minute talk all count** | Missing once isn't failing |

### C. Key trade-offs

| Decision | What we gave up | Why it's worth it |
| --- | --- | --- |
| No save button | Bookmarking | Saving is how talks get delayed |
| No login first | Early progress can be lost | Value comes within 2 minutes |
| Discreet notifications | A less specific reminder | The teen's trust comes first |
| No streaks or points | A strong habit hook | No reward for fake logs |
| Parent-only | No confirmation from the teen | Protects teen privacy. The reflection keeps logs honest |
| AI fills a fixed card | Flexible advice | Safer and testable. Open chat comes in v2 |

> **In one line:** Raise turns "have the talk" into "say one sentence on tonight's walk", in your own words, with no one watching.
