class DefProcedure extends DialogBase {
  /*::
  proc: Model.Procedure
  source: string
  */

  constructor (handler, proc /*: Model.Procedure */, source) {
    super(handler, {
      title: "Procedure Source",
      dialogClass: "source-procedure-dialog",
      proc: proc,
      source: source
    });
    this.showWindow();
  }

  showWindow () {
    var nodes = App.renderView('dialogs/def_procedure', {proc: this.proc, source: this.source});

    this.content = this.renderWindow("Proc: " + this.proc.name, nodes);
    window.hljs.highlightBlock(this.content.find('code')[0]);
  }

}

/*::
declare var DefProcedure__: typeof DefProcedure
*/

module.exports = DefProcedure;
