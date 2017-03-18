global.Pane = jClass.extend({
  init: function (view) {
    this.view = view;
    this.handler = view.handler;
  },

  initEvents: function (content) {
    var $this = this;

    $u(content).find('a[exec], button[exec], input[type=submit][exec]').each((i, el) => {
      $u(el).bind('click', (e) => {
        $u.stopEvent(e);
        $this.lastEvent = e;
        with($this) {
          var exec = el.getAttribute('exec');
          if (!exec.match(/\(.*\)/)) exec = exec + '()'
          eval(exec);
        }
      });
    });
  },

  setUnchangeable: function () {
    this.content.attr('unchangeable', true);
  },

  renderViewToPane: function(pane, view_file, options) {
    var node = App.renderView(view_file, options);
    this.view.setTabContent(pane, node);
    this.content = this.view.tabContent(pane);
    this.initEvents(this.content);
  },

  initTables: function () {
    // heavy stuff, run it with delay
    setTimeout(() => {
      this.content.find('.rescol-wrapper').each((i, table) => {
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
  },

  scrollToTop: function () {
    this.content[0].scrollTop = 0;
  },
});
