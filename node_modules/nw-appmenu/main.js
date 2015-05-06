var gui = window.nwDispatcher.nwGui || require('nw.gui');

function Object_forEach (object, callback) {
  for (var key in object) {
    if (object.hasOwnProperty(key)) callback(key, object[key]);
  }
};

var AppMenu = {
  /**
   * Append properties to application menu
   */
  extend: function(nativeMenuBar, newMenu) {
    Object_forEach(newMenu, function (submenuName, submenu) {
      var nativeSubmenu;
      nativeMenuBar.items.forEach(function(es) {
        if (es.label == submenuName) nativeSubmenu = es.submenu;
      });
      if (!nativeSubmenu) {
        nativeSubmenu = new gui.Menu();
        var position = nativeMenuBar.items.length - 1;
        nativeMenuBar.insert(new gui.MenuItem({label: submenuName, submenu: nativeSubmenu}), position);
      }
      Object_forEach(submenu, function (itemName, callback) {
        if (typeof callback == 'string') {
          nativeSubmenu.append(new gui.MenuItem({ type: callback }));
        } else {
          var menuItem;
          if (typeof callback == 'object') {
            var options = {label: itemName};
            Object_forEach(callback, function (key, value) {
              options[key] = value;
            });
            menuItem = new gui.MenuItem(options);
          } else {
            menuItem = new gui.MenuItem({label: itemName});
            menuItem.click = callback;
          }
          nativeSubmenu.append(menuItem);
        }
      });
    });
  },

  createAndExtend: function (menuObject) {
    var nativeMenuBar = new gui.Menu({type: "menubar"});
    nativeMenuBar.createMacBuiltin && nativeMenuBar.createMacBuiltin("AppMenu");

    AppMenu.extend(nativeMenuBar, menuObject);
    gui.Window.get().menu = nativeMenuBar;
  },

  menuItem: function (menuName, itemName) {
    var menu = gui.Window.get().menu;
    var result;
    menu.items.forEach(function(es) {
      if (es.label == menuName) {
        es.submenu.items.forEach(function(item) {
          if (item.label == itemName) result = item;
        });
      }
    });
    return result;
  },

  callMenuItem: function (menuName, itemName) {
    var item = this.menuItem(menuName, itemName);
    if (item) item.click();
  },

  disableItem: function (menuName, itemName) {
    var item = this.menuItem(menuName, itemName);
    if (item) {
      item.enabled = false;
    } else {
      console.log("can not find menu item: '" + menuName + " -> " + itemName);
    }
  },

  enableItem: function (menuName, itemName) {
    var item = this.menuItem(menuName, itemName);
    if (item) {
      item.enabled = true;
    } else {
      console.log("can not find menu item: '" + menuName + " -> " + itemName);
    }
  },
};

module.exports = AppMenu;