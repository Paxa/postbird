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
    const connection = await conn.establish();

    const targetHost = options.host || "127.0.0.1";
    const targetPort = Number(options.port || 5432);

    let localPort = 0;
    const server = net.createServer((socket) => {
      socket.on("error", (err) => {
        console.warn("[SSH Tunnel Socket Error]", err.message);
      });

      connection.forwardOut("127.0.0.1", localPort, targetHost, targetPort, (err: any, stream: any) => {
        if (err) {
          console.error(`[SSH Tunnel] Failed to forward to ${targetHost}:${targetPort}:`, err.message || err);
          socket.destroy(new Error(`SSH forward to ${targetHost}:${targetPort} failed: ${err.message || err}`));
          return;
        }

        stream.on("error", (streamErr: any) => {
          console.warn("[SSH Tunnel Stream Error]", streamErr.message);
          socket.destroy(streamErr);
        });

        socket.pipe(stream).pipe(socket);
      });
    });

    await new Promise<void>((resolve, reject) => {
      server.listen(0, "127.0.0.1", () => resolve());
      server.on("error", reject);
    });

    localPort = (server.address() as any).port;

    activeTunnels.set(tunnelId, { conn, server });
    console.log(`[SSH Tunnel] Created tunnel ${tunnelId} on 127.0.0.1:${localPort} -> ${options.ssh_host} -> ${targetHost}:${targetPort}`);
    return { tunnelId, host: "127.0.0.1", port: localPort };
  } catch (err: any) {
    console.error("[SSH Tunnel Error]", err);
    return { tunnelId: "", host: "", port: 0, error: err.message || String(err) };
  }
}

export async function closeSshTunnel(tunnelId: string): Promise<{ success: boolean }> {
  const tunnel = activeTunnels.get(tunnelId);
  if (tunnel) {
    try {
      if (tunnel.server) tunnel.server.close();
      if (tunnel.conn) tunnel.conn.shutdown();
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
      if (tunnel.server) tunnel.server.close();
      if (tunnel.conn) tunnel.conn.shutdown();
    } catch (e) {
      console.warn(`[SSH Tunnel] Warning closing tunnel ${id}:`, e);
    }
  }
  activeTunnels.clear();
}
