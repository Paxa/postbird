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
      this.currentTable = table;
    }
    this.renderData(data);
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
      sorting: {column: this.queryOptions.sortColumn, direction: this.queryOptions.sortDirection}
    });

    //console.log("Rendered " + (Date.now() - sTime) + "ms");

    this.content.find('span.text').bind('dblclick', function(e) {
      $u.stopEvent(e);
      $u(e.target.parentNode).toggleClass('expanded');
    });

    //console.log("Expanders " + (Date.now() - sTime) + "ms");

    this.initTables();

    this.initSortable();

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
    App.startLoading("Getting next page...", 100);
    this.offset += this.limit;
    this.handler.table.getRows(this.offset, this.handler.contentTabLimit, this.queryOptions, function (data) {
      this.renderPage(data);
      this.scrollToTop();
      App.stopLoading();
    }.bind(this));
  },

  prevPage: function () {
    App.startLoading("Getting previous page...", 100);
    this.offset -= this.limit;
    this.handler.table.getRows(this.offset, this.handler.contentTabLimit, this.queryOptions, function (data) {
      this.renderPage(data);
      this.scrollToTop();
      App.stopLoading();
    }.bind(this));
  },

  reloadData: function () {
    this.content.addClass('reloading');

    App.startLoading("Reloading page...", 100);
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
    var cells = this.content.find('table th[sortable]')
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
  }
});