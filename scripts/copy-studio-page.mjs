import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const src = path.join(root, "app", "page.jsx");
const dir = path.join(root, "app", "studio");
const dest = path.join(dir, "page.jsx");

fs.mkdirSync(dir, { recursive: true });
fs.copyFileSync(src, dest);
console.log("copied", dest, fs.statSync(dest).size);
