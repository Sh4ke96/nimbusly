import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const result = spawnSync(
  "npx",
  [
    "dotenv",
    "-e",
    ".env.local",
    "--",
    "supabase",
    "gen",
    "types",
    "typescript",
    "--project-id",
    "mxjbextvckzjfkzzpvin",
  ],
  { cwd: root, encoding: "utf8", shell: true }
);

if (result.status !== 0) {
  process.stderr.write(result.stderr ?? "");
  process.exit(result.status ?? 1);
}

writeFileSync(join(root, "lib", "supabase", "database.types.ts"), result.stdout, "utf8");
