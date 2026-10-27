// Setup answers. Saved only in this phone's browser storage, never sent anywhere.
import type { TopicId } from "./topics";

export type Profile = {
  nickname: string;
  role: "mother" | "father" | "guardian";
  ageBand: "10-13" | "14-16" | "17-19";
  teenGender: "girl" | "boy" | "unsaid";
  language: "hinglish" | "hindi" | "english";
  comfort: "gentle" | "open";
  // What the parent typed about what they want to talk about. Empty if they skipped,
  // or if it mentioned a crisis (crisis details are never stored).
  wish: string;
  suggestedTopic?: TopicId;
  createdAt: string;
};

const KEY = "raise.profile";

export function saveProfile(profile: Profile): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(profile));
  } catch {
    // Storage can be blocked (private mode). The app still works for this visit.
  }
}

// Profile edits (Profile screen). Talk Cards refresh by themselves: their saved copies are
// keyed by these answers, so a changed answer means a new card is written.
export function updateProfile(change: Partial<Profile>): Profile | null {
  const current = loadProfile();
  if (!current) return null;
  const next = { ...current, ...change };
  saveProfile(next);
  return next;
}

// "Clear my data": removes everything Raise saved on this phone (setup, plans, notes,
// confidence, saved cards, anonymous id). The content engine's log is Aayushi's tool and is kept.
export function clearMyData(): void {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith("raise.") && k !== "raise.engine.log")
      .forEach((k) => localStorage.removeItem(k));
  } catch {}
}

// Age bands changed on 27 Oct 2026 (13–15 / 16–18 → 10–13 / 14–16 / 17–19).
const OLD_AGE_BANDS: Record<string, Profile["ageBand"]> = { "13-15": "14-16", "16-18": "17-19" };

export function loadProfile(): Profile | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const profile = JSON.parse(raw) as Profile;
    const moved = OLD_AGE_BANDS[profile.ageBand as string];
    return moved ? { ...profile, ageBand: moved } : profile;
  } catch {
    return null;
  }
}
