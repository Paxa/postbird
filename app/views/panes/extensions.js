class Extensions extends Pane {

  renderTab (rows) {
    var scrollOffset = [0, 0];
    var selecredRow = null;
    if (this.content && this.handler.currentTab == 'extensions') {
      var table = this.content.find('.rescol-content-wrapper')[0];
      scrollOffset = table ? [table.scrollTop, table.scrollLeft] : [0, 0];
      var selectedCells = $u(table).find('tr.selected td');
      selecredRow = selectedCells.length && selectedCells[0].innerHTML;
    }

    this.renderViewToPane('extensions', 'extensions_tab', {rows: rows});

    if (scrollOffset != [0, 0]) {
      var table = this.content.find('.rescol-content-wrapper table');
      if (table[0]) {
        table.on('generic-table-init', () => {
          table[0].parentNode.scrollTop = scrollOffset[0];
          table[0].parentNode.scrollLeft = scrollOffset[1];
          if (selecredRow) {
            table.find('td:first-child').forEach((cell) => {
              if (cell.innerHTML == selecredRow) {
                cell.click();
              }
            });
          }
        });
      }
    }

    this.initTables();
  }

  install (extension) {

    window.alertify.labels.ok = "Install";
    window.alertify.confirm("Install extension " + extension + "?", (res) => {
      window.alertify.labels.ok = "OK";
      if (!res) return;

      this.lastEvent.target.disabled = true;
      this.handler.installExtension(extension, (result, error) => {
        var okMsg = "Extension " + extension + " successfully installed."
        setTimeout(() => {
          if (error) {
            this.lastEvent.target.disabled = false;
          }
          window.alertify.alert(error && error.message || okMsg);
        }, 550);
      });
    });
  }

  uninstall (extension) {
    window.alertify.labels.ok = "Uninstall";
    window.alertify.confirm("Delete extension " + extension + "?", (res) => {
      window.alertify.labels.ok = "OK";
      if (!res) return;
      this.lastEvent.target.disabled = true;

      this.handler.uninstallExtension(extension, (result, error) => {
        var okMsg = "Extension " + extension + " uninstalled.";

        // wait till transition finish
        // TODO: fix without setTimeout
        setTimeout(() => {
          if (error) {
            this.lastEvent.target.disabled = false;
          }
          window.alertify.alert(error && error.message || okMsg);
        }, 550);

      });
    });
  }

}

module.exports = Extensions;
