import { SQL } from "bun";
import { EventEmitter } from "events";

export function escapeIdentifier(str: string): string {
  return '"' + (str || "").replace(/"/g, '""') + '"';
}

export function escapeLiteral(str: string): string {
  return "'" + (str || "").replace(/'/g, "''") + "'";
}

const typeParsers = new Map<number, (val: any) => any>();

export const types = {
  setTypeParser: (oid: number, fn: (val: any) => any) => {
    typeParsers.set(oid, fn);
  },
  getTypeParser: (oid: number) => {
    return typeParsers.get(oid) || ((v: any) => v);
  },
  builtins: {
    INT8: 20,
    INT2: 21,
    INT4: 23,
    TEXT: 25,
    OID: 26,
    JSON: 114,
    XML: 142,
    POINT: 600,
    FLOAT4: 700,
    FLOAT8: 701,
    BOOL: 16,
    DATE: 1082,
    TIME: 1083,
    TIMESTAMP: 1114,
    TIMESTAMPTZ: 1184,
    INTERVAL: 1186,
    NUMERIC: 1700,
    JSONB: 3802,
  },
};

function normalizeConfig(config: any): any {
  if (typeof config === "string") {
    let url = config;
    if ((config.includes("read_only=true") || config.includes("readonly=true")) && !config.includes("default_transaction_read_only")) {
      url += (url.includes("?") ? "&" : "?") + "options=-c%20default_transaction_read_only%3Don";
    }
    return { url };
  }
  if (!config) {
    return { host: "localhost", port: 5432, database: "postgres" };
  }

  const opts: any = {
    database: config.database || "postgres",
    username: config.user || config.username || "postgres",
    password: config.password !== undefined ? config.password : "",
    prepare: false,
  };

  if (config.host && config.host.startsWith("/")) {
    opts.path = config.host;
    if (config.port && String(config.port) !== "5432") {
      opts.path = `${config.host}/.s.PGSQL.${config.port}`;
    }
  } else {
    opts.hostname = config.host || "localhost";
    opts.port = Number(config.port) || 5432;
  }

  if (config.ssl !== undefined) {
    opts.ssl = config.ssl;
  }
  if (config.max !== undefined) {
    opts.max = Number(config.max);
  }
  if (config.idleTimeoutMillis) {
    opts.idleTimeout = Math.ceil(config.idleTimeoutMillis / 1000);
  }

  if (config.read_only || config.readOnly) {
    const user = encodeURIComponent(config.user || config.username || "postgres");
    const pass = config.password !== undefined && config.password !== "" ? `:${encodeURIComponent(config.password)}` : "";
    const host = config.host || "localhost";
    const port = Number(config.port) || 5432;
    const db = encodeURIComponent(config.database || "postgres");
    let url = `postgres://${user}${pass}@${host}:${port}/${db}?options=-c%20default_transaction_read_only%3Don`;
    if (config.ssl) {
      url += "&ssl=true";
    }
    opts.url = url;
  }

  return opts;
}

function formatResult(raw: any, rowMode?: string): any {
  let target = raw;
  if (!raw?.columns && Array.isArray(raw) && raw.length > 0 && raw[0]?.columns !== undefined) {
    // Multi-statement query: pick the last statement result
    target = raw[raw.length - 1];
  }

  let columns: any[] = target?.columns;
  if (!columns || columns.length === 0) {
    if (Array.isArray(target) && target.length > 0 && target[0] && typeof target[0] === "object" && !Array.isArray(target[0])) {
      columns = Object.keys(target[0]).map((name, idx) => ({
        name,
        table: 0,
        number: idx,
        type: 0,
      }));
    } else {
      columns = [];
    }
  }

  const fields = columns.map((col: any) => ({
    name: col.name,
    tableID: col.table || 0,
    columnID: col.number || 0,
    dataTypeID: col.type || 0,
    dataTypeSize: -1,
    dataTypeModifier: -1,
    format: "text",
  }));

  const rows: any[] = [];
  if (Array.isArray(target)) {
    for (let r = 0; r < target.length; r++) {
      const row = target[r];
      if (rowMode === "array") {
        if (Array.isArray(row)) {
          const rowArr = [...row];
          for (let c = 0; c < columns.length; c++) {
            const colType = columns[c].type;
            if (typeParsers.has(colType)) {
              const parser = typeParsers.get(colType)!;
              const val = rowArr[c];
              const strVal = val instanceof Date ? val.toISOString() : (val === null ? null : String(val));
              rowArr[c] = parser(strVal);
            }
          }
          rows.push(rowArr);
        } else if (row && typeof row === "object") {
          const rowArr: any[] = [];
          for (let c = 0; c < columns.length; c++) {
            const colName = columns[c].name;
            const colType = columns[c].type;
            let val = row[colName];
            if (typeParsers.has(colType)) {
              const parser = typeParsers.get(colType)!;
              const strVal = val instanceof Date ? val.toISOString() : (val === null ? null : String(val));
              val = parser(strVal);
            }
            rowArr.push(val);
          }
          rows.push(rowArr);
        } else {
          rows.push(row);
        }
      } else if (row && typeof row === "object" && !Array.isArray(row)) {
        const rowObj = { ...row };
        for (let c = 0; c < columns.length; c++) {
          const colName = columns[c].name;
          const colType = columns[c].type;
          if (typeParsers.has(colType)) {
            const parser = typeParsers.get(colType)!;
            const val = rowObj[colName];
            const strVal = val instanceof Date ? val.toISOString() : (val === null ? null : String(val));
            rowObj[colName] = parser(strVal);
          }
        }
        rows.push(rowObj);
      } else {
        rows.push(row);
      }
    }
  }

  const count = target?.count ?? target?.affectedRows ?? rows.length;
  const command = target?.command || "SELECT";

  return {
    command,
    rowCount: count,
    rows,
    fields,
    oid: null,
  };
}

export class Client extends EventEmitter {
  public config: any;
  public connection: any;
  public activeQuery: any = null;
  public processID: number = 0;
  private _sql: any = null;

  constructor(config?: any) {
    super();
    this.config = config;
  }

  escapeIdentifier(str: string): string {
    return escapeIdentifier(str);
  }

  escapeLiteral(str: string): string {
    return escapeLiteral(str);
  }

  async connect(callback?: (err?: any) => void): Promise<this> {
    try {
      if (!this._sql) {
        this._sql = new SQL(normalizeConfig(this.config));
        const res = await this._sql.unsafe("SELECT pg_backend_pid() as pid;");
        if (res && res[0] && res[0].pid) {
          this.processID = Number(res[0].pid);
        }
      }
      if (callback) callback();
      return this;
    } catch (err) {
      if (callback) callback(err);
      throw err;
    }
  }

  async query(options: any, valuesOrCallback?: any, callback?: Function): Promise<any> {
    let cb = callback;
    let values = valuesOrCallback;
    if (typeof values === "function") {
      cb = values;
      values = [];
    }

    let sqlStr = typeof options === "string" ? options : (options && options.text ? options.text : String(options));
    const rowMode = typeof options === "object" ? options?.rowMode : undefined;

    if (!this._sql) {
      await this.connect();
    }

    const queryPromise = (async () => {
      let q = (values && values.length > 0) ? this._sql.unsafe(sqlStr, values) : this._sql.unsafe(sqlStr);
      this.activeQuery = q;

      let timeoutTimer: any = null;
      if (options?.query_timeout) {
        timeoutTimer = setTimeout(() => {
          if (q && typeof q.cancel === "function") q.cancel();
        }, options.query_timeout);
      }

      try {
        const rawRes = await q;
        if (timeoutTimer) clearTimeout(timeoutTimer);
        this.activeQuery = null;
        return formatResult(rawRes, rowMode);
      } catch (err: any) {
        if (timeoutTimer) clearTimeout(timeoutTimer);
        this.activeQuery = null;
        if (err && (err.message === "Query cancelled" || err.message?.includes("canceling statement"))) {
          const cancelErr = new Error("canceling statement due to user request");
          (cancelErr as any).code = "57014";
          throw cancelErr;
        }
        throw err;
      }
    })();

    if (cb) {
      queryPromise
        .then((res) => cb!(null, res))
        .catch((err) => cb!(err));
      return queryPromise.catch(() => {});
    }

    return queryPromise;
  }

  async end(callback?: Function): Promise<void> {
    if (this._sql) {
      try {
        await this._sql.close();
      } catch (e) {}
      this._sql = null;
    }
    if (callback) callback();
  }
}

export class Pool extends EventEmitter {
  public config: any;
  public ended: boolean = false;
  public activeQuery: any = null;
  public _clients: Client[] = [];
  private _sql: any = null;
  private _initPromise: Promise<void> | null = null;

  constructor(config?: any) {
    super();
    this.config = config;
  }

  private async _ensureConnected(): Promise<void> {
    if (this._sql) return;
    if (this._initPromise) return this._initPromise;

    this._initPromise = (async () => {
      const opts = normalizeConfig(this.config);
      this._sql = new SQL(opts);
      const client = new Client(this.config);
      client.connection = this;
      try {
        const pidRes = await this._sql.unsafe("SELECT pg_backend_pid() as pid;");
        if (pidRes && pidRes[0] && pidRes[0].pid) {
          client.processID = Number(pidRes[0].pid);
        }
      } catch (e) {}
      this._clients = [client];
      this.emit("connect", client);
    })();

    return this._initPromise;
  }

  async query(options: any, valuesOrCallback?: any, callback?: Function): Promise<any> {
    let cb = callback;
    let values = valuesOrCallback;
    if (typeof values === "function") {
      cb = values;
      values = [];
    }

    let sqlStr = typeof options === "string" ? options : (options && options.text ? options.text : String(options));
    const rowMode = typeof options === "object" ? options?.rowMode : undefined;

    await this._ensureConnected();

    const queryPromise = (async () => {
      let q = (values && values.length > 0) ? this._sql.unsafe(sqlStr, values) : this._sql.unsafe(sqlStr);
      this.activeQuery = q;
      if (this._clients[0]) {
        this._clients[0].activeQuery = q;
      }

      let timeoutTimer: any = null;
      if (options?.query_timeout) {
        timeoutTimer = setTimeout(() => {
          if (q && typeof q.cancel === "function") q.cancel();
        }, options.query_timeout);
      }

      try {
        const rawRes = await q;
        if (timeoutTimer) clearTimeout(timeoutTimer);
        this.activeQuery = null;
        if (this._clients[0]) this._clients[0].activeQuery = null;
        return formatResult(rawRes, rowMode);
      } catch (err: any) {
        if (timeoutTimer) clearTimeout(timeoutTimer);
        this.activeQuery = null;
        if (this._clients[0]) this._clients[0].activeQuery = null;
        if (err && (err.message === "Query cancelled" || err.message?.includes("canceling statement"))) {
          const cancelErr = new Error("canceling statement due to user request");
          (cancelErr as any).code = "57014";
          throw cancelErr;
        }
        throw err;
      }
    })();

    if (cb) {
      queryPromise
        .then((res) => cb!(null, res))
        .catch((err) => cb!(err));
      return queryPromise.catch(() => {});
    }

    return queryPromise;
  }

  async connect(callback?: Function): Promise<Client> {
    await this._ensureConnected();
    const client = this._clients[0] || new Client(this.config);
    const release = () => {};
    if (callback) callback(null, client, release);
    return client;
  }

  async end(callback?: Function): Promise<void> {
    this.ended = true;
    if (this._sql) {
      try {
        await this._sql.close();
      } catch (e) {}
      this._sql = null;
    }
    this._clients = [];
    if (callback) callback();
  }
}

export default {
  Client,
  Pool,
  types,
  escapeIdentifier,
  escapeLiteral,
};
