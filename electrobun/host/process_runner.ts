import { spawn, spawnSync } from "child_process";
import * as path from "path";
import * as fs from "fs";
import * as os from "os";

export async function spawnProcess(params: {
  bin: string;
  args?: string[];
  options?: any;
}): Promise<{ code: number; stdout: string; stderr: string }> {
  const { bin, args = [], options } = params;
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

  if (process.platform === "darwin" && fs.existsSync(resolvedBin)) {
    try {
      spawnSync("xattr", ["-d", "com.apple.quarantine", resolvedBin]);
    } catch (e) {
      // ignore quarantine strip failure
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

    const actualArgs = [...args];
    let tempCompatFile: string | null = null;
    let exportFilePath: string | null = null;

    const baseBin = path.basename(resolvedBin);

    // 1. Cross-version PostgreSQL dump compatibility for psql imports
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
            const rawContent = fs.readFileSync(filePath, "utf8");
            if (/SET\s+transaction_timeout\s*=/i.test(rawContent)) {
              const sanitized = rawContent.replace(
                /^(SET\s+transaction_timeout\s*=\s*0\s*;?)/gim,
                "-- $1 (skipped for cross-version compatibility)"
              );
              tempCompatFile = path.join(
                os.tmpdir(),
                `postbird-compat-${Date.now()}-${path.basename(filePath)}`
              );
              fs.writeFileSync(tempCompatFile, sanitized, "utf8");

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
    } else if (baseBin === "pg_dump" || baseBin.startsWith("pg_dump")) {
      const fileArgIdx = actualArgs.findIndex((a) => a.startsWith("--file=") || a === "-f");
      if (fileArgIdx !== -1) {
        if (actualArgs[fileArgIdx].startsWith("--file=")) {
          exportFilePath = actualArgs[fileArgIdx].slice("--file=".length);
        } else if (fileArgIdx + 1 < actualArgs.length) {
          exportFilePath = actualArgs[fileArgIdx + 1];
        }
      }
    }

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

      if (options?.input) {
        proc.stdin?.write(options.input);
      }
      proc.stdin?.end();

      proc.stdout?.on("data", (d: any) => {
        stdout += d.toString();
      });
      proc.stderr?.on("data", (d: any) => {
        stderr += d.toString();
      });
      proc.on("close", (code: any) => {
        cleanupTempFile();

        // 2. Post-process pg_dump output to make future imports backward-compatible
        if (exportFilePath && code === 0 && fs.existsSync(exportFilePath)) {
          try {
            const raw = fs.readFileSync(exportFilePath, "utf8");
            if (/SET\s+transaction_timeout\s*=/i.test(raw)) {
              const patched = raw.replace(
                /^(SET\s+transaction_timeout\s*=\s*0\s*;?)/gim,
                "-- $1 (skipped for cross-version compatibility)"
              );
              fs.writeFileSync(exportFilePath, patched, "utf8");
            }
          } catch (err) {
            console.warn("[Process Runner] Could not patch pg_dump output file:", err);
          }
        }

        resolve({ code: code ?? 0, stdout, stderr });
      });
      proc.on("error", (err: any) => {
        cleanupTempFile();
        resolve({ code: 1, stdout, stderr: err.message || String(err) });
      });
    } catch (err: any) {
      cleanupTempFile();
      resolve({ code: 1, stdout, stderr: err.message || String(err) });
    }
  });
}
