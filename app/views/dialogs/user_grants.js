class UserGrants extends Dialog {

  constructor (title, grants) {
    super(null, {
      title: title,
      dialogClass: "user-grants-dialog",
      grants: grants
    });
    this.showWindow();
  }

  showWindow () {
    var nodes = App.renderView('dialogs/user_grants', {grants: this.grants});
    this.content = this.renderWindow(this.title, nodes);
  }
}

global.Dialog.UserGrants = UserGrants;
module.exports = UserGrants;
