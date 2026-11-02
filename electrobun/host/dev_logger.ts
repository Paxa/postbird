import * as fs from "fs";
import * as path from "path";

const LOG_FILE = path.resolve(process.cwd(), ".postbird-dev-errors.log");
const MAX_LOG_SIZE = 2 * 1024 * 1024; // 2 MB

export function writeDevErrorLog(entry: {
  type: string;
  message: string;
  stack?: string;
  detail?: string;
  timestamp?: string;
}) {
  try {
    const time = entry.timestamp || new Date().toISOString();
    let text = `[${time}] [${entry.type}] ${entry.message}\n`;
    if (entry.detail) {
      text += `  Detail: ${entry.detail}\n`;
    }
    if (entry.stack) {
      text += `  Stack:\n${entry.stack.split("\n").map(l => "    " + l).join("\n")}\n`;
    }
    text += `---\n`;

    // Rotate if larger than MAX_LOG_SIZE
    if (fs.existsSync(LOG_FILE)) {
      const stat = fs.statSync(LOG_FILE);
      if (stat.size > MAX_LOG_SIZE) {
        const content = fs.readFileSync(LOG_FILE, "utf8");
        fs.writeFileSync(LOG_FILE, content.slice(content.length - 500 * 1024) + text);
        return;
      }
    }

    fs.appendFileSync(LOG_FILE, text, "utf8");
  } catch (err) {
    console.error("[DevLogger] Failed to write to log file:", err);
  }
}
