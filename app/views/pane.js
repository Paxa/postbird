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
        with($this) {
          var exec = el.getAttribute('exec');
          if (!exec.match(/\(.*\)/)) exec = exec + '()'
          eval(exec);
        }
      });
    });
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