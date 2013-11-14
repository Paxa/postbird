global.Panes.Extensions = global.Pane.extend({

  renderTab: function (rows) {
    this.renderViewToPane('extensions', 'extensions_tab', {rows: rows});
  },

  install: function (extension) {

    window.alertify.labels.ok = "Install";
    window.alertify.confirm("Install extension " + extension + "?", function (res) {
      window.alertify.labels.ok = "OK";
      if (!res) return;

      this.lastEvent.target.disabled = true;
      this.handler.installExtension(extension, function (result, error) {
        var okMsg = "Extension " + extension + " successfully installed."
        setTimeout(function () {
          window.alertify.alert(error && error.message || okMsg);
        }, 550);
      });
    }.bind(this));
  },

  uninstall: function (extension) {
    window.alertify.labels.ok = "Uninstall";
    window.alertify.confirm("Delete extension " + extension + "?", function (res) {
      window.alertify.labels.ok = "OK";
      if (!res) return;
      this.lastEvent.target.disabled = true;

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
