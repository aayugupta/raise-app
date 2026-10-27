// "Add to calendar" for a plan. The event NEVER names the topic: a teen might see the parent's phone.
// It only says the moment ("Your walk") and links to Raise's Home, not to the topic.

const DURATION_MIN = 30;

function utcStamp(date: Date): string {
  // 2026-10-27T13:00:00.000Z -> 20261027T130000Z
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function details(appUrl: string) {
  return `Your planned moment. Open Raise when it's time: ${appUrl}`;
}

// Opens Google Calendar (the app on most Android phones) with the event filled in.
export function googleCalendarUrl(title: string, start: Date, appUrl: string): string {
  const end = new Date(start.getTime() + DURATION_MIN * 60_000);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${utcStamp(start)}/${utcStamp(end)}`,
    details: details(appUrl),
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// A standard calendar file for iPhone and other calendar apps, with a reminder 15 minutes before.
export function icsFile(title: string, start: Date, appUrl: string, uid: string): string {
  const end = new Date(start.getTime() + DURATION_MIN * 60_000);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Raise//Planner//EN",
    "BEGIN:VEVENT",
    `UID:${uid}@raise`,
    `DTSTAMP:${utcStamp(new Date())}`,
    `DTSTART:${utcStamp(start)}`,
    `DTEND:${utcStamp(end)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${details(appUrl)}`,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `DESCRIPTION:${title} in 15 minutes`,
    "TRIGGER:-PT15M",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
