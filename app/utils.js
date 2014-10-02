$u.formValues = function (selector_or_el) {
  var paramObj = {};
  $u.each($u(selector_or_el).serializeArray(), function(_, kv) {
    paramObj[kv.name] = kv.value;
  });

  return paramObj;
};

$u.stopEvent = function (e) {
  e && e.preventDefault();
};

$u.buildOption = function (label, value, options) {
  if (options == undefined && typeof value == 'object') {
    options = value;
    value = label;
  }

  if (!options) options = {};
  if (value) options.value = value;

  return $dom(['option', label, options]);
};

$u.contextMenu = function (element, options) {
  if (element.is === $u.fn.is) element = element[0];

  element.addEventListener('contextmenu', function(ev) {
    if (!element.contextmenu) {
      var menu = element.contextmenu = new gui.Menu();
      for (var n in options) {
        if (options[n] && typeof options[n] == 'string') {
          menu.append(new gui.MenuItem({ type: options[n] }));
        } else {
          menu.append(new gui.MenuItem({ label: n, click: options[n] }));
        }
      }
    }

    element.contextmenu.popup(ev.x, ev.y);
  });
};

$u.fn.single_double_click = function(single_click_callback, double_click_callback, timeout) {
  return this.each(function(){
    var clicks = 0, self = this;
    $u(this).click(function(event){
      clicks++;
      if (clicks == 1) {
        setTimeout(function(){
          if(clicks == 1) {
            single_click_callback.call(self, event);
          } else {
            double_click_callback.call(self, event);
          }
          clicks = 0;
        }, timeout || 200);
      }
    });
  });
}

$u.fn.removeChildren = function () {
  for (var i = 0; i < this.length; i++) {
    while (this[i].firstChild) {
      this[i].removeChild(this[i].firstChild);
    }
  }
  return this;
};

$u.fn.fasterAppend = function (nodes) {
  if (nodes.tagName) nodes = [nodes];
  for (var i = 0; i < nodes.length; i++) {
    this[0].appendChild(nodes[i]);
  }
  return this;
};

$u.html2collection = function html2collection (html) {
  var div = window.document.createElement('DIV');
  div.innerHTML = html;
  return $u(div).children();
};

Object.forEach = function Object_forEach (object, callback) {
  for (var key in object) {
    if (object.hasOwnProperty(key)) callback(key, object[key]);
  }
};

window.Object.forEach = global.Object.forEach = Object.forEach;