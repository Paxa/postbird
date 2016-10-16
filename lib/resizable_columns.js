class ResizableColumns {

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
      this.headerWrapper.appendTo(this.wrapper, 'top');
    }

    if (this.contentWrapper.find('th').length == 0) {
      console.log('table without headers');
      return;
    }

    // this.setFullWidth()
    this.mesureTime('setFullWidth', () => this.setFullWidth());

    this.mesureTime('createHeaders', () => this.createHeaders());
    //this.createHeaders();

    this.mesureTime('addDraggers', () => this.addDraggers());
    //this.addDraggers();

    console.log("Init sec", ((new Date()) - this.startTime) / 1000);
  }

  mesureTime(title, callback) {
    var startTime = new Date();
    callback();
    //console.log(title + " sec", ((new Date()) - startTime) / 1000);
  }

  setFullWidth() {
    this.wrapper.css('width', '20000px');
    var naturalWidth = this.contentTable.outerWidth();

    this.contentTable.css('width', `${naturalWidth}px`);
    this.wrapper.css('width', '');

    this.columnWidths = [];

    this.contentTable.find('th').each(function (i, th) {
      th = $(th);
      this.columnWidths[i] = th.outerWidth();

      th.css('width', th.width());
    }.bind(this));

    //this.element.css('width', '');
    this.contentTable.css('table-layout', 'fixed');
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
    this.contentWrapper.scroll(function () {
      this.headerWrapper[0].scrollLeft = this.contentWrapper[0].scrollLeft;
    }.bind(this));
  }

  addDraggers() {
    var wrapperOffsetLeft = this.headerWrapper.offset().left;
    var tableThs = this.contentTable.find('th');

    this.resizers = [];

    this.headerTable.find('th').each(function (index, th) {
      th = $(th);
      var resizer = $('<div>').addClass('dragger');
      resizer.appendTo(this.headerWrapper);
      resizer.css('left', th.offset().left - wrapperOffsetLeft + th.outerWidth() - 3);

      this.resizers[index] = resizer;

      var dragging = false;
      var startLeft = 0;
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

      resizer.on('mousedown', function () {
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
      }.bind(this));

      //$(th).append(resizer);
    }.bind(this));

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
};

window.ResizableColumns = global.ResizableColumns = ResizableColumns;

//new ResizableColumns($('.rescol-wrapper'));