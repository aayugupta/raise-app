// Talk Cards. The base cards come from content/base-talk-cards.md (via scripts/build-cards.mjs).
import data from "./base-cards.json";
import type { Profile } from "./profile";
import type { TopicId } from "./topics";

export type Language = Profile["language"];

export type BaseCard = {
  id: TopicId;
  name: string;
  teenQuestion: string;
  whyNow: string;
  whySource: string;
  firstLine: Record<Language, string>;
  followUps: string[];
  say: string[];
  avoid: string[];
  react: { quiet: string; upset: string; disagree: string; noTalk: string };
  getHelp: string;
  sources: string;
  checkedOn: string;
};

// What the Talk Card screen shows. The AI version will fill the same shape;
// the safety promise, help and sources always come from the base card.
export type TalkCard = {
  whyNow: string;
  firstLine: string;
  followUps: string[];
  say: string[];
  avoid: string[];
  react: BaseCard["react"];
};

export const SAFETY_PROMISE: string = data.safetyPromise;

export function getBaseCard(id: TopicId): BaseCard {
  const card = (data.cards as BaseCard[]).find((c) => c.id === id);
  if (!card) throw new Error(`No base card for topic "${id}"`);
  return card;
}

type CacheFamily = Pick<Profile, "role" | "ageBand" | "teenGender" | "language" | "comfort">;

// Personalised cards are remembered on this phone, so reopening a card doesn't call the AI again.
// "v5" (29 Oct 2026): six "Don't say" lines per card, so older saved cards are written again.
export function cardCacheKey(topic: TopicId, f: CacheFamily, checkedOn: string) {
  return `raise.card.v5.${topic}.${f.role}.${f.ageBand}.${f.teenGender}.${f.language}.${f.comfort}.${checkedOn}`;
}

// The first line the parent last saw for this topic: the personalised one if saved, else the base one.
export function currentFirstLine(topic: TopicId, profile: Profile | null): string {
  const base = getBaseCard(topic);
  if (!profile) return base.firstLine.hinglish;
  try {
    const saved = localStorage.getItem(cardCacheKey(topic, profile, base.checkedOn));
    if (saved) return (JSON.parse(saved) as TalkCard).firstLine;
  } catch {
    // Fall through to the base card.
  }
  return base.firstLine[profile.language] ?? base.firstLine.hinglish;
}

// The base card as written, in the parent's language for the first line.
export function baseTalkCard(base: BaseCard, language: Language): TalkCard {
  return {
    whyNow: base.whyNow,
    firstLine: base.firstLine[language] ?? base.firstLine.hinglish,
    followUps: base.followUps,
    say: base.say,
    avoid: base.avoid,
    react: base.react,
  };
}
