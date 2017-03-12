global.Panes.Contents = global.Pane.extend({

  renderTab(data, columnTypes, error) {
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

    this.handler.table.getTableType((tableType) => {
      this.currentTableType = tableType;
      this.renderData(data);
    });
  },

  renderData(data) {
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

    this.initTables();

    this.initSortable();

    this.initContextMenu();

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

    this.totals((count) => {
      if (ends == count) {
        this.nextPageEl.hide('inline-block');
      } else {
        this.nextPageEl.show();
      }

      this.footer.find('.info').text("Rows " + begin + " - " + ends + " of " + count);
    });

  },

  totals(callback) {
    if (this.totalRows) {
      callback(this.totalRows);
    } else {
      this.handler.table.getTotalRows((count) => {
        this.totalRows = count;
        callback(count);
      });
    }
  },

  nextPage() {
    App.startLoading("Getting next page...", 100, {
      cancel() {
        App.stopRunningQuery();
      }
    });
    this.offset += this.limit;
    this.handler.table.getRows(this.offset, this.handler.contentTabLimit, this.queryOptions, (data) => {
      this.renderPage(data);
      this.scrollToTop();
      App.stopLoading();
    });
  },

  prevPage() {
    App.startLoading("Getting previous page...", 100, {
      cancel() {
        App.stopRunningQuery();
      }
    });
    this.offset -= this.limit;
    this.handler.table.getRows(this.offset, this.handler.contentTabLimit, this.queryOptions, (data) => {
      this.renderPage(data);
      this.scrollToTop();
      App.stopLoading();
    });
  },

  reloadData() {
    this.content.addClass('reloading');

    App.startLoading("Reloading page...", 100, {
      cancel() {
        App.stopRunningQuery();
      }
    });
    this.handler.table.getRows(this.offset, this.handler.contentTabLimit, this.queryOptions, (data) => {
      this.renderPage(data);
      this.scrollToTop();
      App.stopLoading();
      this.content.removeClass('reloading');
    });
  },

  renderPage(data) {
    this.limit = data.limit;
    this.offset = data.offset;
    this.dataRowsCount = data.rows.length;
    this.renderData(data);
  },

  initSortable() {
    var cells = this.content.find('table th[sortable]');
    cells.each((i, cell) => {
      cell = $u(cell);
      cell.bind('click', (ev) => {
        var direction = cell.attr('sortable-dir') == 'asc' ? 'desc' : 'asc';
        if (this.queryOptions.sortColumn && this.queryOptions.sortColumn != cell.attr('sortable')) {
          this.offset = 0;
        }
        this.queryOptions.sortColumn = cell.attr('sortable');
        this.queryOptions.sortDirection = direction;
        cells.removeAttr('sortable-dir');
        cell.attr('sortable-dir', direction);
        this.reloadData();
      });
    });
  },

  initContextMenu(event) {
    var table = this.content.find('.rescol-content-wrapper table');

    // bind for delete button
    if (this.currentTableType == 'BASE TABLE') {
      $u(table).on('generic-table-init', () => {
        var genericTable = table.data('generic_table');
        genericTable.bind('key.backspace', (event) => {
          this.deleteRow(genericTable.selectedRow);
        });
      });
    }

    var _this = this;
    table.on('contextmenu', function(event) {
      var genericTable = table.data('generic_table');

      var el = event.target.tagName == 'TR' ? event.target : $u(event.target).closest('tr')[0];

      GenericTable.setSelected(genericTable);
      genericTable.setSelectedRow(el);
    });

    var contextMenuActions = {
      'Copy'() {
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

  deleteRow(row) {
    if (this.currentTableType != 'BASE TABLE') {
      alert("Can't delete from " + this.currentTableType);
    }
    if (confirm("Are you sure wanna delete row?")) {
      var ctid = $u(row).attr('data-ctid');
      this.handler.table.deleteRowByCtid(ctid, (result, error) => {
        if (error) {
          alert(error.message);
        }
        if (result) {
          this.reloadData();
        }
      });
    }
  },

  addRow() {
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

    this.newRowFields.find('input').on('keypress', (event) => {
      if (event.keyCode === 13) { // 13 is enter
        this.saveNewRow();
      }
    });

    this.newRowFields.find('input').on('keyup', (event) => {
      if (event.keyCode === 27) { // 27 is esc
        this.cancelNewRow();
      }
    });
  },

  saveNewRow() {
    var data = {};
    this.newRowFields.find('input').each((i, el) => {
      var field = el.getAttribute('fieldname');
      if (el.value === '') {
        console.log("Skip while inserting column '" + field + "' with empty value");
      } else {
        data[field] = el.value;
      }
    });

    this.handler.table.insertRow(data, (result, error) => {
      if (error) {
        alert(error.message);
      }
      if (result) {
        this.newRowFields.remove();
        this.reloadData();
      }
    });
  },

  cancelNewRow() {
    var nonEmptyValue = [];
    this.newRowFields.find('input').forEach((input) => {
      if (input.value && input.value !== '') {
        nonEmptyValue.push(input.value);
      }
    });
    if (nonEmptyValue.length) {
      if (confirm("Remove unsaved row?")) {
        this.newRowFields.remove();
      }
    } else {
      this.newRowFields.remove();
    }
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