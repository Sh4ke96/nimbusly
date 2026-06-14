import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const TEST_ROOTS = ["tests/unit", "tests/integration", "tests/component"];

function collectTestFiles(directory) {
  const files = [];
  for (const entry of readdirSync(directory)) {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) {
      files.push(...collectTestFiles(path));
      continue;
    }
    if (entry.endsWith(".test.ts") || entry.endsWith(".test.tsx")) {
      if (entry.endsWith(".setup.ts")) continue;
      files.push(path);
    }
  }
  return files;
}

const tests = TEST_ROOTS.flatMap((root) => collectTestFiles(root)).sort();
if (tests.length === 0) {
  console.error("No test files found under tests/");
  process.exit(1);
}

const result = spawnSync(
  process.execPath,
  ["--import", "tsx", "--test", ...tests],
  { stdio: "inherit" }
);

process.exit(result.status ?? 1);
