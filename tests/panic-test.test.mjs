// Run: node tests/panic-test.test.mjs
// The content engine's hard rules, which the AI is not trusted with.
const { finalisePanicResult, normUrl } = await import(new URL("../lib/panicTest.ts", import.meta.url).href);

const TOPICS = ["relationships", "stress", "friends", "online-safety", "consent", "body"];
const A = "https://www.ncrb.gov.in/report-2024/";
const B = "https://theprint.in/india/story-123";
const pass = (reason = "ok") => ({ pass: true, reason });
const fail = (reason = "no") => ({ pass: false, reason });
const ai = (checks, extra = {}) => ({
  claimSummary: "A claim.",
  sources: [{ url: A, kind: "official", note: "x" }, { url: B, kind: "news", note: "y" }],
  checks,
  topic: "online-safety",
  draftWhyNow: "About 89% of child cybercrime cases in India involved explicit material (NCRB, 2024).",
  ...extra,
});
const allPass = { source: pass(), scale: pass(), india: pass(), action: pass() };
const opened = (...urls) => new Set(urls.map(normUrl));

const cases = [
  ["all 4 pass, links opened → accept with draft", () => {
    const r = finalisePanicResult(ai(allPass), [A, B], opened(A, B), TOPICS);
    return r.verdict === "accept" && r.draftWhyNow && r.topic === "online-safety";
  }],
  ["one check fails → watch list, no draft", () => {
    const r = finalisePanicResult(ai({ ...allPass, india: fail() }), [A, B], opened(A, B), TOPICS);
    return r.verdict === "watch" && r.draftWhyNow === null;
  }],
  ["AI says source passes but NO link opened → source forced to fail → watch", () => {
    const r = finalisePanicResult(ai(allPass), [A, B], opened(), TOPICS);
    return r.verdict === "watch" && !r.checks.source.pass && r.notes.length > 0;
  }],
  ["a link that wasn't opened is flagged and gets no note", () => {
    const r = finalisePanicResult(ai(allPass), [A, B], opened(A), TOPICS);
    return r.sources[1].opened === false && r.sources[1].note === undefined && r.notes.some((n) => n.includes("1 of 2"));
  }],
  ["link matching ignores https/www/trailing slash", () => {
    const r = finalisePanicResult(ai(allPass), [A], new Set([normUrl("http://ncrb.gov.in/report-2024")]), TOPICS);
    return r.sources[0].opened === true;
  }],
  ["draft with fear words is dropped", () => {
    const r = finalisePanicResult(ai(allPass, { draftWhyNow: "A dangerous new trend: 40% of teens (2025)." }), [A, B], opened(A, B), TOPICS);
    return r.verdict === "accept" && r.draftWhyNow === null && r.notes.some((n) => n.includes("writing rules"));
  }],
  ["draft without a number is dropped", () => {
    const r = finalisePanicResult(ai(allPass, { draftWhyNow: "Many teens see this online (NCRB)." }), [A, B], opened(A, B), TOPICS);
    return r.draftWhyNow === null;
  }],
  ["missing checks count as fails", () => {
    const r = finalisePanicResult(ai({ source: pass(), scale: pass() }), [A], opened(A), TOPICS);
    return r.verdict === "watch" && !r.checks.india.pass && !r.checks.action.pass;
  }],
  ["unknown topic becomes null", () => finalisePanicResult(ai(allPass, { topic: "politics" }), [A], opened(A), TOPICS).topic === null],
  ["garbage answer → null (shown as an error)", () => finalisePanicResult("not json", [A], opened(A), TOPICS) === null],
];

let ok = 0;
for (const [name, run] of cases) {
  const good = Boolean(run());
  if (good) ok++;
  console.log(`${good ? "PASS" : "FAIL"}  ${name}`);
}
console.log(`\n${ok} of ${cases.length} passed`);
process.exit(ok === cases.length ? 0 : 1);
