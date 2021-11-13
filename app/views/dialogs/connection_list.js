class ConnectionList extends DialogBase {
  /*::
  server: string[]
  */
  constructor (server) {
    super(null, {
      title: "Connected Clients",
      dialogClass: "connection-list",
      server: server
    });
    this.showWindow();
  }

  async showWindow () {
    var connections = await this.server.listConnections();
    var nodes = App.renderView('dialogs/connection_list', {connections: connections});
    this.content = this.renderWindow(this.title, nodes);
    this.content.find('code').forEach(codeElement => {
      window.hljs.highlightBlock(codeElement);
    })
  }
}

/*::
declare var ConnectionList__: typeof ConnectionList
*/
module.exports = ConnectionList;
