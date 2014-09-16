global.Panes.Contents = global.Pane.extend({

  renderTab: function (data, columnTypes) {
    this.columnTypes = columnTypes;
    this.limit = data.limit;
    this.offset = data.offset;

    this.renderData(data);
  },

  renderData: function (data) {
    this.renderViewToPane('content', 'content_tab', {data: data, types: this.columnTypes});

    this.content.find('span.text').bind('dblclick', function(e) {
      $u.stopEvent(e);
      $u(e.target.parentNode).toggleClass('expanded');
    });

    this.footer = this.content.find('.summary-and-pages');

    this.initTables();

    this.totals(function(count) {
      var begin = this.offset;
      var ends = this.offset + this.limit;

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

  nextPage: function(attribute) {
    this.handler.table.getRows(this.offset + this.limit, this.handler.contentTabLimit, function (data) {
      this.limit = data.limit;
      this.offset = data.offset;
      this.renderData(data);
    }.bind(this));
  }

});