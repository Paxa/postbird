class NewDatabase extends Dialog {

  constructor (handler) {
    super(handler, {
      title: "New database"
    });

    this.prepareData().then(() => {
      this.showWindow();
    });
  }

  showWindow () {
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
  }

  async onSubmit (data) {
    if (!data.dbname || data.dbname == '') {
      alert('Please fill database name');
      return;
    }

    try {
      await this.handler.createDatabase(data);
      this.close();
    } catch (error) {
      console.error(error);
      window.alert(error.message);
    }
  }

  async prepareData (callback) {
    var server = this.handler.connection.server;

    this.templates = await server.databaseTemplatesList();
    this.encodings = await server.avaliableEncodings();
    this.clientEncoding = await server.getVariable('CLIENT_ENCODING');
    this.serverEncoding = await server.getVariable('SERVER_ENCODING');
  }
}

global.Dialog.NewDatabase = NewDatabase;
module.exports = NewDatabase;
