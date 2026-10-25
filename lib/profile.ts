// Setup answers. Saved only in this phone's browser storage, never sent anywhere.
import type { TopicId } from "./topics";

export type Profile = {
  nickname: string;
  role: "mother" | "father" | "guardian";
  ageBand: "13-15" | "16-18";
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

export function loadProfile(): Profile | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Profile) : null;
  } catch {
    return null;
  }
}
