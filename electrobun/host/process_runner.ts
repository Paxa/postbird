import { spawn, spawnSync } from "child_process";
import * as path from "path";
import * as fs from "fs";
import * as os from "os";
import * as readline from "readline";

const quarantineClearedBins = new Set<string>();
const runningProcesses = new Map<string, ReturnType<typeof spawn>>();

export function killProcess(streamId: string): boolean {
  const proc = runningProcesses.get(streamId);
  if (!proc) return false;
  runningProcesses.delete(streamId);
  try {
    proc.kill("SIGTERM");
    return true;
  } catch {
    return false;
  }
}

function headerHasTransactionTimeout(filePath: string): boolean {
  let fd: number | null = null;
  try {
    fd = fs.openSync(filePath, "r");
    const buf = Buffer.alloc(65536);
    const bytesRead = fs.readSync(fd, buf, 0, buf.length, 0);
    const head = buf.toString("utf8", 0, bytesRead);
    return /SET\s+transaction_timeout\s*=/i.test(head);
  } catch {
    return false;
  } finally {
    if (fd !== null) {
      try { fs.closeSync(fd); } catch {}
    }
  }
}

async function streamPatchTransactionTimeout(srcPath: string, destPath: string): Promise<boolean> {
  if (!headerHasTransactionTimeout(srcPath)) {
    return false;
  }
  await new Promise<void>((resolve, reject) => {
    const input = fs.createReadStream(srcPath, { encoding: "utf8" });
    const output = fs.createWriteStream(destPath, { encoding: "utf8" });
    const rl = readline.createInterface({ input, crlfDelay: Infinity });

    rl.on("line", (line) => {
      const patched = line.replace(
        /^(SET\s+transaction_timeout\s*=\s*[^;]+;?)/i,
        "-- $1 (skipped for cross-version compatibility)"
      );
      output.write(patched + "\n");
    });
    rl.on("close", () => output.end());
    output.on("finish", () => resolve());
    input.on("error", reject);
    output.on("error", reject);
  });
  return true;
}

function isBinaryDumpFormat(args: string[]): boolean {
  return args.some((a) =>
    a === "-Fc" || a === "-Ft" || a === "-Fd" ||
    /^--format=(c|custom|t|tar|d|directory)$/i.test(a)
  );
}

export async function spawnProcess(params: {
  bin: string;
  args?: string[];
  options?: any;
  streamId?: string;
  onStdoutChunk?: (chunk: string) => void;
  onStderrChunk?: (chunk: string) => void;
}): Promise<{ code: number; stdout: string; stderr: string; streamed?: boolean }> {
  const { bin, args = [], options, streamId, onStdoutChunk, onStderrChunk } = params;
  let resolvedBin = bin;

  if (!fs.existsSync(resolvedBin)) {
    const home = process.env.HOME || "";
    const candidateDirs = [
      path.join(home, ".local", "bin"),
      "/opt/homebrew/bin",
      "/usr/local/bin",
      path.join(home, ".bun", "bin"),
    ];

    for (const cDir of candidateDirs) {
      const fullCand = path.join(cDir, bin);
      if (fs.existsSync(fullCand)) {
        resolvedBin = fullCand;
        break;
      }
    }
  }

  if (!fs.existsSync(resolvedBin)) {
    const appVendorBin = path.resolve(__dirname, "..", "..", bin);
    const platformVendorBin = path.resolve(__dirname, "..", "..", "vendor", process.platform, path.basename(bin));
    const cwdVendorBin = path.resolve(process.cwd(), bin);
    const cwdPlatformVendorBin = path.resolve(process.cwd(), "vendor", process.platform, path.basename(bin));
    const pgAppBin = `/Applications/Postgres.app/Contents/Versions/latest/bin/${path.basename(bin)}`;

    if (fs.existsSync(appVendorBin)) {
      resolvedBin = appVendorBin;
    } else if (fs.existsSync(platformVendorBin)) {
      resolvedBin = platformVendorBin;
    } else if (fs.existsSync(cwdVendorBin)) {
      resolvedBin = cwdVendorBin;
    } else if (fs.existsSync(cwdPlatformVendorBin)) {
      resolvedBin = cwdPlatformVendorBin;
    } else if (fs.existsSync(pgAppBin)) {
      resolvedBin = pgAppBin;
    } else {
      resolvedBin = path.basename(bin);
    }
  }

  if (process.platform === "darwin" && fs.existsSync(resolvedBin) && !quarantineClearedBins.has(resolvedBin)) {
    quarantineClearedBins.add(resolvedBin);
    try {
      spawnSync("xattr", ["-d", "com.apple.quarantine", resolvedBin]);
    } catch (e) {
      // ignore quarantine strip failure
    }
  }

  const actualArgs = [...args];
  let tempCompatFile: string | null = null;
  let exportFilePath: string | null = null;
  const baseBin = path.basename(resolvedBin);

  // 1. Cross-version PostgreSQL dump compatibility for psql imports (streaming)
  if (baseBin === "psql" || baseBin.startsWith("psql")) {
    const fileArgIdx = actualArgs.findIndex((a) => a.startsWith("--file=") || a === "-f");
    if (fileArgIdx !== -1) {
      let filePath = "";
      let isFlagValue = false;
      if (actualArgs[fileArgIdx].startsWith("--file=")) {
        filePath = actualArgs[fileArgIdx].slice("--file=".length);
      } else if (fileArgIdx + 1 < actualArgs.length) {
        filePath = actualArgs[fileArgIdx + 1];
        isFlagValue = true;
      }

      if (filePath && fs.existsSync(filePath)) {
        try {
          const candidateTemp = path.join(
            os.tmpdir(),
            `postbird-compat-${Date.now()}-${path.basename(filePath)}`
          );
          const didPatch = await streamPatchTransactionTimeout(filePath, candidateTemp);
          if (didPatch) {
            tempCompatFile = candidateTemp;
            if (isFlagValue) {
              actualArgs[fileArgIdx + 1] = tempCompatFile;
            } else {
              actualArgs[fileArgIdx] = `--file=${tempCompatFile}`;
            }
          }
        } catch (err) {
          console.warn("[Process Runner] Could not sanitize psql input file:", err);
        }
      }
    }
  } else if ((baseBin === "pg_dump" || baseBin.startsWith("pg_dump")) && !isBinaryDumpFormat(actualArgs)) {
    const fileArgIdx = actualArgs.findIndex((a) => a.startsWith("--file=") || a === "-f");
    if (fileArgIdx !== -1) {
      if (actualArgs[fileArgIdx].startsWith("--file=")) {
        exportFilePath = actualArgs[fileArgIdx].slice("--file=".length);
      } else if (fileArgIdx + 1 < actualArgs.length) {
        exportFilePath = actualArgs[fileArgIdx + 1];
      }
    }
  }

  return new Promise((resolve) => {
    let stdout = "";
    let stderr = "";
    const home = process.env.HOME || "";
    const extraPaths = [
      path.join(home, ".local", "bin"),
      "/opt/homebrew/bin",
      "/usr/local/bin",
      path.join(home, ".bun", "bin"),
    ];
    const currentPath = (options?.env?.PATH || process.env.PATH || "");
    const augmentedPath = [...extraPaths, currentPath].filter(Boolean).join(":");

    const cleanupTempFile = () => {
      if (tempCompatFile && fs.existsSync(tempCompatFile)) {
        try {
          fs.unlinkSync(tempCompatFile);
        } catch {
          // ignore cleanup error
        }
        tempCompatFile = null;
      }
    };

    try {
      const proc = spawn(resolvedBin, actualArgs, {
        cwd: options?.cwd || process.cwd(),
        env: {
          ...process.env,
          ...(options?.env || {}),
          PATH: augmentedPath,
        },
      });

      if (streamId) {
        runningProcesses.set(streamId, proc);
      }

      if (options?.input) {
        proc.stdin?.write(options.input);
      }
      proc.stdin?.end();

      const isStreaming = Boolean(onStdoutChunk || onStderrChunk);
      proc.stdout?.on("data", (d: any) => {
        const text = d.toString();
        if (onStdoutChunk) {
          onStdoutChunk(text);
        } else {
          stdout += text;
        }
      });
      proc.stderr?.on("data", (d: any) => {
        const text = d.toString();
        if (onStderrChunk) {
          onStderrChunk(text);
        } else {
          stderr += text;
        }
      });
      proc.on("close", async (code: any) => {
        if (streamId) runningProcesses.delete(streamId);
        cleanupTempFile();

        // 2. Post-process pg_dump output to make future imports backward-compatible (streaming)
        if (exportFilePath && code === 0 && fs.existsSync(exportFilePath)) {
          const tempOut = `${exportFilePath}.postbird-tmp-${Date.now()}`;
          try {
            const didPatch = await streamPatchTransactionTimeout(exportFilePath, tempOut);
            if (didPatch) {
              fs.renameSync(tempOut, exportFilePath);
            }
          } catch (err) {
            console.warn("[Process Runner] Could not patch pg_dump output file:", err);
            try { if (fs.existsSync(tempOut)) fs.unlinkSync(tempOut); } catch {}
          }
        }

        resolve({ code: code ?? 0, stdout, stderr, ...(isStreaming ? { streamed: true } : {}) });
      });
      proc.on("error", (err: any) => {
        if (streamId) runningProcesses.delete(streamId);
        cleanupTempFile();
        resolve({ code: 1, stdout, stderr: err.message || String(err), ...(isStreaming ? { streamed: true } : {}) });
      });
    } catch (err: any) {
      cleanupTempFile();
      resolve({ code: 1, stdout, stderr: err.message || String(err) });
    }
  });
}
