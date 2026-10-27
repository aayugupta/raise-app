// The instructions Gemini gets for personalising a Talk Card.
// Only tapped setup answers go in: never the nickname or anything the parent typed.
import type { BaseCard } from "./cards";
import type { Profile } from "./profile";

export type Family = Pick<Profile, "role" | "ageBand" | "teenGender" | "language" | "comfort">;

const LANGUAGE_RULES: Record<Family["language"], string> = {
  hinglish:
    "Hinglish: Hindi written in Latin letters, mixed naturally with English words, the way urban Indian parents talk at home. Never use Devanagari.",
  hindi: "Hindi in Devanagari script, simple everyday spoken Hindi (not formal or bookish). Common English words like 'phone' or 'online' are fine.",
  english: "Simple, warm Indian English. Never use Devanagari.",
};

const ROLE_RULES: Record<Family["role"], string> = {
  mother: "The parent is the teen's mother. Give her warm, clear words. In Hindi or Hinglish, the parent speaks with feminine verb forms (e.g. 'main chahti hoon').",
  father:
    "The parent is the teen's father. Teens rarely find fathers the easier parent to talk to, so make him sound lighter and side by side, and let him admit his own awkwardness. In Hindi or Hinglish, the parent speaks with masculine verb forms (e.g. 'main chahta hoon').",
  guardian: "The parent is another guardian (e.g. grandparent, aunt, uncle). Keep it warm and avoid gendered verb forms for the parent.",
};

const TEEN_RULES: Record<Family["teenGender"], string> = {
  girl: "The teen is a girl: use feminine forms for her in Hindi or Hinglish, and examples that fit a girl.",
  boy: "The teen is a boy: use masculine forms for him in Hindi or Hinglish, and examples that fit a boy.",
  unsaid: "The teen's gender is not given: avoid gendered forms for the teen (e.g. ask about 'tum log' or 'people your age').",
};

const AGE_RULES: Record<Family["ageBand"], string> = {
  "10-13":
    "The child is 10 to 13: keep it simple, light and concrete. Talk about friends, school and 'kids your age', never the child's own romantic or sexual life.",
  "14-16": "The teen is 14 to 16: start with friends and 'people your age'; only gently touch on the teen's own life.",
  "17-19":
    "The young person is 17 to 19: they are close to adulthood. You may ask about their own life and choices directly, and respect their independence.",
};

const COMFORT_RULES: Record<Family["comfort"], string> = {
  gentle: "The family is just starting to talk about personal things: keep the wording gentle and indirect.",
  open: "The family talks quite openly: the wording can be a little more direct.",
};

export function buildPrompt(base: BaseCard, family: Family): string {
  const baseCard = {
    whyNow: base.whyNow,
    firstLine: base.firstLine,
    followUps: base.followUps,
    say: base.say,
    avoid: base.avoid,
    react: base.react,
  };

  return `You are rewording a "Talk Card" for Raise, an app that helps Indian parents start a calm talk with their teen.
The card below was written by hand and checked. Your job is to reword it for one family. You are not writing a new card.

TOPIC: ${base.name}
THE TEEN'S SIDE OF THE TOPIC: "${base.teenQuestion}"

BASE CARD (JSON):
${JSON.stringify(baseCard, null, 2)}

THIS FAMILY:
- ${ROLE_RULES[family.role]}
- ${TEEN_RULES[family.teenGender]}
- ${AGE_RULES[family.ageBand]}
- ${COMFORT_RULES[family.comfort]}

LANGUAGE: Write every field in ${LANGUAGE_RULES[family.language]}

RULES (follow all of them):
1. Reword only. Keep the meaning of every line. Do not add facts, numbers, statistics, advice, helplines or sources.
2. "whyNow": keep the same numbers exactly. One or two short sentences.
3. "firstLine": one short question (under 25 words) that sounds natural said out loud. It opens from the teen's side, with curiosity, never a lecture. Use the base first line in the chosen language as your starting point.
4. "say": keep 3 lines. The first must keep its meaning: the teen won't be in trouble for telling the parent.
5. "avoid": keep 3 lines. These describe things the parent should NOT do or say. Keep them as warnings.
6. "react": one calm line for each of: quiet, upset, disagree, noTalk.
7. Never diagnose, never give medical, medicine or legal advice, never shame or scare, never use fear words, never suggest spying, tracking, reading messages or checking the teen's phone, never suggest taking the phone away or any punishment, never judge sexuality or gender identity, no sexual detail, never promise results.
8. Warm, calm, short sentences. No emojis.
9. Write EVERY field in the chosen language, including followUps, say, avoid and react. Do not leave any line in the base card's English unless the chosen language is English.
10. Do not assume whether the teen is in school or college. Say "school" only if the base card does.
11. Never mention spying, tracking, monitoring or checking up, not even to say the parent is NOT doing it. Reassure in other words (e.g. "I just want you to feel you can come to me"). The "avoid" list is the only place the phone or checking may be mentioned, as a warning.

Reply with JSON only, in exactly this shape:
{"whyNow": "...", "firstLine": "...", "followUps": ["...", "..."], "say": ["...", "...", "..."], "avoid": ["...", "...", "..."], "react": {"quiet": "...", "upset": "...", "disagree": "...", "noTalk": "..."}}`;
}
