// Type definitions for pg 7.4
// Project: https://github.com/brianc/node-postgres
// Definitions by: Phips Peter <https://github.com/pspeter3>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

/// <reference types="node" />

import events = require("events");
import stream = require("stream");
import pgTypes = require("pg-types");
// 
import { TlsOptions } from "tls";

declare global {
export namespace pg {
  interface ConnectionConfig {
      user?: string;
      database?: string;
      password?: string;
      port?: number;
      host?: string;
      connectionString?: string;
      keepAlive?: boolean;
  }

  interface Defaults extends ConnectionConfig {
      poolSize?: number;
      poolIdleTimeout?: number;
      reapIntervalMillis?: number;
      binary?: boolean;
      parseInt8?: boolean;
  }

  interface ClientConfig extends ConnectionConfig {
      ssl?: boolean | TlsOptions;
  }

  interface PoolConfig extends ClientConfig {
      // properties from module 'node-pool'
      max?: number;
      min?: number;
      connectionTimeoutMillis?: number;
      idleTimeoutMillis?: number;

      application_name?: string;
      Promise?: PromiseConstructorLike;
  }

  interface QueryConfig {
      name?: string;
      text: string;
      values?: any[];
  }

  interface QueryArrayConfig extends QueryConfig {
      rowMode: 'array';
  }

  interface FieldDef {
      name: string;
      tableID: number;
      columnID: number;
      dataTypeID: number;
      dataTypeSize: number;
      dataTypeModifier: number;
      format: string;
  }

  interface QueryResultBase {
      command: string;
      rowCount: number;
      oid: number;
      fields: FieldDef[];
  }

  interface QueryResult extends QueryResultBase {
      rows: any[];
  }

  interface QueryArrayResult extends QueryResultBase {
      rows: any[][];
  }

  interface Notification {
      processId: number;
      channel: string;
      payload?: string;
  }

  interface ResultBuilder extends QueryResult {
      addRow(row: any): void;
  }

  class Pool extends events.EventEmitter {
      // `new Pool('pg://user@localhost/mydb')` is not allowed.
      // But it passes type check because of issue:
      // https://github.com/Microsoft/TypeScript/issues/7485
      constructor(config?: PoolConfig);

      readonly totalCount: number;
      readonly idleCount: number;
      readonly waitingCount: number;

      connect(): Promise<PoolClient>;
      connect(callback: (err: Error, client: PoolClient, done: (release?: any) => void) => void): void;

      end(): Promise<void>;
      end(callback: () => void): void;

      query(queryStream: QueryConfig & stream.Readable): stream.Readable;
      query(queryConfig: QueryArrayConfig): Promise<QueryArrayResult>;
      query(queryConfig: QueryConfig): Promise<QueryResult>;
      query(queryTextOrConfig: string | QueryConfig, values?: any[]): Promise<QueryResult>;
      query(queryConfig: QueryArrayConfig, callback: (err: Error, result: QueryArrayResult) => void): Query;
      query(queryTextOrConfig: string | QueryConfig, callback: (err: Error, result: QueryResult) => void): Query;
      query(queryText: string, values: any[], callback: (err: Error, result: QueryResult) => void): Query;

      on(event: "error", listener: (err: Error, client: PoolClient) => void): this;
      on(event: "connect" | "acquire" | "remove", listener: (client: PoolClient) => void): this;
  }

  class ClientBase extends events.EventEmitter {
      constructor(config?: string | ClientConfig);

      connect(): Promise<void>;
      connect(callback: (err: Error) => void): void;

      query(queryStream: QueryConfig & stream.Readable): stream.Readable;
      query(queryConfig: QueryArrayConfig): Promise<QueryArrayResult>;
      query(queryConfig: QueryConfig): Promise<QueryResult>;
      query(queryTextOrConfig: string | QueryConfig, values?: any[]): Promise<QueryResult>;
      query(queryConfig: QueryArrayConfig, callback: (err: Error, result: QueryArrayResult) => void): Query;
      query(queryTextOrConfig: string | QueryConfig, callback: (err: Error, result: QueryResult) => void): Query;
      query(queryText: string, values: any[], callback: (err: Error, result: QueryResult) => void): Query;

      copyFrom(queryText: string): stream.Writable;
      copyTo(queryText: string): stream.Readable;

      pauseDrain(): void;
      resumeDrain(): void;

      escapeIdentifier(str: string): string;
      escapeLiteral(str: string): string;

      on(event: "drain", listener: () => void): this;
      on(event: "error" | "notice", listener: (err: Error) => void): this;
      on(event: "notification", listener: (message: Notification) => void): this;
      // tslint:disable-next-line unified-signatures
      on(event: "end", listener: () => void): this;
  }

  class Client extends ClientBase {
      constructor(config?: string | ClientConfig);

      end(): Promise<void>;
      end(callback: (err: Error) => void): void;
  }

  interface PoolClient extends ClientBase {
      release(err?: Error): void;
  }

  class Query extends events.EventEmitter {
      on(event: "row", listener: (row: any, result?: ResultBuilder) => void): this;
      on(event: "error", listener: (err: Error) => void): this;
      on(event: "end", listener: (result: ResultBuilder) => void): this;
  }

  class Events extends events.EventEmitter {
      on(event: "error", listener: (err: Error, client: Client) => void): this;
  }

  //const types: typeof pgTypes;

  const defaults: Defaults & ClientConfig;

  //import * as Pg from '.';

  const native: typeof pg;
}}