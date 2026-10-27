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
