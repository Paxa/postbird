global.Panes.Procedures = global.Pane.extend({

  renderTab: function (procs) {
    this.renderViewToPane('procedures', 'procedures_tab', {procs: procs});
    this.initTables();
  },

  listLanguages: function () {
    App.startLoading("Fetching config...");
    Model.Procedure.listLanguages(function (langs) {
      App.stopLoading();
      new Dialog.ListLanguages(this.hadler, langs);
    }.bind(this));
  },

});
