global.Dialog.NewTable = global.Dialog.extend({
  title: "New table",

  init: function (handler) {
    this.handler = handler;
    this.showWindow();
  },

  showWindow: function () {
    this.handler.connection.tableSchemas(function(schemas) {
      console.log(schemas);
      var nodes = App.renderView('dialogs/new_table');
      this.content = this.renderWindow(this.title, nodes);

      var tablespaces = this.content.find('select[name=tablespace]');
      if (schemas.indexOf('public') == -1) {
        tablespaces.append( $u.buildOption('public', 'public') );
      }
      schemas.forEach(function(schema) {
        tablespaces.append( $u.buildOption(schema, schema) );
      });

      this.setAutofocus();
      this.bindFormSubmitting();
    }.bind(this));
  },

  onSubmit: function (data) {
    this.handler.createTable(data, this.defaultServerResponse.bind(this));
  }
});