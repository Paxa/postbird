class Procedures extends Pane {

  renderTab (callback) {
    App.startLoading("Functions config...");

    Model.Procedure.findAllWithExtensions((procs) => {
      Model.Trigger.findAll((triggers) => {

        App.stopLoading();

        this.renderViewToPane('procedures', 'procedures_tab', {
          procs: procs,
          triggers: triggers
        });

        this.initTables();
        if (callback) callback();
      });
    });
  }

  editProc (poid, procName) {
    Model.Procedure.find(poid, (proc) => {
      Dialog.EditProcedure(this.handler, proc);
    });
  }

  procDefinition (poid, name) {
    Model.Procedure.find(poid, (proc) => {
      proc.getDefinition((data, error) => {
        Dialog.DefProcedure(this.handler, proc, data.source);
      });
    });
  }

  editTrigger (triggerName) {
    throw "Not Implemented";
  }

  listLanguages () {
    App.startLoading("Fetching config...");
    Model.Procedure.listLanguages((langs) => {
      App.stopLoading();
      new Dialog.ListLanguages(this.hadler, langs);
    });
  }

}

module.exports = Procedures;
