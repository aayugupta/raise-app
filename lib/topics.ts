// The 6 v1 topics. Full card content lives in content/base-talk-cards.md.
export type TopicId = "relationships" | "stress" | "friends" | "online-safety" | "consent" | "body";

export const TOPICS: { id: TopicId; name: string; teenQuestion: string }[] = [
  { id: "relationships", name: "Relationships and crushes", teenQuestion: "How do you know if someone is good for you?" },
  { id: "stress", name: "Stress and feelings", teenQuestion: "What do you do when everything feels like too much?" },
  { id: "friends", name: "Friends and peer pressure", teenQuestion: "How do you say no to friends without losing them?" },
  { id: "online-safety", name: "Online safety", teenQuestion: "What would you do if someone online asked for a photo?" },
  { id: "consent", name: "Consent and personal safety", teenQuestion: "Is it okay to say no, even to someone you know?" },
  { id: "body", name: "Body and growing up", teenQuestion: "Is what's happening to my body normal?" },
];

export function topicName(id: TopicId): string {
  return TOPICS.find((t) => t.id === id)?.name ?? id;
}
