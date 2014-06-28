global.Dialog.NewColumn = global.Dialog.extend({
  title: "Create column",

  init: function (handler) {
    this.handler = handler;
    this.showWindow();
  },

  showWindow: function () {
    Model.Column.availableTypes(function (types) {
      var groupedTypes = this.groupTypes(types);
      var nodes = App.renderView('dialogs/column_form', {groupedTypes: groupedTypes});
      this.content = this.renderWindow(this.title, nodes);
      this.bindFormSubmitting();
    }.bind(this));
  },

  onSubmit: function (data) {
    this.handler.addColumn(data, this.defaultServerResponse.bind(this));
  },

  groupTypes: function (types) {
    var types = types.slice(0);
    var grouped = {};
    var groupName;
    for (groupName in this.groups) {
      grouped[groupName] = [];
      this.groups[groupName].forEach(function(type) {
        var typeRow;
        types.forEach(function(t, i) {
          if (t.name == type) {
            typeRow = t;
            delete types[i];
          }
        });
        grouped[groupName].push(typeRow);
      });
    }
    grouped['other'] = types;
    return grouped;
  },

  groups: {
    "Number": ['bigint', 'integer', 'real', 'smallint', 'double precision'],
    "Text": ['text', 'character varying', 'character', 'name'],
    "ID column": ['uuid', 'bigserial', 'serial'],
    "Date": ['date', 'timestamp without time zone', 'timestamp with time zone', 'time without time zone', 'time with time zone'],
    "Boolean": ['boolean'],
  }
});