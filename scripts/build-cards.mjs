// Reads content/base-talk-cards.md (the file Aayushi edits) and writes lib/base-cards.json
// for the app. Runs before `npm run dev` and `npm run build`.
// Stops with a clear message if any card is missing a part, so a broken card never ships.
import { readFileSync, writeFileSync } from "node:fs";

const SOURCE = new URL("../content/base-talk-cards.md", import.meta.url);
const OUTPUT = new URL("../lib/base-cards.json", import.meta.url);

const md = readFileSync(SOURCE, "utf8").replace(/\r\n/g, "\n");
const problems = [];

// Text after "**Label:**" up to the next label, divider or [note].
function section(block, label) {
  const lines = block.split("\n");
  const start = lines.findIndex((l) => l.startsWith(`**${label}`));
  if (start === -1) return null;
  const first = lines[start].replace(/^\*\*[^*]+\*\*\s*/, "");
  const rest = [];
  for (const line of lines.slice(start + 1)) {
    if (/^\*\*[^*]+:\*\*/.test(line) || line.startsWith("---") || line.startsWith("[")) break;
    rest.push(line);
  }
  return [first, ...rest].join("\n").trim();
}

// Removes the quote marks around a line, including `"quoted" (note)` lines.
const unquote = (s) => {
  const t = s.trim();
  const m = t.match(/^["“](.+?)["”](.*)$/);
  return (m ? m[1] + m[2] : t).trim();
};

// "1. text" or "- text" lines, without the marker or notes like "(the safety promise)".
function listItems(text) {
  return text
    .split("\n")
    .filter((l) => /^(\d+\.|-)\s/.test(l.trim()))
    .map((l) => l.trim().replace(/^(\d+\.|-)\s+/, "").replace(/\s*\(the safety promise\)\s*$/, ""))
    .map(unquote);
}

const blocks = md.split(/^## Card \d+ — /m).slice(1);
const cards = blocks.map((block) => {
  const name = block.split("\n")[0].trim();
  const need = (label) => {
    const value = section(block, label);
    if (!value) problems.push(`${name}: missing "${label}"`);
    return value ?? "";
  };

  const id = (need("Topic ID:").match(/`([^`]+)`/) ?? [])[1] ?? "";
  const teenQuestion = unquote(need("The teen's question"));

  const whyRaw = need("Why now:");
  const whySource = (whyRaw.match(/\*\((.+)\)\*\s*$/) ?? [])[1] ?? "";
  const whyNow = whyRaw.replace(/\*\(.+\)\*\s*$/, "").replace(/\s+/g, " ").trim();

  const firstLineText = need("First line:");
  const firstLine = {};
  for (const lang of ["Hinglish", "Hindi", "English"]) {
    const m = firstLineText.match(new RegExp(`^- ${lang}:\\s*(.+)$`, "m"));
    if (m) firstLine[lang.toLowerCase()] = unquote(m[1]);
    else problems.push(`${name}: missing ${lang} first line`);
  }

  const followUps = listItems(need("Gentle questions to ask (10):"));
  const say = listItems(need("Say:"));
  const avoid = listItems(need("Avoid:"));
  if (followUps.length !== 10) problems.push(`${name}: needs exactly 10 gentle questions (found ${followUps.length})`);
  if (say.length !== 3) problems.push(`${name}: needs exactly 3 "Say" lines (found ${say.length})`);
  if (avoid.length !== 6) problems.push(`${name}: needs exactly 6 "Avoid" lines (found ${avoid.length})`);

  const reactText = need("If they react:");
  const react = {};
  for (const [key, label] of [
    ["quiet", "Go quiet"],
    ["upset", "Get upset"],
    ["disagree", "Disagree"],
    ["noTalk", "Don't want to talk"],
  ]) {
    const m = reactText.match(new RegExp(`^- \\*\\*${label}:\\*\\*\\s*(.+)$`, "m"));
    if (m) react[key] = unquote(m[1]);
    else problems.push(`${name}: missing "If they react → ${label}"`);
  }

  const getHelp = need("When to get help:").replace(/\s+/g, " ");
  const sourcesRaw = need("Sources and check date:");
  const checkedOn = (sourcesRaw.match(/Checked on (.+)$/) ?? [])[1]?.trim() ?? "";
  if (!checkedOn) problems.push(`${name}: missing "Checked on [date]"`);
  const sources = sourcesRaw.replace(/·?\s*Checked on .+$/, "").trim().replace(/\s*·\s*$/, "");

  return { id, name, teenQuestion, whyNow, whySource, firstLine, followUps, say, avoid, react, getHelp, sources, checkedOn };
});

const safetyPromise = unquote((md.match(/^\*\*Safety promise:\*\*\s*(.+)$/m) ?? [])[1] ?? "");
if (!safetyPromise) problems.push(`missing the fixed "Safety promise" line`);
if (cards.length !== 6) problems.push(`expected 6 cards, found ${cards.length}`);

if (problems.length) {
  console.error("\nBase Talk Cards have problems. Fix content/base-talk-cards.md:\n");
  for (const p of problems) console.error("  • " + p);
  console.error("");
  process.exit(1);
}

writeFileSync(OUTPUT, JSON.stringify({ safetyPromise, cards }, null, 2) + "\n");
console.log(`Base Talk Cards: ${cards.length} cards ready.`);
