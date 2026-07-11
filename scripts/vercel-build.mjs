import { nodeFileTrace } from "@vercel/nft";
import * as esbuild from "esbuild";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outputDir = path.join(root, ".vercel", "output");
const funcDir = path.join(outputDir, "functions", "index.func");
const bundlePath = path.join(funcDir, "index.cjs");

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(funcDir, { recursive: true });

const externalPackages = [
  "express",
  "cors",
  "cookie-parser",
  "bcryptjs",
  "jsonwebtoken",
  "pg",
  "stripe",
  "zod",
  "dotenv",
  "@prisma/client",
  "@prisma/adapter-pg",
  // http-status is intentionally NOT external: it's an ESM-only package and
  // leaving it as an external CJS require() causes a default-export interop
  // bug (httpStatus.INTERNAL_SERVER_ERROR resolves to undefined). Bundling
  // it inline lets esbuild resolve the real export correctly.
];

await esbuild.build({
  entryPoints: ["src/app.ts"],
  bundle: true,
  platform: "node",
  format: "cjs",
  target: "node20",
  outfile: bundlePath,
  external: externalPackages,
  define: {
    "import.meta.url": JSON.stringify("file:///var/task/index.cjs"),
  },
  footer: {
    js: "module.exports = module.exports.default || module.exports;",
  },
});

// Trace the actual require() graph of the bundle so every transitive
// dependency (including hoisted sub-dependencies like cookie-parser -> cookie)
// gets included, instead of guessing which packages to copy by hand.
const { fileList } = await nodeFileTrace([bundlePath], { base: root });

for (const relFile of fileList) {
  const src = path.join(root, relFile);
  if (path.resolve(src) === path.resolve(bundlePath)) continue;
  const dest = path.join(funcDir, relFile);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

fs.writeFileSync(
  path.join(funcDir, ".vc-config.json"),
  JSON.stringify(
    {
      runtime: "nodejs20.x",
      handler: "index.cjs",
      launcherType: "Nodejs",
    },
    null,
    2,
  ),
);

fs.writeFileSync(
  path.join(outputDir, "config.json"),
  JSON.stringify(
    {
      version: 3,
      routes: [{ src: "/(.*)", dest: "/index" }],
    },
    null,
    2,
  ),
);

console.log(`Build Output API structure written to .vercel/output (${fileList.size} traced files)`);
