// Run: node tests/events.test.mjs
// Only fixed labels may leave the phone. Anything with free text, names or unknown fields is refused.
const { cleanEvent } = await import(new URL("../lib/eventSchema.ts", import.meta.url).href);

const ID = "3f1c2a9e-7b4d-4e2a-9c1f-1234567890ab";
const cases = [
  ["setup answers (tapped only) accepted", { anonId: ID, event: "setup_completed", fields: { role: "father", age_band: "14-16", language: "hinglish", comfort: "gentle" } }, true],
  ["card viewed accepted", { anonId: ID, event: "card_viewed", fields: { topic: "stress", source: "ai" } }, true],
  ["talk done with on_time accepted", { anonId: ID, event: "talk_done", fields: { topic: "body", plan_id: ID, on_time: true } }, true],
  ["unplanned talk logged accepted", { anonId: ID, event: "talk_logged", fields: { topic: "friends", plan_id: ID, moment: "car", when: "yesterday" } }, true],
  ["unplanned talk with a free-text place refused", { anonId: ID, event: "talk_logged", fields: { topic: "friends", plan_id: ID, moment: "at grandma's house", when: "today" } }, false],
  ["help shown (no detail) accepted", { anonId: ID, event: "help_shown", fields: { from: "reflection" } }, true],
  ["nickname refused", { anonId: ID, event: "setup_completed", fields: { role: "mother", nickname: "Meera" } }, false],
  ["reflection notes refused", { anonId: ID, event: "reflection_saved", fields: { topic: "stress", plan_id: ID, happened: "yes", learned: "She worries about maths" } }, false],
  ["free text in an allowed field refused", { anonId: ID, event: "card_viewed", fields: { topic: "my daughter's crush", source: "ai" } }, false],
  ["crisis detail on help_shown refused", { anonId: ID, event: "help_shown", fields: { from: "setup", about: "self-harm" } }, false],
  ["unknown event refused", { anonId: ID, event: "location_tracked", fields: {} }, false],
  ["bad anonymous id refused", { anonId: "Meera Sharma", event: "card_viewed", fields: { topic: "stress", source: "ai" } }, false],
  ["wrong type refused (on_time as text)", { anonId: ID, event: "talk_done", fields: { topic: "body", plan_id: ID, on_time: "yes" } }, false],
  ["garbage refused", "hello", false],
];

let pass = 0;
for (const [name, body, shouldAccept] of cases) {
  const ok = (cleanEvent(body) !== null) === shouldAccept;
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
}
console.log(`\n${pass} of ${cases.length} passed`);
process.exit(pass === cases.length ? 0 : 1);
