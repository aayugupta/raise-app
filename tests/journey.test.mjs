// Run: node tests/journey.test.mjs
// "Continue your journey" on Home: each active topic is at the right step, most urgent first.
const { activeJourneys } = await import(new URL("../lib/journey.ts", import.meta.url).href);

const H = 3_600_000;
const now = Date.parse("2026-10-28T12:00:00Z");
const iso = (ms) => new Date(ms).toISOString();
const plan = (id, topic, hoursFromNow, extra = {}) => ({ id, topic, moment: "walk", when: iso(now + hoursFromNow * H), createdAt: iso(now - 48 * H), ...extra });

let pass = 0;
let total = 0;
const check = (name, ok) => {
  total++;
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
};

// Aayushi's 4 steps (28 Oct 2026): 1 Learn → 2 Practise → 3 Plan → 4 Reflect.
const j = activeJourneys(
  [plan("a", "stress", -20), plan("b", "online-safety", 26), plan("c", "friends", 0.3), plan("d", "body", -50, { reflectedAt: iso(now - 40 * H) })],
  ["consent", "online-safety"],
  now,
  { relationships: iso(now - 24 * H) },
  { consent: { learned: true, practised: false }, relationships: { learned: false, practised: false } }
);
const byTopic = Object.fromEntries(j.map((x) => [x.topic, x]));

check("planned, time passed → step 4 Reflect", byTopic.stress?.step === 4 && byTopic.stress.href === "/reflect/a");
check("planned for tomorrow → step 4, see your first line", byTopic["online-safety"]?.step === 4 && byTopic["online-safety"].href === "/card/online-safety");
check("happening now → step 4 with Talk mode", byTopic.friends?.step === 4 && byTopic.friends.href === "/talk/c");
check("started from setup, flashcards not opened → step 1 Learn", byTopic.relationships?.step === 1 && byTopic.relationships.href === "/card/relationships");
check("flashcards read, not practised → step 2 Practise with the coach", byTopic.consent?.step === 2 && byTopic.consent.href === "/coach?topic=consent");
check("step 2 always offers planning, coach or not", byTopic.consent?.planHref === "/plan/consent?skipPractice=1");
const practised = activeJourneys([], ["consent"], now, {}, { consent: { learned: true, practised: true } });
check("practised (or skipped) → step 3 Plan", practised[0]?.step === 3 && practised[0].href === "/plan/consent");
check("planned talks can be reflected on any time", byTopic["online-safety"]?.reflectHref === "/reflect/b" && byTopic.friends?.reflectHref === "/reflect/c");
check("unplanned steps can log a talk that already happened", byTopic.consent?.reflectHref === "/log?topic=consent");
check("a planned topic isn't shown twice", j.filter((x) => x.topic === "online-safety").length === 1);
check("reflected talks are finished and not shown", !byTopic.body);
check("furthest along first (Reflect … Learn)", j[0].step === 4 && j[j.length - 1].step === 1);
check("nothing active → empty", activeJourneys([], [], now).length === 0);

// A topic stays open until a reflection is logged, even past day 14 (Aayushi, 29 Oct 2026).
const late = activeJourneys([], [], now, { stress: iso(now - 20 * 24 * H) }, { stress: { learned: true, practised: true } });
check("past day 14, no reflection → still shown, at its step", late[0]?.topic === "stress" && late[0].step === 3);
check("past day 14 → \"Still open\", not a day count", late[0]?.stillOpen === true && late[0].day === undefined);
const latePlan = activeJourneys([plan("z", "body", -24 * 18)], [], now, { body: iso(now - 25 * 24 * H) });
check("a planned talk weeks ago, never reflected → still asks to reflect", latePlan[0]?.step === 4 && latePlan[0].href === "/reflect/z");

// 14-day journey: "Day X of 14", counted from when the topic started. Never past 14 ("no shame").
const { journeyDay } = await import(new URL("../lib/talks.ts", import.meta.url).href);
check("started today → Day 1", journeyDay(iso(now), now) === 1);
check("started 4 days ago → Day 5", journeyDay(iso(now - 4 * 24 * H), now) === 5);
check("started 30 days ago → stays at Day 14", journeyDay(iso(now - 30 * 24 * H), now) === 14);
const withDays = activeJourneys([plan("e", "stress", 26)], ["consent"], now, { consent: iso(now - 2 * 24 * H) });
check("open topic shows its start day", withDays.find((x) => x.topic === "consent")?.day === 3);
check("planned topic without a start falls back to the plan date", withDays.find((x) => x.topic === "stress")?.day === 3);

console.log(`\n${pass} of ${total} passed`);
process.exit(pass === total ? 0 : 1);
