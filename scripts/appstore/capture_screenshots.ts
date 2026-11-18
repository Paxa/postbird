// Usage: bun scripts/appstore/capture_screenshots.ts
// Requires local PostgreSQL seeded with scripts/appstore/seed_demo_db.sql and Screen Recording permission.
import { mkdirSync } from "fs";
import { join } from "path";

const root = join(import.meta.dir, "..", "..");
const outDir = join(root, "build", "appstore", "screenshots", "captures");
mkdirSync(outDir, { recursive: true });

const sh = async (cmd: string[]) => {
  const p = Bun.spawn(cmd, { stdout: "pipe", stderr: "pipe", cwd: root });
  const out = (await new Response(p.stdout).text()).trim();
  await p.exited;
  return { code: p.exitCode, out };
};

async function descendants(pid: number): Promise<number[]> {
  const { out } = await sh(["pgrep", "-P", String(pid)]);
  const kids = out.split("\n").filter(Boolean).map(Number);
  const nested = await Promise.all(kids.map(descendants));
  return [pid, ...nested.flat()];
}

async function windowId(rootPid: number): Promise<string | null> {
  const named = (await sh(["pgrep", "-f", "Postbird-dev\\.app"])).out.split("\n").filter(Boolean).map(Number);
  const pids = [...new Set([...(await descendants(rootPid)), ...named])];
  const { code, out } = await sh(["swift", join(root, "scripts", "appstore", "window_id.swift"), ...pids.map(String)]);
  return code === 0 && out ? out : null;
}

const app = Bun.spawn(["bunx", "electrobun", "run"], {
  cwd: root,
  env: { ...process.env, POSTBIRD_SCREENSHOT_TOUR: "true" },
  stdout: "pipe",
  stderr: "inherit",
});

let failed = false;
const decoder = new TextDecoder();
let buffer = "";
for await (const chunk of app.stdout) {
  buffer += decoder.decode(chunk);
  let nl;
  while ((nl = buffer.indexOf("\n")) >= 0) {
    const line = buffer.slice(0, nl);
    buffer = buffer.slice(nl + 1);
    if (process.env.TOUR_VERBOSE || line.includes("[screenshot]") || line.includes("Error")) console.log(line);
    const m = line.match(/\[screenshot\] (ready (\S+)|done|failed)/);
    if (!m) continue;
    if (m[1] === "done") { app.kill(); process.exit(failed ? 1 : 0); }
    if (m[1] === "failed") { app.kill(); process.exit(1); }
    const slug = m[2];
    const id = await windowId(app.pid);
    if (!id) { console.error(`no window found for ${slug}`); failed = true; continue; }
    const file = join(outDir, `${slug}.png`);
    const r = await sh(["screencapture", "-o", "-l", id, file]);
    console.log(r.code === 0 ? `captured ${slug} (window ${id})` : `screencapture failed for ${slug}`);
  }
}
await app.exited;
process.exit(failed ? 1 : 0);
