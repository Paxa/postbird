var remote = require('electron').remote;
var Menu = remote.Menu;
var MenuItem = remote.MenuItem;

$u.formValues = function (selector_or_el) {
  var paramObj = {};
  $u.each($u(selector_or_el).serializeArray(), (_, kv) => {
    paramObj[kv.name] = kv.value;
  });

  return paramObj;
};

$u.stopEvent = function (e) {
  e && e.preventDefault();
};

// replacement of behated .each()
$u.fn.forEach = function (callback) {
  this.each((i, item) => {
    return callback(item, i);
  });
};

// build <option> tag
$u.buildOption = function (label, value, options) {
  if (options == undefined && typeof value == 'object') {
    options = value;
    value = label;
  }

  if (!options) options = {};
  if (value) options.value = value;

  return $dom(['option', label, options]);
};

$u.contextMenu = function (element, options, params) {
  if (element.is === $u.fn.is) element = element[0];

  element.addEventListener('contextmenu', (event) => {
    if (!element.contextmenu) {
      var menu = element.contextmenu = new Menu();
      for (var n in options) {
        if (options[n] && typeof options[n] == 'string') {
          menu.append(new MenuItem({ type: options[n] }));
        } else {
          menu.append(new MenuItem({ label: n, click: options[n] }));
        }
      }
      event.preventDefault();
      event.stopPropagation();
    }

    element.contextmenu.clickEvent = event;

    if (params && params.onShow) {
      params.onShow(event, element.contextmenu);
    }

    element.contextmenu.popup(remote.getCurrentWindow(), {async: true});
  });
};

$u.fn.single_double_click = function single_double_click (single_click_callback, double_click_callback, timeout) {
  return this.each(() => {
    var clicks = 0, self = this;
    $u(this).click(function(event){
      clicks++;
      if (clicks == 1) {
        setTimeout(() => {
          if (clicks == 1) {
            single_click_callback.call(self, event);
          } else {
            double_click_callback.call(self, event);
          }
          clicks = 0;
        }, timeout || 200);
      }
    });
  });
};

$u.fn.single_double_click_nowait = function single_double_click (single_click_callback, double_click_callback, timeout) {
  return this.each(function(){
    var clicks = 0, self = this;
    $u(this).click(function(event){
      clicks++;
      if (clicks == 1) {
        single_click_callback.call(self, event);
        setTimeout(function(){
          if (clicks == 2) {
            double_click_callback.call(self, event);
          }
          clicks = 0;
        }, timeout || 200);
      }
    });
  });
};

$u.fn.removeChildren = function removeChildren () {
  for (var i = 0; i < this.length; i++) {
    while (this[i].firstChild) {
      this[i].removeChild(this[i].firstChild);
    }
  }
  return this;
};

$u.fn.fasterAppend = function fasterAppend (nodes) {
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
  setTimeout(() => {
    var closer = function closer (e) {
      if (options.condition) {
        if (!options.condition()) {
          $u('#wrapper').unbind('click', closer);
          return;
        }
      }

      var matched;
      if (e.target == element[0]) matched = true;
      $u(e.target).parents().each((i, parent) => {
        if (parent == element[0]) matched = true;
      });

      if (matched) return;

      callback(e.escpeKey ? 'escape' : 'click');
      $u(carcher).unbind('click', closer);
    };

    $u(carcher).bind('click', closer);

    window.Mousetrap.bind('esc', () => {
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

  electron.remote.dialog.showOpenDialog({
    properties: [ 'openFile' ],
    filters: [
      { name: 'SQL Files', extensions: [fileExt, 'sql', 'pgsql'] },
    ]
  }, callback);
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
  window.ondragleave = () => {
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

$u.selectedText = function (element, currentWindow) {
  if (element.tagName == 'INPUT' || element.tagName == 'TEXTAREA') {
    return element.value.substring(element.selectionStart, element.selectionEnd);
  } else {
    return (currentWindow || window).getSelection().toString();
  }
};

// should be used for all text fields
$u.textInputMenu = function (element, currentWindow) {
  if (element.type == "checkbox" || element.type == "radio") {
    return false;
  }
  // disables 'Cut' and 'Copy' when no text selected
  var onShow = function (event, menu) {
    var selected = $u.selectedText(element, currentWindow);
    if (selected && selected != '') {
      menu.items.forEach((item) => {
        item.enabled = true;
      });
    } else {
      menu.items.forEach((item) => {
        if (item.label == "Cut" || item.label == "Copy") {
          item.enabled = false;
        }
      });
    }
  };

  $u.contextMenu(element, {
    'Cut': () => {
      (currentWindow || window).document.execCommand("cut");
    },
    'Copy': () => {
      (currentWindow || window).document.execCommand("copy");
    },
    'Paste': () => {
      (currentWindow || window).document.execCommand("paste");
    }
  }, {onShow: onShow});
};

$u.textContextMenu = function (element, currentWindow) {
  var onShow = function (event, menu) {
    var selected = $u.selectedText(element, currentWindow);
    if (selected && selected != '') {
      menu.items.forEach((item) => {
        item.enabled = true;
      });
    } else {
      menu.items.forEach((item) => {
        if (item.label == "Copy") {
          item.enabled = false;
        }
      });
    }
  };

  $u.contextMenu(element, {
    'Copy': () => {
      (currentWindow || window).document.execCommand("copy");
    },
  }, {onShow: onShow});
};