declare class Dialog {
  constructor(...args: any[]);
  [key: string]: any;
}

declare module Dialog {
  class ConnectionList { constructor(...args: any[]); [key: string]: any; }
  class DefProcedure { constructor(...args: any[]); [key: string]: any; }
  class EditColumn { constructor(...args: any[]); [key: string]: any; }
  class EditProcedure { constructor(...args: any[]); [key: string]: any; }
  class EditUser { constructor(...args: any[]); [key: string]: any; }
  class EditValue { constructor(...args: any[]); [key: string]: any; }
  class ExportFile { constructor(...args: any[]); [key: string]: any; }
  class HerokuConnection { constructor(...args: any[]); [key: string]: any; }
  class ImportFile { constructor(...args: any[]); [key: string]: any; }
  class ListLanguages { constructor(...args: any[]); [key: string]: any; }
  class NewColumn { constructor(...args: any[]); [key: string]: any; }
  class NewDatabase { constructor(...args: any[]); [key: string]: any; }
  class NewIndex { constructor(...args: any[]); [key: string]: any; }
  class NewSnippet { constructor(...args: any[]); [key: string]: any; }
  class NewTable { constructor(...args: any[]); [key: string]: any; }
  class NewUser { constructor(...args: any[]); [key: string]: any; }
  class RelatedRecords { constructor(...args: any[]); [key: string]: any; }
  class ShowSql { constructor(...args: any[]); [key: string]: any; }
  class UserGrants { constructor(...args: any[]); [key: string]: any; }
}
