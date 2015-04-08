global.HelpScreen = jClass.extend({
  type: "login_screen",

  init: function () {
    this.content = App.renderView('help');
    this.content.find(".sidebar a[page]").bind('click', function (e) {
      $u.stopEvent(e);
      var link = $u(e.target);
      this.activatePage(link.attr('page'));
    }.bind(this));

    this.content.find('.page a.external').bind('click', function(e) {
      $u.stopEvent(e);
      var url = e.target.href;
      gui.Shell.openExternal(url);
    });
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
  if (!App.helpScreenOpen()) {
    App.addHelpScreen();
  }

  App.tabs.forEach(function(tab) {
    if (tab.instance === App.helpScreen) {
      tab.activate();
    }
  });

  return App.helpScreen;
};