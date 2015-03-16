var GenericTable = new Widget({

  init: function (element) {
    this.eventHandlers = {};

    this.rows = this.find('tr');
    var _this = this;

    this.rows.each(function (i, row) {
      $u(row).bind('click', function (event) {
        _this.onRowClick(row);
      });
    });

    this.element.bind('click', function () {
      GenericTable.setSelected(this);
    }.bind(this));

    this.bind('key.down', function (event) {
      this.selectNextRow();
    }.bind(this));

    this.bind('key.up', function (event) {
      this.selectPrevRow();
    }.bind(this));

    this.bind('selected', function () {
      this.element.addClass('active');
    }.bind(this));

    this.bind('unselected', function () {
      this.element.removeClass('active');
    }.bind(this));

    //GenericTable.presentTables.push(this);

    /*
    window.Mousetrap.bind("down", function () {
      this.selectNextRow();
      return false;
    }.bind(this));

    window.Mousetrap.bind("up", function () {
      this.selectPrevRow();
      return false;
    }.bind(this));
    */
  },

  onRowClick: function (row) {
    /*
    if (this.selectedRow == row) {
      $u(this.selectedRow).removeClass('selected');
      return;
    }
    */

    this.setSelectedRow(row);
  },

  setSelectedRow: function (row) {
    if (this.selectedRow) {
      $u(this.selectedRow).removeClass('selected');
    }

    this.selectedRow = row;
    //console.log('selected', this.selectedRow);
    $u(row).addClass('selected');
  },

  selectNextRow: function () {
    if (this.selectedRow) {
      var newNext = $u(this.selectedRow).next('tr')[0];
      if (newNext) {
        this.setSelectedRow(newNext);
      }
    }
  },

  selectPrevRow: function () {
    if (this.selectedRow) {
      var newPrev = $u(this.selectedRow).prev('tr')[0];
      if (newPrev) {
        this.setSelectedRow(newPrev);
      }
    }
  },

  eventHandlers: {},

  // events:
  // selected
  // unselected
  // key.down
  // key.up
  // 
  trigger: function (event, data) {
    //console.log('trigger', event, this.element[0]);

    if (this.eventHandlers[event]) {
      this.eventHandlers[event].forEach(function (handler) {
        handler(data);
      });
    }
  },

  bind: function (type, handler) {
    if (!this.eventHandlers[type]) this.eventHandlers[type] = [];
    this.eventHandlers[type].push(handler);
  }
});

GenericTable.active = null;
//GenericTable.presentTables = [];

GenericTable.setSelected = function (instance) {
  if (this.active == instance) return false;

  if (this.active) this.active.trigger('unselected');
  instance.trigger('selected');
  this.active = instance;
};

GenericTable.keyPressed = function (key) {
  if (this.active) {
    this.active.trigger('key.' + key);
  }
};

GenericTable.init = function(node) {
  $u(node).find('table').each(function(i, el) {
    new GenericTable(el);
  });
};

window.GenericTable = global.GenericTable = GenericTable;