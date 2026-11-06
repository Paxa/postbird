export function sanitizePostgresUrl(input: string): string {
  if (!input || typeof input !== "string") return input;
  input = input.trim();
  const schemeMatch = input.match(/^([a-zA-Z][a-zA-Z0-9+.-]*:\/\/)(.*)$/);
  if (!schemeMatch) return input;
  const scheme = schemeMatch[1];
  const rest = schemeMatch[2];

  const lastAt = rest.lastIndexOf("@");
  if (lastAt >= 0) {
    const userInfo = rest.slice(0, lastAt);
    const hostAndBeyond = rest.slice(lastAt + 1);

    const colonIdx = userInfo.indexOf(":");
    let user = colonIdx >= 0 ? userInfo.slice(0, colonIdx) : userInfo;
    let pass = colonIdx >= 0 ? userInfo.slice(colonIdx + 1) : null;

    const safeEncode = (str: string) => {
      try {
        str = decodeURIComponent(str);
      } catch (e) {}
      return encodeURIComponent(str);
    };

    const encodedUser = safeEncode(user);
    const encodedPass = pass !== null ? ":" + safeEncode(pass) : "";
    return `${scheme}${encodedUser}${encodedPass}@${hostAndBeyond}`;
  }
  return input;
}

export function parseConnectionString(postgresUrl: string): any {
  const sanitized = sanitizePostgresUrl(postgresUrl);
  const m = sanitized.match(/^([a-zA-Z][a-zA-Z0-9+.-]*:\/\/)?(.*)$/);
  const rest = m ? m[2] : sanitized;

  const qIdx = rest.indexOf("?");
  const pathAndAuth = qIdx >= 0 ? rest.slice(0, qIdx) : rest;
  const queryStr = qIdx >= 0 ? rest.slice(qIdx + 1) : "";

  const searchParams = new URLSearchParams(queryStr);
  const params: Record<string, any> = { application_name: "Postbird.app" };
  for (const [k, v] of searchParams.entries()) {
    params[k] = v;
  }

  const lastAt = pathAndAuth.lastIndexOf("@");
  let auth = "";
  let hostAndPath = pathAndAuth;
  if (lastAt >= 0) {
    auth = pathAndAuth.slice(0, lastAt);
    hostAndPath = pathAndAuth.slice(lastAt + 1);
  }

  let user: string | undefined = undefined;
  let password: string | undefined = undefined;
  if (auth) {
    const cIdx = auth.indexOf(":");
    user = cIdx >= 0 ? decodeURIComponent(auth.slice(0, cIdx)) : decodeURIComponent(auth);
    password = cIdx >= 0 ? decodeURIComponent(auth.slice(cIdx + 1)) : undefined;
  }

  const slashIdx = hostAndPath.indexOf("/");
  let hostPart = slashIdx >= 0 ? hostAndPath.slice(0, slashIdx) : hostAndPath;
  let pathPart = slashIdx >= 0 ? hostAndPath.slice(slashIdx + 1) : "";

  let host: string | undefined = undefined;
  let port: number | string | undefined = undefined;
  if (hostPart) {
    const colonIdx = hostPart.lastIndexOf(":");
    if (colonIdx >= 0) {
      host = decodeURIComponent(hostPart.slice(0, colonIdx));
      const p = parseInt(hostPart.slice(colonIdx + 1), 10);
      if (!isNaN(p)) port = p;
    } else {
      host = decodeURIComponent(hostPart);
    }
  }

  let database = pathPart ? decodeURIComponent(pathPart.split("/")[0]) : undefined;
  if (!database && pathPart === "") database = undefined;

  const res: any = Object.assign({}, params, {
    host,
    port: port || (params && params.socketPort) || 5432,
    database,
    user,
    password,
  });

  if (params) {
    if ("sslmode" in params) {
      const mode = String(params.sslmode).toLowerCase();
      if (mode === "disable") {
        res.ssl = false;
      } else if (mode === "verify-full" || mode === "verify-ca") {
        res.ssl = { rejectUnauthorized: true };
      } else if (mode === "require" || mode === "prefer" || mode === "no-verify") {
        const rejectUnauth = "rejectUnauthorized" in params
          ? (params.rejectUnauthorized !== "false" && params.rejectUnauthorized !== false)
          : false;
        res.ssl = { rejectUnauthorized: rejectUnauth };
      }
    }

    if ("ssl" in params) {
      if (params.ssl === "false" || params.ssl === "0" || params.ssl === false) {
        res.ssl = false;
      } else {
        res.ssl = Boolean(params.ssl);
      }
    }

    if ("rejectUnauthorized" in params && res.ssl) {
      res.ssl = {
        rejectUnauthorized: params.rejectUnauthorized == "false" ? false : Boolean(params.rejectUnauthorized)
      };
    }

    if ("read_only" in params || "readonly" in params) {
      const ro = params.read_only ?? params.readonly;
      res.read_only = ro !== "false" && ro !== "0" && ro !== false;
    } else if (params.options && String(params.options).includes("default_transaction_read_only=on")) {
      res.read_only = true;
    }

    delete res.socketPort;
  }

  return res;
}

export function generateConnectionString(options: any): string {
  if (options.port == undefined) options.port = "5432";
  if (options.host == undefined) options.host = "localhost";
  if (!options.database) options.database = "template1";

  const port = String(options.port);
  const host = options.host;
  const database = options.database;

  let hostStr = "";
  let socketPort: string | null = null;
  if (host.startsWith("/")) {
    hostStr = encodeURIComponent(host);
    if (port !== "5432") {
      socketPort = port;
    }
  } else {
    hostStr = `${host}${port ? ":" + port : ""}`;
  }

  let authStr = "";
  if (options.user) {
    authStr = encodeURIComponent(options.user);
    if (options.password) {
      authStr += ":" + encodeURIComponent(options.password);
    }
    authStr += "@";
  }

  const queryParams: string[] = [];
  if (socketPort) {
    queryParams.push(`socketPort=${socketPort}`);
  }
  if (options.ssl) {
    queryParams.push("ssl=true");
  }
  if (options.sslmode) {
    queryParams.push(`sslmode=${encodeURIComponent(options.sslmode)}`);
  }
  if ("rejectUnauthorized" in options) {
    queryParams.push(`rejectUnauthorized=${options.rejectUnauthorized}`);
  }
  if (options.ssh_host) {
    queryParams.push(`ssh_host=${encodeURIComponent(options.ssh_host)}`);
  }
  if (options.ssh_port) {
    queryParams.push(`ssh_port=${encodeURIComponent(String(options.ssh_port))}`);
  }
  if (options.ssh_user) {
    queryParams.push(`ssh_user=${encodeURIComponent(options.ssh_user)}`);
  }
  if (options.ssh_pass) {
    queryParams.push(`ssh_pass=${encodeURIComponent(options.ssh_pass)}`);
  }
  if (options.ssh_key) {
    queryParams.push(`ssh_key=${encodeURIComponent(options.ssh_key)}`);
  }
  if (options.options) {
    if (options.read_only || options.readOnly) {
      if (!options.options.includes("default_transaction_read_only")) {
        queryParams.push(`options=${encodeURIComponent(options.options + " -c default_transaction_read_only=on")}`);
      } else {
        queryParams.push(`options=${encodeURIComponent(options.options)}`);
      }
    } else {
      queryParams.push(`options=${encodeURIComponent(options.options)}`);
    }
  } else if (options.read_only || options.readOnly) {
    queryParams.push("options=-c%20default_transaction_read_only%3Don");
  }
  if (options.read_only || options.readOnly) {
    queryParams.push("read_only=true");
  }

  const queryStr = queryParams.length ? "?" + queryParams.join("&") : "";
  return `postgres://${authStr}${hostStr}/${database}${queryStr}`;
}

export default {
  sanitizePostgresUrl,
  parseConnectionString,
  generateConnectionString,
};
