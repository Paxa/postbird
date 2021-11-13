class ServerController {
  async showConnectionList () {
    var server = global.App.currentTab.instance.connection.server;
    var dialog = new Dialog.ConnectionList(server);
    // dialog.showWindow();
  }
}


module.exports = ServerController;
global.ServerController = ServerController;
