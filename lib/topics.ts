// The 6 v1 topics. Full card content lives in content/base-talk-cards.md.
export type TopicId = "relationships" | "stress" | "friends" | "online-safety" | "consent" | "body" | "study" | "screen-time";

// Order matters: the first three are what teens most want to talk about
// (relationships 10 of 12, feelings and friends 7 of 12 each), so they are suggested first.
export const TOPICS: { id: TopicId; name: string; teenQuestion: string; color: string }[] = [
  { id: "relationships", name: "Relationships and crushes", teenQuestion: "How do you know if someone is good for you?", color: "#e8735a" },
  { id: "stress", name: "Stress and feelings", teenQuestion: "What do you do when everything feels like too much?", color: "#8fb9a8" },
  { id: "friends", name: "Friends and peer pressure", teenQuestion: "How do you say no to friends without losing them?", color: "#e7b04a" },
  { id: "online-safety", name: "Online safety", teenQuestion: "What would you do if someone online asked for a photo?", color: "#0e716d" },
  { id: "consent", name: "Consent and personal safety", teenQuestion: "Is it okay to say no, even to someone you know?", color: "#4e8a5e" },
  { id: "body", name: "Body and growing up", teenQuestion: "Is what's happening to my body normal?", color: "#f08f74" },
  // Added 27 Oct 2026 from Aayushi's brainstorm.
  { id: "study", name: "Study and future", teenQuestion: "What would you choose if no one else's opinion mattered?", color: "#7b8cc4" },
  { id: "screen-time", name: "Screen time", teenQuestion: "What's a fair phone rule for everyone at home, parents too?", color: "#5aa9c9" },
];

export function isTopicId(value: string): value is TopicId {
  return TOPICS.some((t) => t.id === value);
}

// Crisis topics never get a Talk Card. They open the Help screen instead (Step 3, section 6C).
export type CrisisId = "self-harm" | "abuse" | "blackmail" | "addiction";

export const CRISIS_TOPICS: { id: CrisisId; name: string }[] = [
  { id: "self-harm", name: "Self-harm or thoughts of suicide" },
  { id: "abuse", name: "Abuse, or someone hurting my teen" },
  { id: "blackmail", name: "Photo blackmail or online threats" },
  { id: "addiction", name: "Drugs, alcohol or addiction" },
];

export function topicName(id: TopicId): string {
  return TOPICS.find((t) => t.id === id)?.name ?? id;
}
