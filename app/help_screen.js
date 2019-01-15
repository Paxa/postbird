class HelpScreen {
  /*::
  type: string
  content: JQuery<HTMLElement>
  */

  constructor () {
    this.type = "login_screen";

    this.content = App.renderView('help');

    this.content.find(".sidebar a[page]").bind('click', (e) => {
      $u.stopEvent(e);
      var link = $u(e.target);
      this.activatePage(link.attr('page'));
    });

    this.content.find('.page a.external').bind('click', (e) => {
      $u.stopEvent(e);
      var url = e.target.href;
      electron.remote.shell.openExternal(url);
    });

    new PgDumpRunner().version().then(version => {
      this.content.find('.pg_dump_version').text(version);
    }).catch(err => {
      this.content.find('.pg_dump_version').text(err);
    });
    new PsqlRunner().version().then(version => {
      this.content.find('.psql_version').text(version);
    }).catch(err => {
      this.content.find('.psql_version').text(err);
    });
  }

  activatePage (pageName) {
    this.content.find('.page').hide();
    this.content.find('.page.' + pageName).show();

    this.content.find('.sidebar li.selected').removeClass('selected');
    this.content.find('a[page="' + pageName + '"]').parent().addClass('selected');
  }

  static open (e /*::? : any */) {
    $u.stopEvent(e);
    if (!App.helpScreenOpen()) {
      App.addHelpScreen();
    }

    App.tabs.forEach((tab) => {
      // @ts-ignore
      if (tab.instance === App.helpScreen) {
        tab.activate();
      }
    });

    return App.helpScreen;
  }
}

global.HelpScreen = HelpScreen;
