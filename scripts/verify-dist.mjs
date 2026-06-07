import { existsSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const distDir = resolve(root, "dist");
const indexFile = resolve(distDir, "index.html");

const list = (path) => {
  if (!existsSync(path)) return "(missing)";
  return readdirSync(path).map((name) => {
    const fullPath = resolve(path, name);
    return statSync(fullPath).isDirectory() ? `${name}/` : name;
  }).join(", ");
};

console.log(`[verify-dist] cwd: ${root}`);
console.log(`[verify-dist] root files: ${list(root)}`);
console.log(`[verify-dist] dist files: ${list(distDir)}`);

if (!existsSync(indexFile)) {
  console.error("[verify-dist] Missing dist/index.html after build.");
  process.exit(1);
}

console.log("[verify-dist] Found dist/index.html.");
