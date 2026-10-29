// Run: node tests/reschedule.test.mjs
// "Not yet" moves the talk one hour later, never late at night or very early (Aayushi, 29 Oct 2026).
const { nextTryTime } = await import(new URL("../lib/reschedule.ts", import.meta.url).href);

let pass = 0;
let total = 0;
const check = (name, ok) => {
  total++;
  if (ok) pass++;
  else console.log("FAIL", name);
};
const at = (d, h, m) => new Date(2026, 9, d, h, m, 0, 0); // local time, October 2026
const same = (a, b) => a.getTime() === b.getTime();

// Daytime: one hour later, rounded up to the next quarter hour
check("6:40 pm -> 7:45 pm", same(nextTryTime(at(29, 18, 30).toISOString(), at(29, 18, 40)), at(29, 19, 45)));
check("6:30 pm exactly -> 7:30 pm", same(nextTryTime(at(29, 18, 30).toISOString(), at(29, 18, 30)), at(29, 19, 30)));
check("8:50 pm -> 10:00 pm is too late, so tomorrow at the plan's time", same(nextTryTime(at(29, 20, 30).toISOString(), at(29, 20, 50)), at(30, 20, 30)));
check("11 pm, evening plan at 9:30 pm -> tomorrow 9:30 pm", same(nextTryTime(at(29, 21, 30).toISOString(), at(29, 23, 0)), at(30, 21, 30)));
check("1 am, walk at 6:30 pm -> today 6:30 pm", same(nextTryTime(at(28, 18, 30).toISOString(), at(29, 1, 0)), at(29, 18, 30)));
check("5:30 am -> 6:30 am is too early, so the plan's time later today", same(nextTryTime(at(28, 18, 30).toISOString(), at(29, 5, 30)), at(29, 18, 30)));
check("6:15 am -> 7:15 am is fine", same(nextTryTime(at(28, 18, 30).toISOString(), at(29, 6, 15)), at(29, 7, 15)));
check("a 10:30 pm original falls back to 6:30 pm", same(nextTryTime(at(28, 22, 30).toISOString(), at(29, 23, 0)), at(30, 18, 30)));
check("always in the future", nextTryTime(at(29, 9, 0).toISOString(), at(29, 23, 59)).getTime() > at(29, 23, 59).getTime());

console.log(`${pass} of ${total} passed`);
if (pass !== total) process.exit(1);
