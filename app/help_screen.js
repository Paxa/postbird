global.HelpScreen = jClass.extend({
  init: function () {
    this.content = App.renderView('help');
    this.content.find(".sidebar a[page]").bind('click', function (e) {
      $u.stopEvent(e);
      var link = $u(e.target);
      this.activatePage(link.attr('page'));
    }.bind(this));

    this.content.find('.page a').attr("target", "_blank");
  },

  activatePage: function (pageName) {
    this.content.find('.page').hide();
    this.content.find('.page.' + pageName).show();

    this.content.find('.sidebar li.current').removeClass('current');
    this.content.find('a[page="' + pageName + '"]').parent().addClass('current');
  }

});

HelpScreen.open = function (e) {
  $u.stopEvent(e);
  App.addHelpScreen().activate();
  return App.helpScreen;
};