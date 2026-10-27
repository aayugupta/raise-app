// Run: node tests/completion.test.mjs
// The completed-conversation metric (Aayushi's simple rule, 28 Oct 2026):
// completed = a reflection where the talk happened, saved within 14 days of the topic's start.
const { journeyStats, withinWindow } = await import(new URL("../lib/metric.ts", import.meta.url).href);

const DAY = 86_400_000;
const now = Date.parse("2026-11-20T12:00:00Z");
const iso = (ms) => new Date(ms).toISOString();
const rec = (id, startedDaysAgo, extra = {}) => ({ id, topic: "stress", startedAt: iso(now - startedDaysAgo * DAY), ...extra });

let pass = 0;
let total = 0;
const check = (name, ok) => {
  total++;
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
};

check("day 13 is inside the window", withinWindow(iso(now - 13 * DAY), iso(now)));
check("exactly 14 days is inside", withinWindow(iso(now - 14 * DAY), iso(now)));
check("day 15 is outside", !withinWindow(iso(now - 15 * DAY), iso(now)));

const records = [
  rec("a", 20, { endedAt: iso(now - 15 * DAY), completedAt: iso(now - 15 * DAY) }), // reflected on day 5 → completed
  rec("b", 30, { endedAt: iso(now - 5 * DAY) }), // reflected after day 14 → not completed
  rec("c", 3), // still within 14 days → in progress
  rec("d", 40), // open, past 14 days, no talk → not completed
  rec("e", 25, { endedAt: iso(now - 24 * DAY), helpOffered: true }), // help offered → left out
  rec("f", 10, { endedAt: iso(now - 8 * DAY), completedAt: iso(now - 8 * DAY) }), // completed
];
const s = journeyStats(records, now);
check("help-offered journeys are left out (5 started, not 6)", s.started === 5);
check("2 completed", s.completed === 2);
check("1 in progress", s.inProgress === 1);
check("2 not completed", s.notCompleted === 2);
check("rate = 2 ÷ 5 = 40%", s.ratePct === 40);
// A talk that went badly still counts: the record only stores THAT it happened, never how it went.
check("a hard talk still counts as completed", journeyStats([rec("h", 2, { endedAt: iso(now - DAY), completedAt: iso(now - DAY) })], now).completed === 1);
check("nothing started → no rate", journeyStats([], now).ratePct === null);
check("a completedAt after day 14 doesn't count", journeyStats([rec("x", 30, { endedAt: iso(now), completedAt: iso(now) })], now).completed === 0);

console.log(`\n${pass} of ${total} passed`);
process.exit(pass === total ? 0 : 1);
