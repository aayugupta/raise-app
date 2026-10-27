// Run: node tests/reflection-danger.test.mjs
// Danger signs in a reflection must ALWAYS show the help offer (launch rule: 100%),
// and ordinary notes must not.
const { hasDangerSign } = await import(new URL("../lib/safety.ts", import.meta.url).href);

const danger = [
  "She said she wants to die sometimes",
  "He said there's no point living if he fails",
  "She feels life is pointless",
  "He's been cutting himself, I saw marks",
  "She mentioned suicide, a friend's",
  "Someone is blackmailing him with a photo",
  "An uncle touched her when she was small",
  "He has not been eating properly for weeks",
  "She feels so hopeless about everything",
  "woh boli jeene ka mann nahi karta",
  "usne kaha main mar jaun toh accha",
  "वह कहती है कि उसका जीने का मन नहीं",
];

const ordinary = [
  "We talked about her friend's crush and what makes someone a good friend",
  "Exams are killing him, he said, but laughing",
  "She's hopeless at maths and knows it",
  "He's not eating junk food anymore, trying to get fit",
  "We talked about Instagram and reels",
  "She was quiet at first, then opened up about her group",
  "He said he would die for a PS5 (joking)",
  "He just wants to disappear into his room after school",
  "She gave away her old clothes to her cousin",
  "We stay in touch with her friends' parents",
  "He was saying goodbye to his cousins after the wedding",
  "",
];

let pass = 0;
for (const t of danger) {
  const ok = hasDangerSign(t);
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"}  danger -> ${ok ? "help offered" : "MISSED"}: ${t}`);
}
for (const t of ordinary) {
  const ok = !hasDangerSign(t);
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"}  ordinary -> ${ok ? "no offer" : "FALSE ALARM"}: ${JSON.stringify(t)}`);
}
const total = danger.length + ordinary.length;
console.log(`\n${pass} of ${total} passed`);
process.exit(pass === total ? 0 : 1);
