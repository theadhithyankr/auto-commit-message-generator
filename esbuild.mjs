import esbuild from "esbuild";
import { rm } from "node:fs/promises";

const production = process.argv.includes("--production");

await rm("out", { recursive: true, force: true });

await esbuild.build({
  entryPoints: ["src/extension.ts"],
  bundle: true,
  platform: "node",
  format: "cjs",
  target: "node18",
  outfile: "out/extension.js",
  external: ["vscode"],
  sourcemap: !production,
  minify: production,
  logLevel: "info",
});
