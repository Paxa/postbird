class PaneBase {

  /*::
  view: DbScreenView
  handler: DbScreen
  lastEvent: Event
  content: JQuery<HTMLElement>
  */

  constructor (view) {
    this.view = view;
    this.handler = view.handler;
  }

  initEvents (content) {
    $u(content).find('a[exec], button[exec], input[type=submit][exec]').each((i, el) => {
      el.addEventListener('click', e => {
      //$u(el).bind('click', (e) => {
        $u.stopEvent(e);
        this.lastEvent = e;
        //with(this) {
          var exec = el.getAttribute('exec');
          if (!exec.match(/\(.*\)/)) exec = exec + '()';
          //console.log('EXEC', `this.${exec}`);
          eval(`this.${exec}`);
        //}
      });
    });
  }

  setUnchangeable () {
    this.content.attr('unchangeable', 'true');
  }

  renderViewToPane (pane, view_file, options /*::? : any */) {
    try {
      var node = App.renderView(view_file, options);
      this.view.setTabContent(pane, node);
    } catch (error) {
      errorReporter(error, false);
      var errorMsg = $dom(['div.error',
        ['h4', "Can not render content"],
        ['code',
          ['pre', error.toString()]
        ]
      ]);

      this.view.setTabContent('content', errorMsg);
    }
    this.content = this.view.tabContent(pane);
    this.initEvents(this.content);
  }

  initTables () {
    // heavy stuff, run it with delay
    setTimeout(() => {
      this.content.find('.rescol-wrapper').forEach((table) => {
        new ResizableColumns(table);
      });

      this.content.find('.rescol-content-wrapper table').forEach((table) => {
        if (!table.hasAttribute('native-table-init')) {
          new GenericTable(table);
          $u(table).trigger('generic-table-init');
          table.setAttribute('native-table-init', true);
        }
      });
    }, 10);
  }

  scrollToTop () {
    this.content[0].scrollTop = 0;
  }
}

global.PaneBase = PaneBase;