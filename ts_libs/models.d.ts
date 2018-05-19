import events = require("events");

declare global {
  class Model {
  }

  export module Model {
    class Server {
      constructor(connection: Connection);
      listDatabases(callback?: (dbs: string[]) => void): Promise<string[]>;
      fetchServerVersion(): Promise<string>;
      createDatabase(name: string, template: string, encoding: string): Promise<any>;
      dropDatabase(name: string): Promise<any>;
      renameDatabase(name: string, newName: string): Promise<any>;
    }
    class SavedConn {
      static savedConnections: () => any;
      static saveConnection: (name: string, options: ConnectionOptions) => void;
      static renameConnection: (oldName: string, newName: string) => void;
      static removeConnection: (name: string) => void;
      static isEqualWithSaved: (name: string, options: ConnectionOptions) => boolean;
    }

    class Table {
      constructor(schema: string, table: string);
      static create(schema: string, tableName: string, options?: any): Promise<Table>;
      getColumnTypes(): Promise<any>;
      getRows(offset: number, limit: number, options: any): Promise<any[]>;
      getTableType(): Promise<string>;
      remove(): Promise<any>;
      refreshMatView(): Promise<any>;
      rename(newName: string): Promise<any>;
      isMatView(): Promise<boolean>;
      getStructure(): Promise<any>;
      getConstraints(): Promise<any[]>;
      dropConstraint(name: string, cb?: (error: Error, res: any) => void): Promise<any>;
      getSourceSql(cb?: (source: string, dumpError?: Error) => void): Promise<any>;
      diskSummary(): Promise<any>;
      truncate(cascade?: boolean, cb?: (res: any, error: Error) => void): Promise<any>;
    }

    class User {
      constructor(username?: string);
      static findAll(): Promise<User[]>;
      static create(data: any): Promise<User[]>;
      static drop(username: string): Promise<void>;
      update(data: any): Promise<void>;
    }

    class Index {
      constructor(name: string, data: any);
      static list(table: Table): Promise<Index[]>;
      static create(table: Table, name: string, data: any): Promise<Index>;
      drop(): Promise<any>;
    }

    class Column {
      constructor(columnName: any, data?: any);
      static create(data: any): Promise<Column>;
      create(): Promise<Column>;
      drop(): Promise<any>;
    }
  }
}
