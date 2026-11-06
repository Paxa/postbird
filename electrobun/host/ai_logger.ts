import * as fs from "fs";
import * as path from "path";

const LOG_FILE = path.resolve(process.cwd(), ".postbird-ai.log");
const MAX_LOG_SIZE = 2 * 1024 * 1024; // 2 MB

export interface AiLogPayload {
  level: "info" | "warn" | "error" | "debug";
  message: string;
  detail?: string;
  timestamp?: string;
}

export function writeAiLog(entry: AiLogPayload) {
  try {
    const time = entry.timestamp || new Date().toISOString();
    const lvl = entry.level.toUpperCase();
    const line = `[${time}] [${lvl}] ${entry.message}${entry.detail ? ` | ${entry.detail}` : ""}\n`;

    // In dev mode or terminal runs, print to stdout / stderr
    const isDev = process.env.NODE_ENV !== "production";
    if (isDev) {
      if (entry.level === "error") {
        console.error(`[AI ERROR] ${entry.message}${entry.detail ? ` (${entry.detail})` : ""}`);
      } else if (entry.level === "warn") {
        console.warn(`[AI WARN] ${entry.message}${entry.detail ? ` (${entry.detail})` : ""}`);
      } else {
        console.log(`[AI ${lvl}] ${entry.message}${entry.detail ? ` (${entry.detail})` : ""}`);
      }
    }

    // Append to .postbird-ai.log with rotation
    if (fs.existsSync(LOG_FILE)) {
      const stat = fs.statSync(LOG_FILE);
      if (stat.size > MAX_LOG_SIZE) {
        const content = fs.readFileSync(LOG_FILE, "utf8");
        fs.writeFileSync(LOG_FILE, content.slice(content.length - 500 * 1024) + line);
        return;
      }
    }

    fs.appendFileSync(LOG_FILE, line, "utf8");
  } catch (err) {
    console.error("[AiLogger] Failed to write to .postbird-ai.log:", err);
  }
}
