import * as net from "net";
import * as os from "os";
import * as path from "path";
import * as fs from "fs";

const activeTunnels = new Map<string, any>();

export async function createSshTunnel(options: any): Promise<{ tunnelId: string; host: string; port: number; error?: string }> {
  const tunnelId = `tunnel_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  try {
    const modName = ["node", "ssh", "forward"].join("-");
    const { SSHConnection } = import.meta.require(modName);
    const sshConfig: Record<string, any> = {};
    const configPath = path.join(os.homedir(), ".ssh", "config");
    if (fs.existsSync(configPath)) {
      try {
        const sshCfgMod = ["ssh", "config"].join("-");
        const SshConfig = import.meta.require(sshCfgMod);
        const parsed = SshConfig.parse(fs.readFileSync(configPath, "utf8"));
        parsed.forEach((host: any) => {
          if (host.param === "Host") {
            const key = Array.isArray(host.value) ? host.value[0] : host.value;
            sshConfig[key] = {};
            (host.config || []).forEach((param: any) => {
              if (param.param) sshConfig[key][param.param] = param.value;
            });
          }
        });
      } catch (e) {
        console.warn("[SSH Config] Could not parse ~/.ssh/config:", e);
      }
    }

    const configFileValues = sshConfig[options.ssh_host] || {};
    const sshOptions: any = {
      endHost: configFileValues.HostName || options.ssh_host,
      username: configFileValues.User || options.ssh_user,
      password: options.ssh_pass,
      privateKey: configFileValues.IdentityFile || options.ssh_key,
      endPort: Number(configFileValues.Port || options.ssh_port || 22),
      noReadline: true,
      readyTimeout: 10000,
    };

    const conn = new SSHConnection(sshOptions);
    const freePort = await new Promise<number>((res) => {
      const s = net.createServer().listen(0, "127.0.0.1", () => {
        const p = (s.address() as any).port;
        s.close(() => res(p));
      });
    });

    await conn.forward({
      fromPort: freePort,
      toPort: Number(options.port || 5432),
      toHost: options.host || "127.0.0.1",
    });

    activeTunnels.set(tunnelId, conn);
    console.log(`[SSH Tunnel] Created tunnel ${tunnelId} on local port ${freePort} -> ${options.ssh_host}`);
    return { tunnelId, host: "127.0.0.1", port: freePort };
  } catch (err: any) {
    console.error("[SSH Tunnel Error]", err);
    return { tunnelId: "", host: "", port: 0, error: err.message || String(err) };
  }
}

export async function closeSshTunnel(tunnelId: string): Promise<{ success: boolean }> {
  const conn = activeTunnels.get(tunnelId);
  if (conn) {
    try {
      conn.shutdown();
    } catch (e) {
      console.warn(`[SSH Tunnel] Warning shutting down tunnel ${tunnelId}:`, e);
    }
    activeTunnels.delete(tunnelId);
    console.log(`[SSH Tunnel] Closed tunnel ${tunnelId}`);
  }
  return { success: true };
}

export async function closeAllTunnels(): Promise<void> {
  for (const [id, tunnel] of activeTunnels.entries()) {
    try {
      console.log(`[Graceful Shutdown] Ending SSH tunnel: ${id}`);
      tunnel.shutdown();
    } catch (e) {
      console.warn(`[SSH Tunnel] Warning closing tunnel ${id}:`, e);
    }
  }
  activeTunnels.clear();
}
