// The 3-day follow-up (FR8; metric step 4). Built on the phone from the parent's own reflection:
// no AI, nothing sent anywhere.
import type { Language } from "./cards";
import type { Reflection } from "./reflections";
import type { TopicId } from "./topics";

export function isFollowUpDue(r: Reflection, now = Date.now()): boolean {
  return Boolean(r.followUpDue) && !r.followUpAt && new Date(r.followUpDue!).getTime() <= now;
}

// The recall check: the real topic plus two others, in an order that's fixed per plan
// (so reopening the screen doesn't reshuffle it).
export function topicChoices(r: Reflection, allTopics: TopicId[]): TopicId[] {
  const others = allTopics.filter((id) => id !== r.topic);
  const seed = [...r.planId].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const decoys = [others[seed % others.length], others[(seed + 2) % others.length]];
  const choices = [r.topic, ...decoys];
  const shift = seed % 3;
  return [...choices.slice(shift), ...choices.slice(0, shift)];
}

export type SaidMore = "yes" | "little" | "not-yet";

export const SAID_MORE: { value: SaidMore; label: string }[] = [
  { value: "yes", label: "Yes, they brought it up" },
  { value: "little", label: "A little" },
  { value: "not-yet", label: "Not yet" },
];

// A next line that builds on the last talk, in the parent's language. Worded without gendered verbs.
export const NEXT_LINE: Record<Language, string> = {
  hinglish: "Us din tumne jo bataya tha, woh mujhe yaad hai. Ab tumhe uske baare mein kya lagta hai?",
  hindi: "उस दिन तुमने जो बताया था, वह मुझे याद है। अब तुम्हें उसके बारे में क्या लगता है?",
  english: "I've been thinking about what you told me the other day. How do you feel about it now?",
};

export const NEXT_TIP: Record<SaidMore, string> = {
  yes: "They came back to it. That's the door staying open. Keep listening first.",
  little: "A little is a good start. One easy question, and then listen.",
  "not-yet": "That's normal. Teens often need time. You can gently bring it back up.",
};
