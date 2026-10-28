// Run: node tests/coach.test.mjs
// AI Coach (28 Oct 2026): everyday questions go through, every AI reply is checked before a parent
// sees it, and what is sent to the AI never includes hidden (crisis), refused or fallback messages.
const { checkCoachMessage, coachReplyProblems } = await import(new URL("../lib/coachSafety.ts", import.meta.url).href);
const { turnsForAi } = await import(new URL("../lib/coachChat.ts", import.meta.url).href);

let pass = 0;
let total = 0;
const check = (name, ok) => {
  total++;
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
};

// Everyday questions must NOT be blocked.
for (const text of [
  "My talk about her crush went badly. What can I say now?",
  "Woh school ke baare mein poochne par chup ho jaata hai",
  "How do I talk to my son about money and saving?",
  "She rolls her eyes whenever I bring up friends",
  "I shouted at him yesterday and I feel bad",
  "How do I talk about exams without adding pressure?",
]) {
  check(`goes to the coach: "${text}"`, checkCoachMessage(text).kind === "ok");
}

// Replies the parent must never see.
const bad = [
  ["diagnosis", "It sounds like she may have depression."],
  ["medicine", "A mild sleeping tablet before exams can help."],
  ["spying", "You could quietly read her messages to understand what's going on."],
  ["phone threat", "Tell him you'll take away his phone if he doesn't talk."],
  ["fear words", "This is a dangerous new trend and every parent must act now."],
  ["promised result", "This will fix everything between you."],
  ["made-up statistic", "70% of teens feel this way, so don't worry."],
  ["helpline number from the AI", "Please call 14416 right away."],
  ["sexuality judgement", "Being gay is just a phase at this age."],
];
for (const [name, reply] of bad) check(`reply blocked: ${name}`, coachReplyProblems(reply).length > 0);

const good = "That sounds hard. Try a short walk tonight and say: \"I'm sorry about yesterday. Can we try again? This time I'll listen first.\"";
check("a calm, practical reply passes", coachReplyProblems(good).length === 0);
check("an everyday time is fine", coachReplyProblems("Try around 9 at night, when it's quiet.").length === 0);

// What the AI sees.
const at = "2026-10-28T10:00:00Z";
const chat = [
  { role: "parent", text: "How do I start?", at },
  { role: "coach", text: "Try a walk.", at },
  { role: "parent", hidden: true, at },
  { role: "coach", help: true, at },
  { role: "parent", text: "How do I read her WhatsApp?", at },
  { role: "coach", refusal: "Raise doesn't help with monitoring.", offer: "online-safety", offerText: "...", at },
  { role: "parent", text: "Is this normal?", at },
  { role: "coach", text: "I couldn't answer that one well.", fallback: true, at },
  { role: "parent", text: "She went quiet after dinner.", at },
];
const turns = turnsForAi(chat);
check("the AI sees only real messages and replies", JSON.stringify(turns.map((t) => t.text)) === JSON.stringify(["How do I start?", "Try a walk.", "She went quiet after dinner."]));
check("a refused request is never sent to the AI", !turns.some((t) => t.text.includes("WhatsApp")));

// The check-in buttons send normal parent messages: they must reach the coach, not be blocked.
const { CHECKIN_READY, CHECKIN_MORE } = await import(new URL("../lib/coachChat.ts", import.meta.url).href);
check("check-in 'ready' goes to the coach", checkCoachMessage(CHECKIN_READY).kind === "ok");
check("check-in 'another question' goes to the coach", checkCoachMessage(CHECKIN_MORE).kind === "ok");

// Role-play (step 2, Practise): its turns stay apart from the normal chat, per topic.
const mixed = [
  ...chat,
  { role: "parent", text: "Tumhare friends mein kisi ko koi pasand hai?", at, roleplay: true, topic: "relationships" },
  { role: "coach", text: "Pata nahi... shayad.", tip: "Good, gentle start.", at, roleplay: true, topic: "relationships" },
  { role: "parent", text: "Stress role-play line", at, roleplay: true, topic: "stress" },
];
const rp = turnsForAi(mixed, "relationships");
check("a role-play sends only its own topic's turns", rp.length === 2 && rp[1].text === "Pata nahi... shayad.");
check("the coach's tip is never sent back to the AI", !rp.some((t) => t.text.includes("gentle start")));
check("the normal chat never includes role-play turns", !turnsForAi(mixed).some((t) => t.text.includes("pasand")));

console.log(`\n${pass} of ${total} passed`);
process.exit(pass === total ? 0 : 1);
