// Recovery path (FR9, FR10). Templates live on the phone: nothing here uses the AI.
// Never a "failed" label: a missed or hard talk leads to an easier next step.
import type { Language } from "./cards";
import type { MomentId } from "./talks";

export type BlockerId = "moment" | "awkward" | "mood" | "ready" | "other";

export const BLOCKERS: { id: BlockerId; label: string; tip: string; suggestMoment?: MomentId }[] = [
  {
    id: "moment",
    label: "The right moment didn't come",
    tip: "Try a side-by-side moment, like a short walk. Teens open up most when you're not facing each other.",
    suggestMoment: "walk",
  },
  {
    id: "awkward",
    label: "It felt awkward",
    tip: "Try a lighter way in. Start with something easy, like their day, a show or their friends. Use the first line only if it feels right. A good chat counts too.",
  },
  {
    id: "mood",
    label: "My teen wasn't in the mood",
    tip: "That's normal. Wait for a calmer time. Late evenings, when it's quiet, work for many teens.",
    suggestMoment: "evening",
  },
  {
    id: "ready",
    label: "I didn't feel ready",
    tip: "Say the first line out loud once before the moment. One sentence is enough to begin.",
  },
  {
    id: "other",
    label: "Something else",
    tip: "Plans change. Pick a new moment whenever you're ready. The topic will wait for you.",
  },
];

// The repair line after a hard talk, in the parent's language.
// Worded without gendered verbs, so it fits mothers, fathers and guardians alike.
export const REPAIR_LINE: Record<Language, string> = {
  hinglish: "Us din ki baat ke liye sorry. Kya hum phir se baat kar sakte hain? Is baar pehle tumhari baat sunenge.",
  hindi: "उस दिन की बात के लिए सॉरी। क्या हम फिर से बात कर सकते हैं? इस बार पहले तुम्हारी बात सुनेंगे।",
  english: "I'm sorry about how our talk went. Can we try again? This time I'll listen first.",
};

export const SOFTER_RESTART = [
  "Wait a day or two, and let things settle.",
  "Start with the repair line, not the topic.",
  "Pick a side-by-side moment, like a walk or a quiet evening.",
  "Ask one question, then listen. No advice unless they ask.",
];
