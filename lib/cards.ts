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
