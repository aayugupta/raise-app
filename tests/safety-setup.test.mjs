// Run: node tests/safety-setup.test.mjs
const { checkSetupText } = await import(new URL("../lib/safety.ts", import.meta.url).href);

const cases = [
  // [text, expected kind, expected offer/topic or undefined]
  ["How do I read her WhatsApp?", "refuse", "online-safety"],
  ["I want to check his phone secretly", "refuse", "online-safety"],
  ["Is there a spy app I can install", "refuse", "online-safety"],
  ["How can I track her location", "refuse", "online-safety"],
  ["uski chats kaise padhu", "refuse", "online-safety"],
  ["Which medicine helps with exam stress?", "refuse", "stress"],
  ["I think my son has ADHD", "refuse", "stress"],
  ["How do I find out if my son is gay", "refuse", "stress"],
  ["Can I change his sexuality", "refuse", "stress"],
  ["My daughter talks about suicide", "crisis"],
  ["she has been cutting herself", "crisis"],
  ["Someone is blackmailing my son with photos", "crisis"],
  ["I think an uncle touched her", "crisis"],
  ["He is taking drugs with friends", "crisis"],
  ["woh kehti hai marna chahti hai", "crisis"],
  ["वह आत्महत्या की बात करती है", "crisis"],
  ["She has a crush and I don't know how to bring it up", "ok", "relationships"],
  ["Exam stress and his marks", "ok", "stress"],
  ["peer pressure from her friends group", "ok", "friends"],
  ["too much time on instagram and reels", "ok", "online-safety"],
  ["periods and puberty", "ok", "body"],
  ["saying no to people, personal safety", "ok", "consent"],
  ["", "ok", undefined],
  ["just want to be closer", "ok", undefined],
];

let pass = 0;
for (const [text, kind, extra] of cases) {
  const r = checkSetupText(text);
  const got = r.kind === "refuse" ? r.offer : r.kind === "ok" ? r.suggestedTopic : undefined;
  const ok = r.kind === kind && got === extra;
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${JSON.stringify(text)} -> ${r.kind}${got ? " / " + got : ""}`);
}
console.log(`\n${pass} of ${cases.length} passed`);
