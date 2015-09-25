global.Dialog.DefProcedure = global.Dialog.extend({
  title: "Procedure Source",
  dialogClass: "source-procedure-dialog",

  init: function(handler, proc, source) {
    this.proc = proc;
    this.source = source;
    this.showWindow();
  },

  showWindow: function () {
    var nodes = App.renderView('dialogs/def_procedure', {proc: this.proc, source: this.source});

    this.content = this.renderWindow("Proc: " + this.proc.name, nodes);
    window.hljs.highlightBlock(this.content.find('code')[0]);
  },

});