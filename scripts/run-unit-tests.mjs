import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

function collectTestFiles(directory) {
  const files = [];
  for (const entry of readdirSync(directory)) {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) {
      files.push(...collectTestFiles(path));
      continue;
    }
    if (entry.endsWith(".test.ts")) {
      files.push(path);
    }
  }
  return files;
}

const tests = collectTestFiles("tests/unit").sort();
if (tests.length === 0) {
  console.error("No unit test files found under tests/unit/");
  process.exit(1);
}

const result = spawnSync(
  process.execPath,
  ["--import", "tsx", "--test", ...tests],
  { stdio: "inherit" }
);

process.exit(result.status ?? 1);
