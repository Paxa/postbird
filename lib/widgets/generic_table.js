var GenericTable = new Widget({
  init: function (element) {
    this.rows = this.find('tr');
    var _this = this;
    this.rows.each(function (i, row) {
      $u(row).bind('click', function (event) {
        _this.onRowClick(row);
      })
    })
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
    $u(row).addClass('selected');
  },
});

GenericTable.init = function(node) {
  $u(node).find('table').each(function(i, el) {
    new GenericTable(el);
  });
};

window.GenericTable = global.GenericTable = GenericTable;