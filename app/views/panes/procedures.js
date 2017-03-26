global.Panes.Procedures = global.Pane.extend({

  renderTab: function (callback) {
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
  },

  editProc: function (poid, procName) {
    Model.Procedure.find(poid, (proc) => {
      Dialog.EditProcedure(this.handler, proc);
    });
  },

  procDefinition: function (poid, name) {
    Model.Procedure.find(poid, (proc) => {
      proc.getDefinition((data, error) => {
        Dialog.DefProcedure(this.handler, proc, data.source);
      });
    });
  },

  editTrigger: function (triggerName) {
    throw "Not Implemented";
  },

  listLanguages: function () {
    App.startLoading("Fetching config...");
    Model.Procedure.listLanguages((langs) => {
      App.stopLoading();
      new Dialog.ListLanguages(this.hadler, langs);
    });
  },

});
