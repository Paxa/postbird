global.Panes.Procedures = global.Pane.extend({

  renderTab: function (procs) {
    App.startLoading("Functions config...");

    Model.Procedure.findAllWithExtensions(function(procs) {
      Model.Trigger.findAll(function(triggers) {

        App.stopLoading();

        this.renderViewToPane('procedures', 'procedures_tab', {
          procs: procs,
          triggers: triggers
        });

        this.initTables();

      }.bind(this));
    }.bind(this));
  },

  editProc: function (poid, procName) {
    Model.Procedure.find(poid, function (proc) {
      Dialog.EditProcedure(this.handler, proc);
    }.bind(this));
  },

  procDefinition: function (poid, name) {
    Model.Procedure.find(poid, function (proc) {
      proc.getDefinition(function (data, error) {
        Dialog.DefProcedure(this.handler, proc, data.source);
      }.bind(this));
    }.bind(this));
  },

  editTrigger: function (triggerName) {
    throw "Not Implemented";
  },

  listLanguages: function () {
    App.startLoading("Fetching config...");
    Model.Procedure.listLanguages(function (langs) {
      App.stopLoading();
      new Dialog.ListLanguages(this.hadler, langs);
    }.bind(this));
  },

});
