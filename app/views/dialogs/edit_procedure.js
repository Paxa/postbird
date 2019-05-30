class EditProcedure extends DialogBase {
  /*::
  onSave: (updated: string) => void
  proc: Model.Procedure
  mime: string
  textarea: JQuery<HTMLElement>
  editor: CodeMirror.EditorFromTextArea
  */

  constructor(handler, proc, callback) {
    super(handler, {
      title: "Edit Procedure",
      dialogClass: "edit-procedure-dialog",
      proc: proc
    });
    this.showWindow();
    this.onSave = callback;
  }

  showWindow () {
    var nodes = App.renderView('dialogs/edit_procedure', {proc: this.proc});

    this.content = this.renderWindow(this.title, nodes);

    switch(this.proc.language) {
      case 'plpgsql':
      case 'sql':
        this.mime = 'text/x-pgsql';
        break;
      case 'plv8':
        this.mime = 'text/javascript';
        break;
      default:
        this.mime = 'text/x-pgsql';
    }

    this.textarea = this.content.find('textarea.editor');

    var textarea = /*:: <HTMLTextAreaElement><any> */ this.textarea[0];
    this.editor = window.CodeMirror.fromTextArea(textarea, {
      mode: this.mime,
      indentWithTabs: false,
      smartIndent: true,
      lineNumbers: true,
      lineWrapping: true,
      matchBrackets : true,
      autofocus: true,
      styleActiveLine: true,
      tabSize: 2,
      theme: 'mac-classic',
      extraKeys: {"Esc": "autocomplete"}
    });

    this.bindFormSubmitting();
  }

  onSubmit (data) {
    this.onSave(this.editor.getValue());
  }

}

/*::
declare var EditProcedure__: typeof EditProcedure
*/
module.exports = EditProcedure;
