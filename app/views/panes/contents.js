global.Panes.Contents = global.Pane.extend({

  renderTab: function (data, columnTypes, error) {
    this.columnTypes = columnTypes;
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
    this.renderViewToPane('content', 'content_tab', {data: data, types: this.columnTypes});

    //console.log("Rendered " + (Date.now() - sTime) + "ms");

    this.content.find('span.text').bind('dblclick', function(e) {
      $u.stopEvent(e);
      $u(e.target.parentNode).toggleClass('expanded');
    });

    //console.log("Expanders " + (Date.now() - sTime) + "ms");

    this.initTables();

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
    this.handler.table.getRows(this.offset + this.limit, this.handler.contentTabLimit, function (data) {
      this.renderPage(data);
      this.scrollToTop();
      App.stopLoading();
    }.bind(this));
  },

  prevPage: function () {
    App.startLoading("Getting previous page...", 100);
    this.handler.table.getRows(this.offset - this.limit, this.handler.contentTabLimit, function (data) {
      this.renderPage(data);
      this.scrollToTop();
      App.stopLoading();
    }.bind(this));
  },

  renderPage: function (data) {
    this.limit = data.limit;
    this.offset = data.offset;
    this.dataRowsCount = data.rows.length;
    this.renderData(data);
  },
});