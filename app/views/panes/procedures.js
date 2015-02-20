global.Panes.Procedures = global.Pane.extend({

  renderTab: function (procs) {
    App.startLoading("Functions config...");

    Model.Procedure.findAll(function(procs) {
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

  listLanguages: function () {
    App.startLoading("Fetching config...");
    Model.Procedure.listLanguages(function (langs) {
      App.stopLoading();
      new Dialog.ListLanguages(this.hadler, langs);
    }.bind(this));
  },

});
