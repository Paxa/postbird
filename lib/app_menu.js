global.AppMenu = {
  extend: function(nativeMenuBar, newMenu) {
    Object.forEach(newMenu, function (submenuName, submenu) {
      var nativeSubmenu;
      nativeMenuBar.items.forEach(function(es) {
        if (es.label == submenuName) nativeSubmenu = es.submenu;
      });
      if (!nativeSubmenu) {
        nativeSubmenu = new gui.Menu();
        var position = nativeMenuBar.items.length - 1;
        nativeMenuBar.insert(new gui.MenuItem({label: submenuName, submenu: nativeSubmenu}), position);
      }
      Object.forEach(submenu, function (itemName, callback) {
        if (typeof callback == 'string') {
          nativeSubmenu.append(new gui.MenuItem({ type: callback }));
        } else {
          var menuItem;
          if (typeof callback == 'object') {
            var options = {label: itemName};
            Object.forEach(callback, function (key, value) {
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
    console.log(item);
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

window.AppMenu = global.AooMenu;