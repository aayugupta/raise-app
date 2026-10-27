// Run: node tests/metric.test.mjs
// The "started on time" rule (FR6) and the plan stages Home uses.
const { startedOnTime, planStage } = await import(new URL("../lib/talks.ts", import.meta.url).href);

const MIN = 60_000;
const at = Date.parse("2026-10-28T13:00:00Z"); // planned moment
const iso = (ms) => new Date(ms).toISOString();
const plan = (startOffsetMin, talkMin, extra = {}) => ({
  id: "x",
  topic: "relationships",
  moment: "walk",
  when: iso(at),
  createdAt: iso(at - 24 * 60 * MIN),
  ...(startOffsetMin === null ? {} : { startedAt: iso(at + startOffsetMin * MIN) }),
  ...(talkMin === null ? {} : { doneAt: iso(at + (startOffsetMin ?? 0) * MIN + talkMin * MIN) }),
  ...extra,
});

const started = [
  ["on time, 6 min", plan(0, 6), true],
  ["exactly 5 min", plan(0, 5), true],
  ["4 min is too short", plan(0, 4), false],
  ["started 50 min early", plan(-50, 10), true],
  ["started 2 h early", plan(-120, 10), false],
  ["started 2 h 59 min late", plan(179, 10), true],
  ["started 4 h late", plan(240, 10), false],
  ["Start but no Done", plan(0, null), false],
  ["never started", plan(null, null), false],
];

const stages = [
  ["2 h before → upcoming", plan(null, null), at - 120 * MIN, "upcoming"],
  ["30 min before → now", plan(null, null), at - 30 * MIN, "now"],
  ["2 h after → now", plan(null, null), at + 120 * MIN, "now"],
  ["4 h after, nothing done → check-in", plan(null, null), at + 240 * MIN, "check-in"],
  ["Done tapped → check-in", plan(0, 6), at + 10 * MIN, "check-in"],
  ["reflected → done", plan(0, 6, { reflectedAt: iso(at + 20 * MIN) }), at + 30 * MIN, "done"],
];

let pass = 0;
const total = started.length + stages.length;
for (const [name, p, expected] of started) {
  const ok = startedOnTime(p) === expected;
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"}  started on time: ${name} -> ${startedOnTime(p)}`);
}
for (const [name, p, now, expected] of stages) {
  const got = planStage(p, now);
  const ok = got === expected;
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"}  stage: ${name} -> ${got}`);
}
console.log(`\n${pass} of ${total} passed`);
process.exit(pass === total ? 0 : 1);
