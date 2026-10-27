// Run: node tests/follow-up.test.mjs
// The 3-day follow-up: due at the right time, and the recall choices are fair.
const { isFollowUpDue, topicChoices } = await import(new URL("../lib/followUp.ts", import.meta.url).href);

const TOPICS = ["relationships", "stress", "friends", "online-safety", "consent", "body"];
const D = 86_400_000;
const now = Date.parse("2026-10-30T12:00:00Z");
const r = (extra) => ({ planId: "p-1", topic: "stress", happened: "yes", discussed: "x", learned: "y", helpOffered: false, createdAt: new Date(now - 3 * D).toISOString(), ...extra });

let pass = 0;
let total = 0;
const check = (name, ok) => {
  total++;
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
};

check("due when 3 days have passed", isFollowUpDue(r({ followUpDue: new Date(now - 60_000).toISOString() }), now));
check("not due before 3 days", !isFollowUpDue(r({ followUpDue: new Date(now + D).toISOString() }), now));
check("not due once answered", !isFollowUpDue(r({ followUpDue: new Date(now - D).toISOString(), followUpAt: new Date(now).toISOString() }), now));
check("never due without a follow-up date (Not yet, or help offered)", !isFollowUpDue(r({}), now));

// For every topic and many plan ids: 3 different choices, one of them the real topic, same order each time.
let fair = true;
for (const topic of TOPICS) {
  for (let i = 0; i < 50; i++) {
    const rr = r({ topic, planId: `plan-${i}-${topic}` });
    const c = topicChoices(rr, TOPICS);
    if (c.length !== 3 || new Set(c).size !== 3 || !c.includes(topic) || JSON.stringify(c) !== JSON.stringify(topicChoices(rr, TOPICS))) fair = false;
  }
}
check("choices: always 3, all different, include the real topic, stable order (300 cases)", fair);

// The real topic shouldn't always sit in the same position.
const positions = new Set(Array.from({ length: 30 }, (_, i) => topicChoices(r({ planId: `id-${i}` }), TOPICS).indexOf("stress")));
check("the real topic moves between positions", positions.size > 1);

console.log(`\n${pass} of ${total} passed`);
process.exit(pass === total ? 0 : 1);
