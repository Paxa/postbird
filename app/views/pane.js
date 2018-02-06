class Pane {

  constructor (view) {
    this.view = view;
    this.handler = view.handler;
  }

  initEvents (content) {
    $u(content).find('a[exec], button[exec], input[type=submit][exec]').each((i, el) => {
      $u(el).bind('click', (e) => {
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
    this.content.attr('unchangeable', true);
  }

  renderViewToPane (pane, view_file, options) {
    var node = App.renderView(view_file, options);
    this.view.setTabContent(pane, node);
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

global.Pane = Pane;

Pane.Procedures = require('./panes/procedures');
Pane.Info       = require('./panes/info');
Pane.Content    = require('./panes/content');
Pane.Query      = require('./panes/query');
Pane.Structure  = require('./panes/structure');
Pane.Users      = require('./panes/users');
Pane.Extensions = require('./panes/extensions');

module.exports = Pane;