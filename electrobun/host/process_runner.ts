import { spawn, spawnSync } from "child_process";
import * as path from "path";
import * as fs from "fs";

export async function spawnProcess(params: {
  bin: string;
  args?: string[];
  options?: any;
}): Promise<{ code: number; stdout: string; stderr: string }> {
  const { bin, args = [], options } = params;
  let resolvedBin = bin;

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
    try {
      const proc = spawn(resolvedBin, args, {
        cwd: options?.cwd || process.cwd(),
        env: { ...process.env, ...(options?.env || {}) },
      });
      proc.stdout?.on("data", (d: any) => {
        stdout += d.toString();
      });
      proc.stderr?.on("data", (d: any) => {
        stderr += d.toString();
      });
      proc.on("close", (code: any) => {
        resolve({ code: code ?? 0, stdout, stderr });
      });
      proc.on("error", (err: any) => {
        resolve({ code: 1, stdout, stderr: err.message || String(err) });
      });
    } catch (err: any) {
      resolve({ code: 1, stdout, stderr: err.message || String(err) });
    }
  });
}
