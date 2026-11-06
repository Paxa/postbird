interface ClientExt {
  native?: any;
  _activeQuery?: any;
  activeQuery?: any;
  processID?: number;
  ended?: boolean;
  on: (event: string, handler: Function) => this;
  removeListener: (event: string, handler: Function) => this;
  query: (options: any, callback?: Function) => any;
  end: (callback?: Function) => any;
}

interface ConnectionOptions {
  connection_name?: string;
  host?: string;
  port?: string | number;
  database?: string;
  user?: string;
  password?: string;
  query?: string;
  auto_connect?: boolean;
  url?: string;
  type?: string;
  read_only?: boolean;
  sql_query?: string;
  tab_name?: string;
  ssh_host?: string;
  ssh_user?: string;
  ssh_pass?: string;
  ssh_port?: string | number;
  ssh_key?: string;
  ssl?: boolean | { rejectUnauthorized?: boolean; ca?: string; cert?: string; key?: string };
  sslmode?: string;
  application_name?: string;
  _originalHost?: string;
  _originalPort?: string | number;
  [key: string]: any;
}

interface HistoryRecord {
  sql: string;
  date: Date;
  state: string;
  time: number;
  error?: Error;
}

interface PgError extends Error {
  query?: string;
  messageHint?: string;
  detail?: string;
  hint?: string;
  code?: string;
  position?: string;
  schema?: string;
  table?: string;
  column?: string;
  dataType?: string;
  constraint?: string;
}

