var Client = require('../../../lib/sql_client').Client;
var pgEscape = require('pg-escape');
var electronRemote = require('@electron/remote');
var dom: typeof import('../../../lib/dom') = require('../../../lib/dom');
var formatUtil: typeof import('../../../lib/format_util') = require('../../../lib/format_util');

var typesWithoutQuotes = [
  'bigint', 'integer', 'real', 'smallint', 'double precision', 'numeric', 'decimal',
  'int2vector', 'int4range', 'int8range', 'numrange', 'boolean'
];

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

  //var isString = (type) => {
  //  return type.match(/^character varying.*/);
  //};

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


interface Content_State {
  filtered?: boolean
  filterField?: string
  filterValue?: string
  filterMatcher?: string
}


class Content extends PaneBase {

  
  error: PgError
  pageLimit: number
  columnTypes: Table_ColumnTypes
  queryOptions: Table_getRows_Options
  state: Content_State
  limit: number
  offset: number
  dataRowsCount: number
  currentTable: Array<string | Table>
  totalRows: number | string
  currentTableType: string
  currentData: QueryResult

  footer:        JQuery<HTMLElement>
  nextPageEl:    JQuery<HTMLElement>
  prevPageEl:    JQuery<HTMLElement>
  newRowFields:  JQuery<HTMLElement>

  filterField:   JQuery<HTMLElement>
  filterMatcher: JQuery<HTMLElement>
  filterValue:   JQuery<HTMLElement>
  filterForm:    JQuery<HTMLElement>
  filterCancel:  JQuery<HTMLElement>
  

  renderTab (data, columnTypes, options) {

    if (options.error) {
      this.error = options.error;
      this.renderData(data);
      return;
    } else {
      this.error = null;
    }

    if (options.pageLimit) {
      this.pageLimit = options.pageLimit;
    } else {
      this.pageLimit = this.handler.contentTabLimit;
    }

    this.columnTypes = columnTypes;
    this.queryOptions = options.queryOptions || {};

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

    return this.handler.table.getTableType().then(tableType => {
      this.currentTableType = tableType;
      this.renderData(data);
    });
  }

  renderData (data) {
    if (this.error) {
      var errorMsg = dom.div({ class: 'error' },
        dom.h4("Can not load content"),
        dom.code(
          dom.pre(this.error.toString() + (this.error.hint ? "\n" + this.error.hint : "")),
          this.error.query && dom.pre(`Query: ${this.error.query}`),
          this.error.stack && dom.pre(this.error.stack)
        )
      );

      this.view.setTabContent('content', errorMsg);
      return;
    }
    //var sTime = Date.now();

    this.renderViewToPane('content', 'content_tab', {
      data: data,
      relations: data.relations ? data.relations.hash : [],
      types: this.columnTypes,
      sorting: {column: this.queryOptions.sortColumn, direction: this.queryOptions.sortDirection},
      tableType: this.currentTableType,
      state: this.state,
      matchers: filterMatchers
    });

    this.currentData = data;

    //console.log("Rendered " + (Date.now() - sTime) + "ms");

    // this.content.find('span.text').bind('dblclick', (e) => {
    //   $u.stopEvent(e);
    //   $u(e.target.parentNode).toggleClass('expanded');
    // });

    //console.log("Expanders " + (Date.now() - sTime) + "ms");

    this.initTables();

    this.initSortable();

    this.initContextMenu();

    this.initFilters();

    this.footer = this.content.find('.summary-and-pages');

    this.initFooterResize();

    this.nextPageEl = this.footer.find('.pages.next');
    this.prevPageEl = this.footer.find('.pages.prev');

    var begin = this.offset;
    var ends = this.offset + this.dataRowsCount; //this.limit;

    if (begin > 0) {
      this.prevPageEl.css('display', 'inline-block');
    } else {
      this.prevPageEl.css('display', 'none');
    }

    this.footer.find('.info').text(`Rows ${begin} - ${ends} of ...`);

    this.getTotalRows(count => {
      if (ends == count) {
        this.nextPageEl.hide();
      } else {
        this.nextPageEl.show();
      }

      if (count == '?') {
        count = `<span title="query to count rows took too long">?</span>`
      }
      this.footer.find('.info').html(`Rows ${begin} - ${ends} of ${count}`);
    });

  }

  getTotalRows (callback) {
    if (this.totalRows) {
      callback(this.totalRows);
    } else {
      callback('...');
      this.handler.table.getTotalRows().then(count => {
        this.totalRows = count;
        callback(count);
      }).catch(error => {
        console.log("query error", error);
        this.totalRows = '?';
        callback('?');
      });
    }
  }

  nextPage () {
    App.startLoading("Getting next page...", 100, {
      cancel() {
        App.stopRunningQuery();
      }
    });
    this.offset += this.limit;
    this.handler.table.getRows(this.offset, this.pageLimit, this.queryOptions).then(async data => {
      data.relations = await this.handler.table.getRelations()
      this.renderPage(data);
      this.scrollToTop();
      setTimeout(() => {
        App.stopLoading();
      }, 50);
    });
  }

  prevPage () {
    App.startLoading("Getting previous page...", 100, {
      cancel() {
        App.stopRunningQuery();
      }
    });
    this.offset -= this.limit;
    this.handler.table.getRows(this.offset, this.pageLimit, this.queryOptions).then(async data => {
      data.relations = await this.handler.table.getRelations()
      this.renderPage(data);
      this.scrollToTop();
      setTimeout(() => {
        App.stopLoading();
      }, 50);
    });
  }

  async reloadData () {
    this.content.addClass('reloading');

    App.startLoading("Reloading page...", 100, {
      cancel() {
        App.stopRunningQuery();
      }
    });
    try {
      var data = await this.handler.table.getRows(this.offset, this.pageLimit, this.queryOptions);
      data.relations = await this.handler.table.getRelations();
      delete this.totalRows;
      this.renderPage(data);
      this.scrollToTop();
      App.stopLoading();
      this.content.removeClass('reloading');
    } catch (error) {
      $u.alert(error.message);
    } finally {
      App.stopLoading();
    }
  }

  renderPage (data) {
    this.limit = data.limit;
    this.offset = data.offset;
    this.dataRowsCount = data.rows.length;
    this.renderData(data);
  }

  initSortable () {
    var rotate = {
      '': 'asc',
      'asc': 'desc',
      'desc': ''
    };

    this.content.find('.rescol-wrapper').on('resizable-columns:init', (event) => {

      var cells = this.content.find('table th[sortable]');
      cells.each((i, cellEl) => {
        var cell = $u(cellEl);
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
  }

  initContextMenu () {
    var table = this.content.find('.rescol-content-wrapper table');

    // this may heppen when there is render error
    if (table.length == 0) {
      return;
    }

    // bind for delete button
    if (this.currentTableType == 'BASE TABLE' && !this.isReadOnly()) {
      $u(table).on('generic-table-init', () => {
        var genericTable = GenericTable.getInstance(table);
        genericTable.bind('key.backspace', (event) => {
          this.deleteRow(genericTable.selectedRow);
        });
      });
    }

    table.on('contextmenu', (event) => {
      var genericTable = GenericTable.getInstance(table);

      var el = event.target.tagName == 'TR' ? event.target : $u(event.target).closest('tr')[0];

      GenericTable.setSelected(genericTable);
      genericTable.setSelectedRow(el);
    });

    table.on('click', '.cell-json-badge', (event: any) => {
      event.preventDefault();
      event.stopPropagation();
      var el = event.target.tagName == 'TD' ? event.target : $u(event.target).closest('td')[0];
      this.openJsonViewer(el);
    });

    table.single_double_click_nowait(null, event => {
      if (this.isReadOnly()) return;
      var el = event.target.tagName == 'TD' ? event.target : $u(event.target).closest('td')[0];
      this.editField(el);
    });

    var contextMenuActions: Record<string, any> = {
      'Copy'() {
        window.document.execCommand("copy");
      }
    };

    if (this.currentTableType == 'BASE TABLE' && !this.isReadOnly()) {
      contextMenuActions['sep_edit'] = 'separator';

      contextMenuActions['Edit Value'] = (menuItem, bwin) => {
        var event = table[0].contextmenu.clickEvent;
        var el = event.target.tagName == 'TD' ? event.target : $u(event.target).closest('td')[0];
        this.editField(el);
      };

      contextMenuActions['Delete Row'] = (menuItem, bwin) => {
        var event = table[0].contextmenu.clickEvent;
        var el = event.target.tagName == 'TR' ? event.target : $u(event.target).closest('tr')[0];
        this.deleteRow(el);
      };

      contextMenuActions['Add New Row'] = (menuItem, bwin) => {
        this.addRow();
      };
    }

    contextMenuActions['sep_copy'] = 'separator';

    contextMenuActions['Copy Row as JSON'] = (menuItem, bwin) => {
      var event = table[0].contextmenu.clickEvent;
      var el = (event.target.tagName == 'TR' ? event.target : $u(event.target).closest('tr')[0]) as HTMLElement;
      this.copyRowAsJson(el);
    };

    contextMenuActions['Copy Row as Markdown'] = (menuItem, bwin) => {
      var event = table[0].contextmenu.clickEvent;
      var el = (event.target.tagName == 'TR' ? event.target : $u(event.target).closest('tr')[0]) as HTMLElement;
      this.copyRowAsMarkdown(el);
    };

    if (this.currentTableType == 'BASE TABLE') {
      contextMenuActions['Copy Row as SQL'] = (menuItem, bwin) => {
        var event = table[0].contextmenu.clickEvent;
        var el = (event.target.tagName == 'TR' ? event.target : $u(event.target).closest('tr')[0]) as HTMLElement;
        this.copyRowAsSql(el);
      };
    }

    contextMenuActions['Copy Column as IN (...)'] = (menuItem, bwin) => {
      var event = table[0].contextmenu.clickEvent;
      var el = (event.target.tagName == 'TD' || event.target.tagName == 'TH' ? event.target : $u(event.target).closest('td, th')[0]) as HTMLElement;
      this.copyColumnAsInClause(el);
    };

    contextMenuActions['sep_all'] = 'separator';

    contextMenuActions['Copy All Loaded as JSON'] = () => {
      this.copyAllLoadedAsJson();
    };

    contextMenuActions['Copy All Loaded as Markdown'] = () => {
      this.copyAllLoadedAsMarkdown();
    };

    $u.contextMenu(table, contextMenuActions, {
      // if text is not selected - disable copy button
      onShow: (event, contextmenu) => {
        var isTextSelected = window.getSelection().toString() != "";
        var target = event.target as HTMLElement;
        var isRow = Boolean(target && (target.tagName === 'TR' || $u(target).closest('tbody tr').length));
        var isCell = Boolean(target && (target.tagName === 'TD' || target.tagName === 'TH' || $u(target).closest('td, th').length));

        contextmenu.items.forEach(item => {
          if (item.label == "Copy") {
            item.enabled = isTextSelected;
          }
          if (item.label && item.label.startsWith("Copy Row")) {
            item.enabled = isRow;
          }
          if (item.label && item.label.startsWith("Copy Column")) {
            item.enabled = isCell;
          }
        });
      }
    });

    if (this.currentTableType == 'BASE TABLE' && !this.isReadOnly()) {
      // Prevent table headers from bubbling to this.content's 'Add New Row'
      this.content.find('.rescol-header-wrapper').on('contextmenu', (e: any) => {
        e.preventDefault();
        e.stopPropagation();
      });

      // for empty area when table is empty
      $u.contextMenu(this.content, {
        'Add New Row': () => {
          this.addRow();
        }
      });
    }
  }

  // Move footer according to left sidebar resize
  initFooterResize() {
    if (!this.footer[0]) {
      return;
    }
    this.footer[0].style.marginLeft = '' + (this.handler.view.sidebarResizer.currentWith - 1) + 'px';
    this.handler.view.content.on('sidebar-resize', (e, newWidth) => {
      this.footer[0].style.marginLeft = '' + (newWidth - 1) + 'px';
    })
  }

  async deleteRow (row) {
    if (this.isReadOnly()) {
      $u.alert("Read-only mode active: deleting rows is disabled");
      return;
    }
    if (this.currentTableType != 'BASE TABLE') {
      $u.alert("Can't delete from " + this.currentTableType);
    }
    if (confirm("Are you sure want to delete this row?")) {
      var ctid = $u(row).attr('data-ctid');
      try {
        await this.handler.table.deleteRowByCtid(ctid);
        this.reloadData();
      } catch (error) {
        $u.alert(error.message);
      }
    }
  }

  copyRowAsSql (row) {
    var ctid = $u(row).attr('data-ctid');
    var selectedRow = this.currentData.rows.find(row => {
      return row.ctid == ctid;
    });

    var fieldNames = []
    var escapedValues = [];

    this.currentData.fields.forEach(field => {
      var fieldName = field.name;
      if (fieldName != 'ctid') {
        fieldNames.push(fieldName);
        var colType = this.columnTypes[fieldName].data_type;
        var escapedValue = this.valueToSqlInsert(selectedRow[fieldName], colType, false);
        escapedValues.push(escapedValue);
      }
    })
    var joinedFields = fieldNames.map(f => '"' + f + '"').join(", ");
    var joinedValues = escapedValues.join(", ");
    var sql = `INSERT INTO "${this.handler.currentSchema}"."${this.handler.currentTable}" (${joinedFields}) VALUES (${joinedValues})`;
    console.log("Insert SQL", sql);
    formatUtil.copyToClipboard(sql);
    if (window.alertify && typeof window.alertify.success === 'function') {
      window.alertify.success('Row copied as SQL INSERT');
    }
  }

  copyRowAsJson (row: HTMLElement) {
    if (!row || !this.currentData || !this.currentData.rows) return;
    var ctid = (row.getAttribute && row.getAttribute('data-ctid')) || (row as any).dataset?.ctid || ($u(row).attr ? $u(row).attr('data-ctid') : null);
    var selectedRow = this.currentData.rows.find((r: any) => r.ctid == ctid);
    if (!selectedRow) return;

    var json = formatUtil.rowToJson(this.currentData.fields, selectedRow);
    formatUtil.copyToClipboard(json);
    if (window.alertify && typeof window.alertify.success === 'function') {
      window.alertify.success('Row copied as JSON');
    }
  }

  copyRowAsMarkdown (row: HTMLElement) {
    if (!row || !this.currentData || !this.currentData.rows) return;
    var ctid = (row.getAttribute && row.getAttribute('data-ctid')) || (row as any).dataset?.ctid || ($u(row).attr ? $u(row).attr('data-ctid') : null);
    var selectedRow = this.currentData.rows.find((r: any) => r.ctid == ctid);
    if (!selectedRow) return;

    var md = formatUtil.rowsToMarkdown(this.currentData.fields, [selectedRow]);
    formatUtil.copyToClipboard(md);
    if (window.alertify && typeof window.alertify.success === 'function') {
      window.alertify.success('Row copied as Markdown');
    }
  }

  copyColumnAsInClause (cell: HTMLElement) {
    if (!cell || !this.currentData || !this.currentData.rows || !this.currentData.rows.length) return;
    var position = typeof (dom as any).elementIndex === 'function' ? (dom as any).elementIndex(cell) : ($u(cell).prevAll ? $u(cell).prevAll('td, th').length : 0);
    var cleanFields = this.currentData.fields.filter((f: any) => f.name != 'ctid');
    var fieldDef = cleanFields[position];
    if (!fieldDef) return;

    var colName = fieldDef.name;
    var values = this.currentData.rows.map((r: any) => r[colName]);
    var inClause = formatUtil.columnToInClause(values);
    formatUtil.copyToClipboard(inClause);
    if (window.alertify && typeof window.alertify.success === 'function') {
      window.alertify.success(`Copied column "${colName}" as IN (...) (${values.length} rows)`);
    }
  }

  copyAllLoadedAsJson () {
    if (!this.currentData || !this.currentData.rows || !this.currentData.rows.length) {
      if (window.alertify && typeof window.alertify.log === 'function') {
        window.alertify.log('No rows loaded to copy');
      }
      return;
    }
    var json = formatUtil.rowsToJson(this.currentData.fields, this.currentData.rows);
    formatUtil.copyToClipboard(json);
    if (window.alertify && typeof window.alertify.success === 'function') {
      window.alertify.success(`Copied ${this.currentData.rows.length} rows as JSON`);
    }
  }

  copyAllLoadedAsMarkdown () {
    if (!this.currentData || !this.currentData.rows || !this.currentData.rows.length) {
      if (window.alertify && typeof window.alertify.log === 'function') {
        window.alertify.log('No rows loaded to copy');
      }
      return;
    }
    var md = formatUtil.rowsToMarkdown(this.currentData.fields, this.currentData.rows);
    formatUtil.copyToClipboard(md);
    if (window.alertify && typeof window.alertify.success === 'function') {
      window.alertify.success(`Copied ${this.currentData.rows.length} rows as Markdown`);
    }
  }

  valueToSqlInsert(value, colType, insideArray = false) {
    if (value === null) {
      return 'NULL';
    }
    var isArray = colType.endsWith("[]") || Array.isArray(value);
    if (isArray) {
      var arrayElements = value.map(elementVal => {
        return this.valueToSqlInsert(elementVal, colType.replace(/\[\]$/, ''), true);
      })
      if (insideArray) {
        return `[${arrayElements.join(", ")}]`;
      } else {
        return `ARRAY [${arrayElements.join(", ")}]`;
      }
    } else if (typesWithoutQuotes.includes(colType)) {
      return value;
    } else if (colType == 'json' || colType == 'jsonb') {
      if (insideArray) {
        return `'${pgEscape.string(JSON.stringify(value))}'::${colType}`;
      } else {
        return `'${pgEscape.string(JSON.stringify(value))}'`;
      }
    } else {
      if (typeof value == 'string') {
        return pgEscape('%L', value)
      } else if (colType.startsWith('timestamp') && (value.origValueString || typeof value.toISOString == 'function')) {
        return `'${pgEscape.string(value.origValueString || value.toISOString())}'`;
      } else {
        return `'${pgEscape.string(value)}'`;
      }
    }
  }

  async editField (field) {
    if (this.isReadOnly()) {
      $u.alert("Read-only mode active: editing values is disabled");
      return;
    }
    var position = $u(field).prevAll('td').length;
    var ctid = $u(field).closest('tr').attr('data-ctid');

    var fieldDef = this.currentData.fields.filter(f => f.name != 'ctid')[position];
    var fieldName = field && fieldDef.name;

    var fieldType = this.columnTypes[fieldName];

    var isJson = fieldType && (
      fieldType.data_type === 'json' ||
      fieldType.data_type === 'jsonb' ||
      fieldType.udt_name === 'json' ||
      fieldType.udt_name === 'jsonb'
    );

    if (isJson) {
      this.openJsonViewer(field, { editMode: true });
      return;
    }

    var value = null;
    this.currentData.rows.forEach((row, index) => {
      if (row.ctid == ctid) {
        value = row[fieldName];
      }
    });

    //global.editValue = value;

    const sanitizeUpdateValue = (dataType, stringValue) => {
      const bracket = (v) => "{" + v + "}"
      const quote =  (v) => "\"" + v + "\""
      if (/^jsonb?\[\]$/.test(dataType)) {
        const jsonArray = JSON.parse(stringValue)
        return  bracket(jsonArray.map(json => quote(JSON.stringify(json).replace(/"/g, '\\"'))).toString())
      } else if (/^character varying\(\d+\)\[\]$/.test(dataType)) {
        return bracket(JSON.parse(stringValue).toString())
      }
      return stringValue
    }

    var dialog = new Dialog.EditValue(this.handler, {
      value: value,
      fieldName: fieldName,
      fieldType: fieldType,
      onSave: async (value, isNull) => {
        App.startLoading(`Updating value for ${fieldName}...`);
        try {
          const sanitizedValue = sanitizeUpdateValue(fieldType.data_type, value)
          var result = await this.handler.table.updateValue(ctid, fieldName, sanitizedValue, isNull, fieldType.data_type);
          dialog.close();
          if (result.rowCount == 0) {
            $u.alertError("No records updated, probably table content was changed since you started editing.",
              {detail: "Try to refresh content and edit again"}
            );
          }
        } catch (error) {
          console.error(error);
          $u.alertSqlError("Error while updating value", error);
          return;
        } finally {
          App.stopLoading();
        }
        await this.reloadData();
        //this.content.find(`.rescol-content-wrapper table tbody:nth-child(${valueIndex + 1})`).click();
      }
    });
  }

  openJsonViewer (field: HTMLElement, options: { editMode?: boolean } = {}) {
    var position = $u(field).prevAll('td').length;
    var ctid = $u(field).closest('tr').attr('data-ctid');

    var fieldDef = this.currentData.fields.filter(f => f.name != 'ctid')[position];
    var fieldName = field && fieldDef ? fieldDef.name : '';
    var fieldType = this.columnTypes[fieldName] || { data_type: 'json', udt_name: 'json' };

    var value = null;
    this.currentData.rows.forEach(row => {
      if (row.ctid == ctid) {
        value = row[fieldName];
      }
    });

    var isReadOnly = this.isReadOnly() || options.editMode === false;

    var dialog = new Dialog.JsonViewer(this.handler, {
      fieldName: fieldName,
      fieldType: fieldType,
      value: value,
      readOnly: isReadOnly,
      onSave: async (newValue: string | null, isNull: boolean) => {
        App.startLoading(`Updating JSON for ${fieldName}...`);
        try {
          var sanitizedValue = isNull ? null : (typeof newValue === 'string' ? newValue : JSON.stringify(newValue));
          var result = await this.handler.table.updateValue(ctid, fieldName, sanitizedValue, isNull, fieldType.data_type);
          dialog.close();
          if (result.rowCount == 0) {
            $u.alertError("No records updated, probably table content was changed since you started editing.",
              { detail: "Try to refresh content and edit again" }
            );
          }
        } catch (error) {
          console.error(error);
          $u.alertSqlError("Error while updating JSON value", error);
          return;
        } finally {
          App.stopLoading();
        }
        await this.reloadData();
      }
    });
  }

  async viewForeign (schema, table, column, value) {
    var foreign = await this.handler.loadForeignRows(schema, table, column, value);

    new Dialog.RelatedRecords(this.handler, foreign, {
      schema: schema,
      table: table,
      column: column,
      value: value
    });
  }

  addRow () {
    if (this.isReadOnly()) {
      $u.alert("Read-only mode active: adding rows is disabled");
      return;
    }
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
      var input = dom.input({ fieldname: column.column_name, type: inputType });
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
  }

  async saveNewRow () {
    var data = {};
    this.newRowFields.find('input').each((i, el) => {
      var field = el.getAttribute('fieldname');
      if (el.value === '') {
        console.log("Skip while inserting column '" + field + "' with empty value");
      } else {
        data[field] = el.value;
      }
    });

    try {
      await this.handler.table.insertRow(data, this.columnTypes);
      this.newRowFields.remove();
      this.reloadData();
    } catch (error) {
      $u.alert(error.message);
    }
  }

  cancelNewRow () {
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

  initFilters () {
    this.filterField =   this.content.find('[name=filter-field]');
    this.filterMatcher = this.content.find('[name=filter-matcher]');
    this.filterValue =   this.content.find('[name=filter-value]');
    this.filterForm =    this.content.find('.content-filter form');
    this.filterCancel =  this.content.find('.content-filter span.cancel');

    this.filterField.on('change', () => {
      this.state.filterField = this.filterField.val().toString();
    });

    this.filterMatcher.on('change', () => {
      this.state.filterMatcher = this.filterMatcher.val().toString();
    });

    this.filterValue.on('change', () => {
      this.state.filterValue = this.filterValue.val().toString();
    });

    this.filterCancel.on('click', (e) => this.cancelFilters());
    this.filterValue.on('keyup', (event) => {
      if (event.keyCode === 27) { // 27 is esc
        this.cancelFilters();
      }
    });

    this.filterForm.on('submit', (e) => {
      e.preventDefault();

      var value = this.filterValue.val().toString();
      var field = this.filterField.val().toString();
      var dataType = this.columnTypes[field].data_type;
      this.state.filtered = true;

      var m = filterMatchers[this.filterMatcher.val().toString()];
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
  }

  setFilter (field, matcher, value) {
    this.filterField.val(field).change();
    this.filterMatcher.val(matcher).change();
    this.filterValue.val(value).change();
    this.state.filtered = true;
    this.content.find('.content-filter').attr('filtered', 'filtered');
  }

  cancelFilters () {
    this.filterValue.val("").trigger('change');
    if (this.state.filtered) {
      this.state.filtered = false;
      delete this.queryOptions.conditions;
      this.reloadData();
    }
  }

  static filterSql (column, matcher, value) {
    var m = filterMatchers[matcher];
    return m.sql('string', column, value);
  }

  static insertSnippet (sql) {
    var tab = App.currentTab.instance;
    if (tab.currentTab != "query") {
      tab.view.showTab("query")
    }

    electronRemote.app.mainWindow.focus();
    tab.view.queryPane.appendText(sql, 2);
  }
}


declare var Content__: typeof Content


module.exports = Content;
