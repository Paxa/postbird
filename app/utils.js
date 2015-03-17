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

if (window.Object) {
  window.Object.forEach     = global.Object.forEach;
  window.Object.values      = global.Object.values;
  window.Object.ancestors   = global.Object.ancestors;
  window.Object.properties  = global.Object.properties;
}

$u.listenClickOutside = function listenClickOutside (element, options, callback) {
  element = $u(element);
  if (callback === undefined) callback = options;
  options = typeof options == 'object' ? options : {};

  var carcher = window.document.body;

  // listen click outside
  setTimeout(function() {
    var closer = function closer (e) {
      if (options.condition) {
        if (!options.condition()) {
          $u('#wrapper').unbind('click', closer);
          return;
        }
      }

      var matched;
      if (e.target == element[0]) matched = true;
      $u(e.target).parents().each(function(i, parent) {
        if (parent == element[0]) matched = true;
      });

      if (matched) return;

      callback(e.escpeKey ? 'escape' : 'click');
      $u(carcher).unbind('click', closer);
    };

    $u(carcher).bind('click', closer);

    window.Mousetrap.bind('esc', function () {
      closer({target: window.document.body, escpeKey: true});
      window.Mousetrap.unbind('esc');
    });

  }, 50);
};

// <input type="file" accept=".doc,.docx,.xml,application/msword">

$u.openFileDialog = function (fileExt, callback) {
  if (typeof fileExt == 'function' && callback === undefined) {
    callback = fileExt;
    fileExt = undefined;
  }
  var input = $u('<input>').attr('type', 'file');
  if (fileExt) {
    input.attr('accept', fileExt);
  }
  input.change(function(evt) {
    callback(this.value);
    //console.log(evt, this.value);
  });
  input.trigger('click');
};

// Make an area droppable
// from here https://github.com/micc83/Nuwk/blob/master/js/controllers.js
$u.makeDroppable = function (target, callback) {
  var holder = $u(target)[0];
  window.ondragover = function(e) {
    holder.className = 'hover';
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    return false;
  };
  window.ondrop = function(e) {
    holder.className = '';
    e.preventDefault();
    return false;
  };
  window.ondragleave = function () {
    holder.className = '';
    return false;
  };
  holder.ondrop = function (e) {
    this.className = '';
    e.preventDefault();

    for (var i = 0; i < e.dataTransfer.files.length; ++i) {
      // Return the path
      callback(e.dataTransfer.files[i].path);
    }
    return false;
  };
};

$u.commentOf = function (callback) {
  return callback.toString().match(/[^]*\/\*([^]*)\*\/\s*\}$/)[1];
};
