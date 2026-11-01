class DefProcedure extends DialogBase {
  
  proc: Model.Procedure
  source: string
  

  constructor (handler, proc : Model.Procedure , source) {
    super(handler, {
      title: "Procedure Source",
      dialogClass: "source-procedure-dialog",
      proc: proc,
      source: source
    });
    this.showWindow();
  }

  showWindow () {
    var procName = (this.proc && this.proc.name) || (this.proc && this.proc.data && this.proc.data.name) || "";
    var nodes = App.renderView('dialogs/def_procedure', {proc: this.proc, source: this.source});

    this.content = this.renderWindow("Proc: " + procName, nodes);
    var codeBlock = this.content.find('code')[0];
    if (codeBlock && window.hljs && typeof window.hljs.highlightBlock === 'function') {
      try {
        window.hljs.highlightBlock(codeBlock);
      } catch (e) {
        console.warn("Syntax highlight warning:", e);
      }
    }
  }

}


declare var DefProcedure__: typeof DefProcedure


module.exports = DefProcedure;
