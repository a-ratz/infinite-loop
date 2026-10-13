// Copies dist/index.html into one folder per client route, so a static host
// such as GitHub Pages answers deep links with 200 instead of its 404 page.
// Usage: node scripts/static-routes.mjs [dist]
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const dist = process.argv[2] ?? "dist";
const read = (file) => readFileSync(file, "utf8");
const slugs = (file) => [...read(file).matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);
const redirectBlock = read("src/posts/registry.js").match(/export const redirects = \{([^}]*)\}/);
const redirects = redirectBlock
  ? [...redirectBlock[1].matchAll(/["']?([\w-]+)["']?\s*:/g)].map((m) => m[1])
  : [];

const routes = [
  "about",
  "impressum",
  ...slugs("src/posts/registry.js"),
  ...redirects,
  ...slugs("src/portfolio/registry.js").map((slug) => `portfolio/${slug}`),
];

for (const route of routes) {
  mkdirSync(join(dist, route), { recursive: true });
  copyFileSync(join(dist, "index.html"), join(dist, route, "index.html"));
}
copyFileSync(join(dist, "index.html"), join(dist, "404.html"));
writeFileSync(join(dist, ".nojekyll"), "");
console.log(`static routes: ${routes.join(", ")}`);
