global.Dialog.EditUser = global.Dialog.NewUser.extend({
  title: "Edit user",

  init: function(handler, username) {
    this.username = username;
    this._super(handler);
  },

  processData: function(attribute){
    this.handler.updateUser(data, function(data, error) {
      if (error)
        window.alert(error.message);
      else
        this.close();
    }.bind(this));
  },
});