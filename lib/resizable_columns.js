class ResizableColumns {
  /*::
  startTime: Date
  wrapper: JQuery<HTMLElement>
  contentWrapper: JQuery<HTMLElement>
  headerWrapper: JQuery<HTMLElement>
  contentTable: JQuery<HTMLElement>
  headerTable: JQuery<HTMLElement>
  lastHeaderCell: JQuery<HTMLElement>
  lastContentCell: JQuery<HTMLElement>
  fullWidth: boolean
  columnWidths: number[]
  resizers: JQuery<HTMLElement>[]
  */
  constructor(element) {
    this.startTime = new Date();

    this.wrapper = $(element);
    this.contentWrapper = this.wrapper.find('.rescol-content-wrapper');
    this.headerWrapper = this.wrapper.find('.rescol-header-wrapper');
    this.contentTable = this.contentWrapper.find('table');

    if (this.contentTable.length == 0) {
      console.log(element);
      throw new Error("Can not find table inside .rescol-content-wrapper");
    }

    if (this.headerWrapper.length == 0) {
      this.headerWrapper = $("<div>").addClass('.rescol-header-wrapper');
      this.wrapper.prepend(this.headerWrapper);
    }

    if (this.contentWrapper.find('th').length == 0) {
      console.log('table without headers');
      return;
    }

    this.fullWidth = !!this.wrapper[0].getAttribute('full-width');

    // this.setFullWidth()
    this.measureTime('setFullWidth', () => this.setFullWidth());

    this.measureTime('createHeaders', () => this.createHeaders());
    //this.createHeaders();

    // this.setFullWidth()
    this.measureTime('addLastCell', () => this.addLastCell());

    this.measureTime('addDraggers', () => this.addDraggers());
    //this.addDraggers();

    //console.log("Init sec", ((new Date()) - this.startTime) / 1000);
    this.wrapper.trigger('resizable-columns:init');
  }

  measureTime(title, callback) {
    //var startTime = new Date();
    callback();
    //console.log(title + " sec", ((new Date()) - startTime) / 1000);
  }

  setFullWidth() {
    this.wrapper.css('width', '20000px');
    //this.contentTable.css('width', '');
    var naturalWidth = this.contentTable.outerWidth();

    this.contentTable.css('width', `${naturalWidth}px`);
    this.wrapper.css('width', '');

    this.columnWidths = [];

    this.contentTable.find('th').each((i, thEl) => {
      var th = $(thEl);
      this.columnWidths[i] = th.outerWidth();

      var w = th.width();
      th.css('width', w == 0 ? 0.001 : w);
    });

    //this.element.css('width', '');
    this.contentTable.css('table-layout', 'fixed');


    /*
    // not working yet
    if (this.fullWidth && this.headerWrapper.outerWidth() / naturalWidth > 1.3) {
      var extend = Math.min(this.headerWrapper.outerWidth() * 0.3, naturalWidth * 0.1);
      var ratio = (naturalWidth + extend) / naturalWidth;

      console.log(extend, ratio);

      this.contentTable.find('th').each((i, th) => {
        th = $(th);
        this.columnWidths[i] *= ratio;

        th.css('width', `${this.columnWidths[i]}px`);
      });

      this.contentTable.css('width', `${naturalWidth + extend}px`);

      console.log(this.columnWidths);
    }
    */
  }

  createHeaders() {
    this.headerTable = $('<table>').attr('class', this.contentTable[0].className);
    this.headerTable[0].setAttribute('style', this.contentTable[0].getAttribute('style'));
    this.headerTable.addClass('shadow-headers');
    this.headerTable.html(this.contentTable.find('thead').html());

    this.headerWrapper.prepend(this.headerTable);

    //var headerHeight = table.outerHeight();
    //this.wrapper.css('padding-top', '' + headerHeight + 'px');
    //this.contentWrapper.css('margin-top', '-' + headerHeight + 'px');

    //window.addEventListener('scroll', function(e) {
    this.contentWrapper.scroll(() => {
      this.headerWrapper[0].scrollLeft = this.contentWrapper[0].scrollLeft;
    });
  }

  addLastCell() {
    if (this.fullWidth) {
      this.lastHeaderCell = $('<th>').addClass('full-width-last');
      this.lastHeaderCell.appendTo(this.headerTable.find('tr'));

      this.lastContentCell = $('<th>').addClass('full-width-last');
      this.lastContentCell.appendTo(this.contentTable.find('thead tr'));

      this.contentTable.find('tbody tr').each((i, el) => {
        $('<td>').addClass('full-width-last').appendTo(el);
      });

      this.headerTable.css('width', '' + this.headerWrapper.outerWidth() + 'px');
      this.contentTable.css('width', '' + this.headerWrapper.outerWidth() + 'px');
      this.adjustFullWidthCells();
    }
  }

  adjustFullWidthCells(total = 0) {
    if (!total) {
      total = 0;
      for(var i in this.columnWidths) { total += this.columnWidths[i]; }
    }
    var diffWidth = this.headerWrapper.outerWidth() - this.columnWidths.reduce((acc, val) => { return acc + val; }, 0);
    this.lastHeaderCell.css('width', '' + diffWidth + 'px');
    this.lastContentCell.css('width', '' + diffWidth + 'px');
  }

  addDraggers() {
    var wrapperOffsetLeft = this.headerWrapper.offset().left;
    var tableThs = this.contentTable.find('th');

    this.resizers = [];

    this.headerTable.find('th').each((index, thEl) => {
      var th = $(thEl);
      if ($(th).hasClass('full-width-last')) {
        return;
      }
      var resizer = $('<div>').addClass('dragger');
      resizer.appendTo(this.headerWrapper);
      resizer.css('left', th.offset().left - wrapperOffsetLeft + th.outerWidth() - 3);

      this.resizers[index] = resizer;

      var dragging = false;
      //var startLeft = 0;
      var columnsOffset = 0;

      var inOutDiff = th.outerWidth() - th.width();

      var onMouseMove = function (e) {
        if (dragging) {
          //var startTime = new Date();

          var newThWidth = e.pageX - wrapperOffsetLeft - columnsOffset + this.headerWrapper[0].scrollLeft - inOutDiff;

          th.css('width', newThWidth);

          $(tableThs[index]).css('width', newThWidth);

          var newColumnWidth = newThWidth + inOutDiff;
          this.columnWidths[index] = newColumnWidth;

          var total = 0;
          for(var i in this.columnWidths) { total += this.columnWidths[i]; }

          if (this.fullWidth) {
            this.adjustFullWidthCells(total);
          }

          this.contentTable.css('width', '' + total + 'px');
          this.headerTable.css('width', '' + total + 'px');

          this.setResizersPosition(index - 1);
          /*
          var sum = 0;
          for (var i = 0; i < this.resizers.length; i++) {
            sum += this.columnWidths[i];
            if (i > index) {
              //console.log("set resizer offset %d %d", i, sum);
              this.resizers[i].css('left', sum);
            }
          }
          */

          e.preventDefault();
        }
      }.bind(this);

      var onMouseUp = function () {
        dragging = false;
        resizer.removeClass('moving');
        $(document.body).css('cursor', '');

        $(document.body).off('mousemove', onMouseMove);
        //$(document.body).off('mouseup', onMouseUp);
      };

      resizer.on('mousedown', () => {
        dragging = true;
        //startLeft = resizer.offset().left;
        resizer.addClass('moving');

        columnsOffset = 0;
        for (var i = 0; i < index; i++) {
          columnsOffset += this.columnWidths[i];
        }
        $(document.body).css('cursor', resizer.css('cursor'));
        //console.log('start dragging', index, columnsOffset);

        $(document.body).on('mousemove', onMouseMove);
        $(document.body).on('mouseup', onMouseUp);
      });

      //$(th).append(resizer);
    });

    this.setResizersPosition();
  }

  setResizersPosition(startIndex = 0) {
    var sum = 0;
    for (var i = 0; i < this.resizers.length; i++) {
      sum += this.columnWidths[i];
      //console.log('col offset', i, sum);
      if (i > startIndex) {
        this.resizers[i][0].style.left = '' + sum + 'px';
        //this.resizers[i].css('left', sum);
      }
    }
  }
}

window.ResizableColumns = global.ResizableColumns = ResizableColumns;

//new ResizableColumns($('.rescol-wrapper'));