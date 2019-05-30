import events = require("events");

declare global {
  export class Dialog {
  }

  export module Dialog {
    class DefProcedure     extends DefProcedure__ {}
    class EditColumn       extends EditColumn__ {}
    class EditProcedure    extends EditProcedure__ {}
    class EditUser         extends EditUser__ {}
    class EditValue        extends EditValue__ {}
    class ExportFile       extends ExportFile__ {}
    class HerokuConnection extends HerokuConnection__ {}
    class ImportFile       extends ImportFile__ {}
    class ListLanguages    extends ListLanguages__ {}
    class NewColumn        extends NewColumn__ {}
    class NewDatabase      extends NewDatabase__ {}
    class NewIndex         extends NewIndex__ {}
    class NewSnippet       extends NewSnippet__ {}
    class NewTable         extends NewTable__ {}
    class NewUser          extends NewUser__ {}
    class RelatedRecords   extends RelatedRecords__ {}
    class ShowSql          extends ShowSql__ {}
    class UserGrants       extends UserGrants__ {}
  }
}
