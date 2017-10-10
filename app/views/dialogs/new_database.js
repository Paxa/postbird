global.Dialog.NewDatabase = global.Dialog.extend({
  title: "New database",

  init: function (handler) {
    this.handler = handler;
    this.prepareData().then(() => {
      this.showWindow();
    });
  },

  showWindow: function () {
    var nodes = App.renderView('dialogs/new_database');
    this.content = this.renderWindow(this.title, nodes);

    this.templateSelect = this.content.find('select.template');
    this.templateSelect.append( $u.buildOption('') );
    this.templates.forEach((template) => {
      this.templateSelect.append( $u.buildOption(template, template) );
    });

    this.encodingSelect = this.content.find('select.encoding');
    this.encodings.forEach((encoding) => {
      var label = encoding, options = {};
      if (this.clientEncoding == encoding) {
        label = label + '  (Client encoding)';
        options.selected = 'selected';
      } else if (this.serverEncoding == encoding) {
        label = label + '  (Server encoding)';
      }

      this.encodingSelect.append( $u.buildOption(label, encoding, options) );
    });

    this.bindFormSubmitting();
    this.setAutofocus();
  },

  onSubmit: function (data) {
    if (!data.dbname || data.dbname == '') {
      alert('Please fill database name');
      return;
    }

    this.handler.createDatabase(data, (data, error) => {
      if (error)
        window.alert(error.message);
      else
        this.close();
    });
  },

  prepareData: async function (callback) {
    var server = this.handler.connection.server;

    this.templates = await server.databaseTemplatesList();
    this.encodings = await server.avaliableEncodings();
    this.clientEncoding = await server.getVariable('CLIENT_ENCODING');
    this.serverEncoding = await server.getVariable('SERVER_ENCODING');
  },
});
