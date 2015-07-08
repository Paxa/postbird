global.Dialog.EditProcedure = global.Dialog.extend({
  title: "Edit Procedure",
  dialogClass: "edit-procedure-dialog",

  init: function(handler, proc) {
    this.proc = proc;
    this.showWindow();
  },

  showWindow: function () {
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

    console.log(this.proc.language, 'this.mime', this.mime);

    this.textarea = this.content.find('textarea.editor');

    this.editor = window.CodeMirror.fromTextArea(this.textarea[0], {
      mode: this.mime,
      indentWithTabs: false,
      smartIndent: true,
      lineNumbers: true,
      matchBrackets : true,
      autofocus: true,
      styleActiveLine: true,
      tabSize: 2,
      theme: 'mac-classic',
      extraKeys: {"Esc": "autocomplete"}
    });

    this.bindFormSubmitting();
  },

});