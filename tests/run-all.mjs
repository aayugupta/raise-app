// Run: npm test
// Runs every test file and fails if any test fails or crashes.
import { readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const dir = new URL(".", import.meta.url);
const files = readdirSync(dir).filter((f) => f.endsWith(".test.mjs")).sort();
let failed = 0;

for (const file of files) {
  const run = spawnSync(process.execPath, ["--no-warnings", fileURLToPath(new URL(file, dir))], { encoding: "utf8" });
  const summary = (run.stdout.trim().split("\n").pop() ?? "").trim();
  const ok = run.status === 0;
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${file.padEnd(28)} ${summary}`);
  if (!ok) console.log((run.stdout + run.stderr).split("\n").filter((l) => /FAIL|Error/.test(l)).slice(0, 10).map((l) => "      " + l).join("\n"));
}

console.log(`\n${files.length - failed} of ${files.length} test files passed`);
process.exit(failed ? 1 : 0);
