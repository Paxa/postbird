global.Dialog.UserGrants = global.Dialog.extend({
  title: "",
  dialogClass: "user-grants-dialog",

  init: function (title, grants) {
    this.title = title;
    this.grants = grants;
    this.showWindow();
  },

  showWindow: function () {
    var nodes = App.renderView('dialogs/user_grants', {grants: this.grants});
    this.content = this.renderWindow(this.title, nodes);
  }
});
