global.Pane = jClass.extend({
  init: function (view) {
    this.view = view;
    this.handler = view.handler;
  },

  initEvents: function (content) {
    var $this = this;

    $u(content).find('a[exec], button[exec], input[type=submit][exec]').each(function(i, el) {
      $u(el).bind('click', function(e) {
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

  renderViewToPane: function(pane, view_file, options) {
    node = App.renderView(view_file, options);
    this.view.setTabContent(pane, node);
    this.content = this.view.tabContent(pane);
    this.initEvents(this.content);
  }
});

/*
$u(el).bind('click', function (e) {
  
}.bind(this));

// --- 

$u(el).bind('click', lambda (e) {
  
});

$u(el).bind('click') -> {|e|
  
};
*/