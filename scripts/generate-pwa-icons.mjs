import sharp from "sharp";
import { join } from "node:path";

const source = join(process.cwd(), "public", "pwa-icon.svg");
const outputs = [
  { path: "public/apple-touch-icon.png", size: 180 },
  { path: "public/pwa-icon-192.png", size: 192 },
  { path: "public/pwa-icon-512.png", size: 512 },
] as const;

for (const output of outputs) {
  await sharp(source)
    .resize(output.size, output.size)
    .png()
    .toFile(join(process.cwd(), output.path));
  console.log(`Wrote ${output.path}`);
}
