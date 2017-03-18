var Client = require('pg').Client;

var filterMatchers = (() => {
  var pgClient = new Client();

  var ev = (value) => {
    return pgClient.escapeLiteral(value).replace(/%/g, '%%');
  };

  var ef = (value) => {
    return pgClient.escapeIdentifier(value).replace(/%/g, '%%');
  };

  var numOrStr = (type, value) => {
    return isNumericType(type) ? value : ev(value);
  };

  var isNumericType = (type) => {
    return type == 'integer';
  };

  var isString = (type) => {
    return type.match(/^character varying.*/);
  };

  var basicValidation = (type, v) => {
    if (v === '') return "Value is required";
    if (isNumericType(type) && v.match(/\D/)) return `Value must be numberic (field type: ${type})`;
    return false;
  };

  var validateNonNumeric = (operation = "like") => {
    return (type, v) => {
      if (isNumericType(type)) {
        return `can not use "${operation}" with numeric types (field type: ${type})`;
      }
      return false;
    };
  }

  return {
    eq: {
      label: '=',
      validate: basicValidation,
      sql: (type, f, v) => {
        return `${ef(f)} = ${numOrStr(type, v)}`;
      },
      
    },
    not_eq: {
      label: '≠',
      validate: basicValidation,
      sql: (type, f, v) => {
        return `${ef(f)} != ${numOrStr(type, v)}`;
      }
    },
    gt: {
      label: '>',
      validate: basicValidation,
      sql: (type, f, v) => {
        return `${ef(f)} > ${numOrStr(type, v)}`;
      }
    },
    lt: {
      label: '<',
      validate: basicValidation,
      sql: (type, f, v) => {
        return `${ef(f)} < ${numOrStr(type, v)}`;
      }
    },
    gte: {
      label: '≥',
      validate: basicValidation,
      sql: (type, f, v) => {
        return `${ef(f)} >= ${numOrStr(type, v)}`;
      }
    },
    lte: {
      label: '≤',
      validate: basicValidation,
      sql: (type, f, v) => {
        return `${ef(f)} <= ${numOrStr(type, v)}`;
      }
    },
    'null': {
      label: 'is null',
      sql: (type, f, v) => {
        return `${ef(f)} is null`;
      }
    },
    not_null: {
      label: 'not null',
      sql: (type, f, v) => {
        return `${ef(f)} is not null`;
      }
    },
    empty: {
      label: 'empty',
      sql: (type, f, v) => {
        if (isNumericType(type)) {
          return `${ef(f)} is null`;
        }
        return `${ef(f)} is null || ${ef(f)} = ''`;
      }
    },
    like: {
      label: 'like',
      validate: validateNonNumeric(),
      sql: (type, f, v) => {
        return `${ef(f)} like ${ev(v)}`;
      }
    },
    not_like: {
      label: 'not like',
      validate: validateNonNumeric(),
      sql: (type, f, v) => {
        return `${ef(f)} not like ${ev(v)}`;
      }
    },
    regexp: {
      label: 'regexp',
      validate: validateNonNumeric("regex"),
      sql: (type, f, v) => {
        return `${ef(f)} ~* ${ev(v)}`;
      }
    },
    starts: {
      label: 'starts',
      validate: validateNonNumeric(),
      sql: (type, f, v) => {
        return `${ef(f)} like ${ev(v + '%')}`;
      }
    },
    ends: {
      label: 'ends',
      validate: validateNonNumeric(),
      sql: (type, f, v) => {
        return `${ef(f)} like ${ev('%' + v)}`;
      }
    },
    contain: {
      label: 'contain',
      validate: validateNonNumeric(),
      sql: (type, f, v) => {
        return `${ef(f)} like ${ev('%' + v + '%')}`;
      }
    },
    custom: {
      label: 'custom',
      validate: (type, v) => {
        if (v === '' && type != 'boolean') {
          return "Value is required";
        }
        return false;
      },
      sql: (type, f, v) => {
        return `${ef(f)} ${v.replace(/%/g, '%%')}`;
      }
    }
  };
})();

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

    this.state = {};

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
      tableType: this.currentTableType,
      state: this.state,
      matchers: filterMatchers
    });

    //console.log("Rendered " + (Date.now() - sTime) + "ms");

    this.content.find('span.text').bind('dblclick', (e) => {
      $u.stopEvent(e);
      $u(e.target.parentNode).toggleClass('expanded');
    });

    //console.log("Expanders " + (Date.now() - sTime) + "ms");

    this.initTables();

    this.initSortable();

    this.initContextMenu();

    this.initFilters();

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
        this.nextPageEl.hide();
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
    try {
      this.handler.table.getRows(this.offset, this.handler.contentTabLimit, this.queryOptions, (data, error) => {
        if (error) {
          alert(error.message);
          App.stopLoading();
          return;
        }
        this.renderPage(data);
        this.scrollToTop();
        App.stopLoading();
        this.content.removeClass('reloading');
      });
    } catch (error) {
      alert(error.message);
      App.stopLoading();
    }
  },

  renderPage(data) {
    this.limit = data.limit;
    this.offset = data.offset;
    this.dataRowsCount = data.rows.length;
    this.renderData(data);
  },

  initSortable() {
    var rotate = {
      '': 'asc',
      'asc': 'desc',
      'desc': ''
    };

    this.content.find('.rescol-wrapper').on('resizable-columns:init', (event) => {

      var cells = this.content.find('table th[sortable]');
      cells.each((i, cell) => {
        cell = $u(cell);
        cell.bind('click', (ev) => {
          var direction = rotate[cell.attr('sortable-dir') || ''];
          this.offset = 0;
          if (direction == '') {
            delete this.queryOptions.sortColumn;
            delete this.queryOptions.sortDirection;
            cells.removeAttr('sortable-dir');
          } else {
            this.queryOptions.sortColumn = cell.attr('sortable');
            this.queryOptions.sortDirection = direction;
            cell.attr('sortable-dir', direction);
          }
          this.reloadData();
        });
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
    table.on('contextmenu', (event) => {
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
      };
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
    var sortedColumns = Object.values(this.columnTypes).sort((a, b) => {
      return (a.ordinal_position > b.ordinal_position) ? 1 : (a.ordinal_position < b.ordinal_position) ? -1 : 0;
    });

    var fields = $u('<tr>').addClass('adding-new-row');
    sortedColumns.forEach((column) => {
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
  },

  initFilters() {
    this.filterField =   this.content.find('[name=filter-field]');
    this.filterMatcher = this.content.find('[name=filter-matcher]');
    this.filterValue =   this.content.find('[name=filter-value]');
    this.filterForm =    this.content.find('.content-filter form');
    this.filterCancel =  this.content.find('.content-filter span.cancel');

    this.filterField.on('change', () => {
      this.state.filterField = this.filterField.val();
    });

    this.filterMatcher.on('change', () => {
      this.state.filterMatcher = this.filterMatcher.val();
    });

    this.filterValue.on('change', () => {
      this.state.filterValue = this.filterValue.val();
    });

    this.filterCancel.on('click', (e) => this.cancelFilters());
    this.filterValue.on('keyup', (event) => {
      if (event.keyCode === 27) { // 27 is esc
        this.cancelFilters();
      }
    });

    this.filterForm.on('submit', (e) => {
      e.preventDefault();

      var value = this.filterValue.val();
      var field = this.filterField.val();
      var dataType = this.columnTypes[field].data_type;
      this.state.filtered = true;

      var m = filterMatchers[this.filterMatcher.val()];
      if (m) {
        if (m.validate) {
          var message = m.validate(dataType, value);
          if (message) {
            alert(message);
            this.filterValue.focus();
            return;
          }
        }
        this.queryOptions.conditions = [m.sql(dataType, this.filterField.val(), value)];
        this.reloadData();
      }
    });
  },

  cancelFilters() {
    this.filterValue.val("").trigger('change');
    if (this.state.filtered) {
      this.state.filtered = false;
      delete this.queryOptions.conditions;
      this.reloadData();
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