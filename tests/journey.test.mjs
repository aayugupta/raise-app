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

const j = activeJourneys(
  [plan("a", "stress", -20), plan("b", "online-safety", 26), plan("c", "friends", 0.3), plan("d", "body", -50, { reflectedAt: iso(now - 40 * H) })],
  ["consent", "online-safety"],
  now
);
const byTopic = Object.fromEntries(j.map((x) => [x.topic, x]));

check("past, not reflected → step 3 Reflect", byTopic.stress?.step === 3 && byTopic.stress.href === "/reflect/a");
check("planned for tomorrow → step 2 Talk", byTopic["online-safety"]?.step === 2);
check("happening now → step 2 with Talk mode", byTopic.friends?.step === 2 && byTopic.friends.href === "/talk/c");
check("opened, not planned → step 1 Prepare", byTopic.consent?.step === 1 && byTopic.consent.href === "/card/consent");
check("an open topic that's already planned isn't shown twice", j.filter((x) => x.topic === "online-safety").length === 1);
check("reflected talks are finished and not shown", !byTopic.body);
check("most urgent first (Reflect before Talk before Prepare)", j[0].step === 3 && j[j.length - 1].step === 1);
check("nothing active → empty", activeJourneys([], [], now).length === 0);

console.log(`\n${pass} of ${total} passed`);
process.exit(pass === total ? 0 : 1);
