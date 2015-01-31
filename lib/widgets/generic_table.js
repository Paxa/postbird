var GenericTable = new Widget({
  init: function (element) {
    this.rows = this.find('tr');
    var _this = this;
    this.rows.each(function (i, row) {
      $u(row).bind('click', function (event) {
        _this.onRowClick(row);
      });
    });

    window.Mousetrap.bind("down", function () {
      this.selectNextRow();
      return false;
    }.bind(this));

    window.Mousetrap.bind("up", function () {
      this.selectPrevRow();
      return false;
    }.bind(this));
  },

  onRowClick: function (row) {
    if (this.selectedRow == row) {
      $u(this.selectedRow).removeClass('selected');
      return;
    }

    if (this.selectedRow) {
      $u(this.selectedRow).removeClass('selected');
    }

    this.selectedRow = row;
    console.log('selected', this.selectedRow);
    $u(row).addClass('selected');
  },

  selectNextRow: function () {
    console.log('selected', this.selectedRow, this);
    if (this.selectedRow) {
      var newNext = $u(this.selectedRow).next('tr')[0];
      console.log('new next', newNext);
    }
  }
});

GenericTable.init = function(node) {
  $u(node).find('table').each(function(i, el) {
    new GenericTable(el);
  });
};

window.GenericTable = global.GenericTable = GenericTable;