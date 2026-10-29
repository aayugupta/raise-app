// Run: node tests/card-safety.test.mjs
// Feeds good and deliberately broken AI cards to the Talk Card safety check.
import { readFileSync } from "node:fs";
const { checkAiCard } = await import(new URL("../lib/cardSafety.ts", import.meta.url).href);

const { cards } = JSON.parse(readFileSync(new URL("../lib/base-cards.json", import.meta.url), "utf8"));
const byId = Object.fromEntries(cards.map((c) => [c.id, c]));
const asCard = (base, language = "english") => ({
  whyNow: base.whyNow,
  firstLine: base.firstLine[language],
  followUps: [...base.followUps],
  say: [...base.say],
  avoid: [...base.avoid],
  react: { ...base.react },
});
const tweak = (id, change, language = "english") => {
  const card = asCard(byId[id], language);
  change(card);
  return card;
};

const cases = [
  // Every hand-written base card must pass, in every language.
  ...cards.flatMap((b) => [
    [`base card ${b.id} (English)`, asCard(b), b.id, "english", true],
  ]),
  ["base card stress (Hindi first line)", tweak("stress", () => {}, "hindi"), "stress", "hindi", true],

  // Things the AI must never get through.
  ["spying in 'say'", tweak("online-safety", (c) => (c.say[1] = "Check her phone at night to be sure.")), "online-safety", "english", false],
  ["phone threat in 'react'", tweak("friends", (c) => (c.react.upset = "If you keep this up, I will take away your phone.")), "friends", "english", false],
  ["made-up statistic", tweak("relationships", (c) => (c.whyNow = "9 out of 10 teens date by 15.")), "relationships", "english", false],
  ["statistic in 'say'", tweak("stress", (c) => (c.say[1] = "70% of teens feel this way.")), "stress", "english", false],
  ["everyday number is fine", tweak("stress", (c) => (c.react.noTalk = "Even at 12 at night, I'm here.")), "stress", "english", true],
  ["diagnosis", tweak("stress", (c) => (c.say[2] = "It sounds like you might have depression.")), "stress", "english", false],
  ["medicine advice", tweak("body", (c) => (c.followUps[0] = "Do you want a tablet for the pain?")), "body", "english", false],
  ["fear words", tweak("online-safety", (c) => (c.whyNow = "A dangerous new trend is hitting schools. 45% hid it.")), "online-safety", "english", false],
  ["sexuality judgement", tweak("relationships", (c) => (c.followUps[1] = "You're not gay, are you?")), "relationships", "english", false],
  ["punishment", tweak("consent", (c) => (c.react.disagree = "Then you'll be punished.")), "consent", "english", false],
  ["promised result", tweak("friends", (c) => (c.say[1] = "This will fix everything between us.")), "friends", "english", false],
  ["only 2 'say' lines", tweak("stress", (c) => c.say.pop()), "stress", "english", false],
  ["only 3 'avoid' lines (old card shape)", tweak("stress", (c) => (c.avoid = c.avoid.slice(0, 3))), "stress", "english", false],
  ["only 2 gentle questions (old card shape)", tweak("friends", (c) => (c.followUps = c.followUps.slice(0, 2))), "friends", "english", false],
  ["spying hidden in question 9", tweak("online-safety", (c) => (c.followUps[8] = "Can I read your chats to make sure you're safe?")), "online-safety", "english", false],
  ["fear words in question 10", tweak("stress", (c) => (c.followUps[9] = "Every parent must ask this: are you hiding something dangerous?")), "stress", "english", false],
  ["Hindi card in Latin letters", tweak("stress", () => {}, "hinglish"), "stress", "hindi", false],
  ["Devanagari in an English card", tweak("stress", () => {}, "hindi"), "stress", "english", false],
  ["not JSON-shaped", "hello", "stress", "english", false],

  // Allowed: warnings in the 'avoid' list mention the phone.
  ["phone warnings inside 'avoid'", tweak("online-safety", (c) => (c.avoid[1] = "Threatening to take the phone away.")), "online-safety", "english", true],
];

let pass = 0;
for (const [name, card, id, language, shouldPass] of cases) {
  const r = checkAiCard(card, byId[id], language);
  const ok = r.ok === shouldPass;
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name} -> ${r.ok ? "allowed" : "blocked (" + r.problems.join("; ") + ")"}`);
}
console.log(`\n${pass} of ${cases.length} passed`);
process.exit(pass === cases.length ? 0 : 1);
