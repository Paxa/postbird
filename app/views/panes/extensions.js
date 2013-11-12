global.Panes.Extensions = global.Pane.extend({

  renderTab: function (rows) {
    var node = App.renderView('extensions_tab', {rows: rows});
    this.view.setTabContent('extensions', node);
    this.initEvents(this.view.tabContent('extensions'));
  },

  install: function (extension) {
    this.handler.installExtension(extension, function (result, error) {
      var okMsg = "Extension " + extension + " successfully installed."
      window.alertify.alert(error && error.message || okMsg);
    });
  },

  uninstall: function (extension) {
    window.alertify.confirm("Delete extension " + extension + "?", function (res) {
      if (!res) return;
      this.handler.uninstallExtension(extension, function (result, error) {
        var okMsg = "Extension " + extension + " uninstalled.";

        // wait till transition finish
        // TODO: fix without setTimeout
        setTimeout(function () {
          window.alertify.alert(error && error.message || okMsg);
        }, 550);
        
      });
    }.bind(this));
  }

});
