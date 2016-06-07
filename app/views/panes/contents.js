global.Panes.Contents = global.Pane.extend({

  renderTab: function (data, columnTypes, error) {
    this.columnTypes = columnTypes;
    this.queryOptions = {
      with_oid: !!columnTypes.oid
    };
    this.error = error;
    if (data) {
      this.limit = data.limit;
      this.offset = data.offset;
      this.dataRowsCount = data.rows.length;
    }

    var table = [this.handler.database, this.handler.table];
    if (this.currentTable != table) {
      delete this.totalRows;
      delete this.currentTableType;
      this.currentTable = table;
    }

    this.handler.table.getTableType(function(tableType) {
      this.currentTableType = tableType;
      this.renderData(data);
    }.bind(this));
  },

  renderData: function (data) {
    if (this.error) {
      var errorMsg = $dom(['div.error',
        ['h4', "Error happen"],
        ['code', ['pre', this.error.toString()]]
      ]);

      this.view.setTabContent('content', errorMsg);
      return;
    }
    var sTime = Date.now();
    this.renderViewToPane('content', 'content_tab', {
      data: data,
      types: this.columnTypes,
      sorting: {column: this.queryOptions.sortColumn, direction: this.queryOptions.sortDirection},
      tableType: this.currentTableType
    });

    //console.log("Rendered " + (Date.now() - sTime) + "ms");

    this.content.find('span.text').bind('dblclick', function(e) {
      $u.stopEvent(e);
      $u(e.target.parentNode).toggleClass('expanded');
    });

    //console.log("Expanders " + (Date.now() - sTime) + "ms");

    //this.initTables();

    this.initSortable();

    this.initContextMenu();

    new ResizableColumns(this.content.find('.rescol-wrapper'));

    this.footer = this.content.find('.summary-and-pages');

    this.nextPageEl = this.footer.find('.pages.next');
    this.prevPageEl = this.footer.find('.pages.prev');

    var begin = this.offset;
    var ends = this.offset + this.dataRowsCount; //this.limit;

    if (begin > 0) {
      this.prevPageEl.css('display', 'inline-block');
    } else {
      this.prevPageEl.css('display', 'none');
    }

    this.totals(function(count) {
      if (ends == count) {
        this.nextPageEl.hide('inline-block');
      } else {
        this.nextPageEl.show();
      }

      this.footer.find('.info').text("Rows " + begin + " - " + ends + " of " + count);
    }.bind(this));

  },

  totals: function (callback) {
    if (this.totalRows) {
      callback(this.totalRows);
    } else {
      this.handler.table.getTotalRows(function(count) {
        this.totalRows = count;
        callback(count);
      }.bind(this));
    }
  },

  nextPage: function () {
    App.startLoading("Getting next page...", 100, {
      cancel: function () {
        App.stopRunningQuery();
      }
    });
    this.offset += this.limit;
    this.handler.table.getRows(this.offset, this.handler.contentTabLimit, this.queryOptions, function (data) {
      this.renderPage(data);
      this.scrollToTop();
      App.stopLoading();
    }.bind(this));
  },

  prevPage: function () {
    App.startLoading("Getting previous page...", 100, {
      cancel: function () {
        App.stopRunningQuery();
      }
    });
    this.offset -= this.limit;
    this.handler.table.getRows(this.offset, this.handler.contentTabLimit, this.queryOptions, function (data) {
      this.renderPage(data);
      this.scrollToTop();
      App.stopLoading();
    }.bind(this));
  },

  reloadData: function () {
    this.content.addClass('reloading');

    App.startLoading("Reloading page...", 100, {
      cancel: function () {
        App.stopRunningQuery();
      }
    });
    this.handler.table.getRows(this.offset, this.handler.contentTabLimit, this.queryOptions, function (data) {
      this.renderPage(data);
      this.scrollToTop();
      App.stopLoading();
      this.content.removeClass('reloading');
    }.bind(this));
  },

  renderPage: function (data) {
    this.limit = data.limit;
    this.offset = data.offset;
    this.dataRowsCount = data.rows.length;
    this.renderData(data);
  },

  initSortable: function () {
    var cells = this.content.find('table th[sortable]');
    cells.each(function (i, cell) {
      cell = $u(cell);
      cell.bind('click', function (ev) {
        var direction = cell.attr('sortable-dir') == 'asc' ? 'desc' : 'asc';
        if (this.queryOptions.sortColumn && this.queryOptions.sortColumn != cell.attr('sortable')) {
          this.offset = 0;
        }
        this.queryOptions.sortColumn = cell.attr('sortable');
        this.queryOptions.sortDirection = direction;
        cells.removeAttr('sortable-dir');
        cell.attr('sortable-dir', direction);
        this.reloadData();
      }.bind(this));
    }.bind(this));
  },

  initContextMenu: function (event) {
    var table = this.content.find('table');

    // bind for delete button
    if (this.currentTableType == 'BASE TABLE') {
      $u(table).on('generic-table-init', function () {
        var genericTable = table.data('generic_table');
        genericTable.bind('key.backspace', function (event) {
          this.deleteRow(genericTable.selectedRow);
        }.bind(this));
      }.bind(this));
    }

    var _this = this;
    table.on('contextmenu', function(event) {
      var genericTable = table.data('generic_table');

      var el = event.target.tagName == 'TR' ? event.target : $u(event.target).closest('tr')[0];

      GenericTable.setSelected(genericTable);
      genericTable.setSelectedRow(el);
    });

    var contextMenuActions = {
      'Copy': function () {
        window.document.execCommand("copy");
      }
    };
    if (this.currentTableType == 'BASE TABLE') {
      contextMenuActions['Delete Row'] = function (menuItem, bwin) {
        var event = table[0].contextmenu.clickEvent;
        var el = event.target.tagName == 'TR' ? event.target : $u(event.target).closest('tr')[0];
        this.deleteRow(el);
      }.bind(this);
    }
    $u.contextMenu(table, contextMenuActions);
  },

  deleteRow: function (row) {
    if (this.currentTableType != 'BASE TABLE') {
      alert("Can't delete from " + this.currentTableType);
    }
    if (confirm("Are you sure wanna delete row?")) {
      var ctid = $u(row).attr('data-ctid');
      this.handler.table.deleteRowByCtid(ctid, function (result, error) {
        if (error) {
          alert(error.message);
        }
        if (result) {
          this.reloadData();
        }
      }.bind(this));
    }
  },

  addRow: function () {
    var container = this.content.find('table tbody');
    var sortedColumns = Object.values(this.columnTypes).sort(function (a, b) {
      return (a.ordinal_position > b.ordinal_position) ? 1 : (a.ordinal_position < b.ordinal_position) ? -1 : 0;
    });

    var fields = $u('<tr>').addClass('adding-new-row');
    sortedColumns.forEach(function (column) {
      var inputType = 'text';
      if (column.data_type == 'real' || column.data_type == 'smallint' || column.data_type == 'numeric') {
        inputType = 'number';
      }
      var input = $dom(['input', {fieldname: column.column_name, type: inputType}]);
      fields.append($u('<td>').append(input));
    });

    this.newRowFields = fields;
    container.append(fields);
    fields.find('input')[0].focus();

    this.newRowFields.find('input').bind('keypress', function (event) {
      if (event.keyCode === 13) { // 13 is enter
        this.saveNewRow();
      }
    }.bind(this));
  },

  saveNewRow: function () {
    var data = {};
    this.newRowFields.find('input').each(function (i, el) {
      var field = el.getAttribute('fieldname');
      if (el.value === '') {
        console.log("Skip while inserting column '" + field + "' with empty value");
      } else {
        data[field] = el.value;
      }
    }.bind(this));

    this.handler.table.insertRow(data, function (result, error) {
      if (error) {
        alert(error.message);
      }
      if (result) {
        this.newRowFields.remove();
        this.reloadData();
      }
    }.bind(this));
  }
});

global.Panes.Contents.insertSnippet = function (sql) {
  var tab = App.currentTab.instance;
  if (tab.currentTab != "query") {
    tab.view.showTab("query")
  }

  electron.remote.BrowserWindow.mainWindow.focus();
  tab.view.query.appendText(sql, 2);
};