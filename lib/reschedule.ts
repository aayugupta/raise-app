// "Not yet" moves the talk to a new time by itself (Aayushi, 29 Oct 2026): one hour from now, rounded up
// to the next quarter hour. Never late at night or very early: then it moves to the planned moment's usual
// time on the next suitable day. The parent can always pick another time instead.

const QUARTER_MS = 15 * 60_000;
const LATEST_HOUR = 22; // no talk planned at 10 pm or later
const EARLIEST_HOUR = 7; // or before 7 am

export function nextTryTime(originalWhen: string, now: Date = new Date()): Date {
  const next = new Date(Math.ceil((now.getTime() + 60 * 60_000) / QUARTER_MS) * QUARTER_MS);
  const h = next.getHours();
  if (h >= EARLIEST_HOUR && h < LATEST_HOUR) return next;

  // Too late or too early: same time of day as the original plan, on the next day that's still ahead.
  const original = new Date(originalWhen);
  const moved = new Date(now);
  moved.setHours(original.getHours(), original.getMinutes(), 0, 0);
  if (moved.getHours() < EARLIEST_HOUR || moved.getHours() >= LATEST_HOUR) moved.setHours(18, 30, 0, 0);
  while (moved.getTime() <= now.getTime()) moved.setDate(moved.getDate() + 1);
  return moved;
}
