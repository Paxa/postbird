declare class Pane {
  constructor(...args: any[]);
  [key: string]: any;
}

declare module Pane {
  class Content { constructor(...args: any[]); [key: string]: any; }
  class Extensions { constructor(...args: any[]); [key: string]: any; }
  class Procedures { constructor(...args: any[]); [key: string]: any; }
  class Info { constructor(...args: any[]); [key: string]: any; }
  class Query { constructor(...args: any[]); [key: string]: any; }
  class Structure { constructor(...args: any[]); [key: string]: any; }
  class Users { constructor(...args: any[]); [key: string]: any; }
}
