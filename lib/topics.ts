// The 6 v1 topics. Full card content lives in content/base-talk-cards.md.
// Topic accent colours follow the design system (29 Oct 2026): muted tones that sit with sage, ivory and terracotta.
export type TopicId = "relationships" | "stress" | "friends" | "online-safety" | "consent" | "body";

// Order matters: the first three are what teens most want to talk about
// (relationships 10 of 12, feelings and friends 7 of 12 each), so they are suggested first.
export const TOPICS: { id: TopicId; name: string; short: string; icon: string; teenQuestion: string; color: string }[] = [
  { id: "relationships", name: "Relationships and crushes", short: "Relationships", icon: "💞", teenQuestion: "How do you know if someone is good for you?", color: "#c47f62" },
  { id: "stress", name: "Stress and feelings", short: "Stress & feelings", icon: "🌧️", teenQuestion: "What do you do when everything feels like too much?", color: "#6f8f9a" },
  { id: "friends", name: "Friends and peer pressure", short: "Friendships", icon: "🤝", teenQuestion: "How do you say no to friends without losing them?", color: "#b8914f" },
  { id: "online-safety", name: "Online safety", short: "Online safety", icon: "🛡️", teenQuestion: "What would you do if someone online asked for a photo?", color: "#285c4d" },
  { id: "consent", name: "Consent and personal safety", short: "Consent & safety", icon: "✋", teenQuestion: "Is it okay to say no, even to someone you know?", color: "#5f8a6e" },
  { id: "body", name: "Body and growing up", short: "Growing up", icon: "🌱", teenQuestion: "Is what's happening to my body normal?", color: "#a87a8a" },
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
