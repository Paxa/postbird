/*::
interface JQuery {
  forEach: (handler: Function) => void;
  single_double_click_nowait: (single_click_cb: Function, double_click_cb: Function, timeout?: number) => void;
  single_double_click: (single_click_cb: Function, double_click_cb: Function, timeout?: number) => void;
  removeChildren: () => JQuery<HTMLElement>;
  fasterAppend: (nodes: HTMLElement[]) => void;
}

interface JQueryStatic {
  textareaAutoSize: (element: HTMLElement) => void;
  stopEvent: (event: any) => void;
  contextMenu: (element: JQuery<HTMLElement> | HTMLElement, options: any, params?: any) => void;
  formValues: (selector_or_el: any) => void;
  buildOption: (label: string, value?: string, options?: any) => HTMLElement;
  html2collection: (html: string) => JQuery<HTMLElement>;
  listenClickOutside: (element: JQuery<HTMLElement>, Object, Function) => void;
  openFileDialog: (fileExt: string) => Promise<string[]>;
  confirm: (text: string, options?: any) => Promise<boolean>;
  alert: (text: string, options?: any) => Promise<any>;
  alertError: (text: string | UserError, options?: any) => Promise<any>;
  alertSqlError: (text: string, error?: any) => Promise<any>;
  makeDroppable: (target: HTMLElement, callback: Function) => void;
  selectedText: (element: any, currentWindow?: any) => string;
  textInputMenu: (element: HTMLInputElement | HTMLElement, currentWindow?: any) => void;
  textContextMenu: (element: JQuery<HTMLElement> | HTMLElement, currentWindow?: any) => void;
  prompt: (message: string, filledValue?: string) => Promise<string>;
}
*/

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

$u.contextMenu = function (elementArg, options, params) {
  //if (element.is === $u.fn.is) {
  //  element /*: HTMLElement_wContextMenu */ = element[0];
  //}
  var element = elementArg instanceof HTMLElement ? elementArg : elementArg[0];

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

    element.contextmenu.popup({
      window: remote.getCurrentWindow()
    });
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
    $u(this).click(function(event) {
      clicks++;
      if (clicks == 1) {
        if (typeof single_click_callback == "function") {
          single_click_callback.call(self, event);
        }
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
  // @ts-ignore
  if (nodes.tagName) {
    // @ts-ignore
    nodes = [nodes];
  }
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

// TODO: Check if still needed
/*
if (window.Object) {
  window.Object.forEach     = global.Object.forEach;
  window.Object.values      = global.Object.values;
  window.Object.ancestors   = global.Object.ancestors;
  window.Object.properties  = global.Object.properties;
}
*/

$u.listenClickOutside = function listenClickOutside (element, options, callback) {
  element = $u(element);
  //if (callback === undefined) callback = options;
  //options = typeof options == 'object' ? options : {};

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

$u.openFileDialog = function (fileExt) {
  return new Promise((resolve, reject) => {
    var mainWindow = electron.remote.app.mainWindow;
    electron.remote.dialog.showOpenDialog(mainWindow, {
      properties: [ 'openFile' ],
      filters: [
        { name: 'SQL Files', extensions: [fileExt, 'sql', 'pgsql'] },
      ]
    }, (files) => {
      resolve(files);
    });
  });
};

$u.confirm = async (text, options = {}) => {
  var mainWindow = electron.remote.app.mainWindow;
  var res = await electron.remote.dialog.showMessageBox(mainWindow, {
    type: "question",
    message: text,
    detail: options.detail,
    buttons: [options.button || "Ok", "Cancel"],
    defaultId: options.defaultId
  });

  return res.response == 0;
};

$u.alert = async (text, options = {}) => {
  var mainWindow = electron.remote.app.mainWindow;
  return await electron.remote.dialog.showMessageBox(mainWindow, {
    type: options.type || "question",
    message: text,
    detail: options.detail,
    buttons: [options.button || "Ok"],
    defaultId: options.defaultId
  });
};

$u.alertError = async (text, options = {}) => {
  options.type = 'warning';
  if (text instanceof App.UserError) {
    if (text.description) {
      options.detail = text.description;
    }
    text = text.message;
  }
  return $u.alert(text, options);
};

$u.alertSqlError = function (text, error) {
  var sql = error.query ? `\nSQL: ${error.query}` : '';
  var hint = error.messageHint ? `\nHint: ${error.messageHint}` : '';

  var options = {
    type: 'warning',
    detail: error.message + (hint || sql ? "\n" : "") + hint + sql
  };

  return $u.alert(text, options);
};

$u.prompt = async (message, filledValue = null) /*: Promise<string> */ => {
  return new Promise((resolve, reject) => {
    window.alertify.prompt(message, (confirm, value) => {
      resolve(confirm ? value : null);
    }, filledValue);
  }) /*:: as Promise<string> */;
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

$u.textareaAutoSize = function (element) {
  function resize (event) {
    event.target.style.height = 'auto';
    event.target.style.height = event.target.scrollHeight+'px';
  }

  /* 0-timeout to get the already changed text */
  function delayedResize (event) {
    window.setTimeout(resize, 0, event);
  }

  element.addEventListener('change',  resize, false);
  element.addEventListener('cut',     delayedResize, false);
  element.addEventListener('paste',   delayedResize, false);
  element.addEventListener('drop',    delayedResize, false);
  element.addEventListener('keydown', delayedResize, false);

  element.style.height = 'auto';
  element.style.height = element.scrollHeight + 'px';
};
