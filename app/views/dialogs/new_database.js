global.Dialog.NewDatabase = global.Dialog.extend({
  title: "New database",

  init: function (handler) {
    this.handler = handler;
    this.prepareData(this.showWindow.bind(this));
  },

  showWindow: function () {
    var nodes = App.renderView('dialogs/new_database');
    this.content = this.renderWindow(this.title, nodes);

    this.templateSelect = this.content.find('select.template');
    this.templateSelect.append( $u.buildOption('') );
    this.templates.forEach(function(template) {
      this.templateSelect.append( $u.buildOption(template, template) );
    }.bind(this));

    this.encodingSelect = this.content.find('select.encoding');
    this.encodings.forEach(function(encoding) {
      var label = encoding, options = {};
      if (this.clientEncoding == encoding) {
        label = label + '  (Client encoding)';
        options.selected = 'selected';
      } else if (this.serverEncoding == encoding) {
        label = label + '  (Server encoding)';
      }

      this.encodingSelect.append( $u.buildOption(label, encoding, options) );
    }.bind(this));

    this.bindFormSubmitting();
    this.setAutofocus();
  },

  onSubmit: function (data) {
    if (!data.dbname || data.dbname == '') {
      alert('Please fill database name');
      return;
    }

    this.handler.createDatabase(data, function (data, error) {
      if (error)
        window.alert(error.message);
      else
        this.close();
    }.bind(this));
  },

  prepareData: function (callback) {
    var _this = this, c = this.handler.connection;
    with (this.handler.connection) {
      databaseTemplatesList(function(data) {
        _this.templates = data;
        avaliableEncodings(function (encodings) {
          _this.encodings = encodings;
          getVariable('CLIENT_ENCODING', function (result) {
            _this.clientEncoding = result;
            getVariable('SERVER_ENCODING', function (result) {
              _this.serverEncoding = result;
              callback();
            }); // SERVER_ENCODING
          }); // CLIENT_ENCODING
        }); // avaliableEncodings
      }); // databaseTemplatesList
    } // with
  },
});
