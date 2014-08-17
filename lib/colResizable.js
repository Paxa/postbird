/*
 * Authors: WU Shengyuan
 * © MISYS
 * Subversion: 1.1
 * 1) Fork from https://github.com/njs50/colResizable, revert "Fix onResize function to get around A is not a function error."
 */
/**
               _ _____           _          _     _
              | |  __ \         (_)        | |   | |
      ___ ___ | | |__) |___  ___ _ ______ _| |__ | | ___
     / __/ _ \| |  _  // _ \/ __| |_  / _` | '_ \| |/ _ \
    | (_| (_) | | | \ \  __/\__ \ |/ / (_| | |_) | |  __/
     \___\___/|_|_|  \_\___||___/_/___\__,_|_.__/|_|\___|

    v 1.3 - a jQuery plugin by Alvaro Prieto Lauroba

    Licences: MIT & GPL
    Feel free to use or modify this plugin as far as my full name is kept

    If you are going to use this plugin in production environments it is
    strongly recomended to use its minified version: colResizable.min.js

*/

(function ($) {

    var doc = $(document); //window object
    var head = $("head"); //head object
    var drag = null; //reference to the current grip that is being dragged
    var tables = {}; //array of the already processed tables (table.id as key)
    var count = 0; //internal count to create unique IDs when needed.
    //common strings for minification    (in the minified version there are plenty more)
    var ID = "id";
    var PX = "px";
    var SIGNATURE = "JColResizer";

    var store;
    try { store = sessionStorage; } catch (e) {}  //Firefox crashes when executed as local file system

    //shortcuts
    var ie = navigator.userAgent.toLowerCase().match(/(msie)/);

    //append required CSS rules
    head.append(
      "<style type='text/css'>" +
        ".JColResizer { table-layout:fixed; }" +
        ".JColResizer td, .JColResizer th { overflow:hidden; /*padding-left:0!important; padding-right:0!important;*/ }" + 
        ".JCLRgrips { height:0px; position:relative; }" +
        ".JCLRgrip { margin-left:-5px; position:absolute; z-index:5; }" +
        ".JCLRgrip .JColResizer { position:absolute; background-color:red; filter:alpha(opacity=1); opacity:0; width:10px; height:100%;top:0px}" +
        ".JCLRLastGrip { position:absolute; width:1px; }" +
        ".JCLRgripDrag { border-left:1px dotted black; }" +
      "</style>");


    /**
     * Function to allow column resizing for table objects. It is the starting point to apply the plugin.
     * @param {DOM node} tb - refrence to the DOM table object to be enhanced
     * @param {Object} options    - some customization values
     */
    var init = function (tb, options) {
        var table = $(tb); //the table object is wrapped
        if (options.disable) return destroy(table); //the user is asking to destroy a previously colResized table
        var id = table.id = table.attr(ID) || SIGNATURE + count++; //its id is obtained, if null new one is generated
        table.p = options.postbackSafe; //shortcut to detect postback safe
        if (!table.is("table") || tables[id]) return; //if the object is not a table or if it was already processed then it is ignored.
        table.addClass(SIGNATURE).attr(ID, id).before('<div class="JCLRgrips"/>'); //the grips container object is added. Signature class forces table rendering in fixed-layout mode to prevent column's min-width
        table.opt = options;
        table.g = [];
        table.c = [];
        table.w = table.width();
        table.gc = table.prev(); //t.c and t.g are arrays of columns and grips respectively
        if (options.marginLeft) table.gc.css("marginLeft", options.marginLeft); //if the table contains margins, it must be specified
        if (options.marginRight) table.gc.css("marginRight", options.marginRight); //since there is no (direct) way to obtain margin values in its original units (%, em, ...)
        table.cs = parseInt(ie ? tb.cellSpacing || tb.currentStyle.borderSpacing : table.css('border-spacing')) || 2; //table cellspacing (not even jQuery is fully cross-browser)
        table.b = parseInt(ie ? tb.border || tb.currentStyle.borderLeftWidth : table.css('border-left-width')) || 1; //outer border width (again cross-browser isues)
        // if(!(tb.style.width || tb.width)) t.width(t.width()); //I am not an IE fan at all, but it is a pitty that only IE has the currentStyle attribute working as expected. For this reason I can not check easily if the table has an explicit width or if it is rendered as "auto"
        tables[id] = table; //the table object is stored using its id as key
        createGrips(table); //grips are created
    };


    /**
     * This function allows to remove any enhancements performed by this plugin on a previously processed table.
     * @param {jQuery ref} t - table object
     */
    var destroy = function (table) {
        var id = table.attr(ID);
        var table = tables[id]; //its table object is found
        if (!table || !table.is("table")) return; //if none, then it wasnt processed
        table.removeClass(SIGNATURE).gc.remove(); //class and grips are removed
        delete tables[id]; //clean up data
    };


    /**
     * Function to create all the grips associated with the table given by parameters
     * @param {jQuery ref} t - table object
     */
    var createGrips = function (table) {
        var th = table.find("thead > tr > th, thead > tr > td"); //if table headers are specified in its semantically correct tag, are obtained
        //but headers can also be included in different ways
        if (!th.length) {
          th = table.find("tbody > tr:first-child > th, tr:first-child > th, tbody > tr:first-child > td, tr:first-child > td");
        }
        table.cg = table.find("col"); //a table can also contain a colgroup with col elements
        table.ln = th.length; //table length is stored
        if (table.p) memento(table, th); //if 'postbackSafe' is enabled and there is data for the current table, its coloumn layout is restored
        th.each(function (i) { //iterate through the table column headers
            var column = $(this); //jquery wrap for the current column
            var grip = $(table.gc.append('<div class="JCLRgrip"></div>')[0].lastChild); //add the visual node to be used as grip
            grip.t = table;
            grip.i = i;
            grip.c = column;
            column.w = column.width(); //some values are stored in the grip's node data
            table.g.push(grip);
            table.c.push(column); //the current grip and column are added to its table object
            column.width(column.w).removeAttr("width"); //the width of the column is converted into pixel-based measurements
            if (i < table.ln - 1) {
              grip.mousedown(onGripMouseDown).append(table.opt.gripInnerHtml).append('<div class="' + SIGNATURE + '" style="cursor:' + table.opt.hoverCursor + '"></div>'); //bind the mousedown event to start dragging
            } else {
              grip.addClass("JCLRLastGrip").removeClass("JCLRgrip"); //the last grip is used only to store data
            }
            grip.data(SIGNATURE, {
                i: i,
                t: table.attr(ID)
            }); //grip index and its table name are stored in the HTML
        });

        table.cg.removeAttr("width"); //remove the width attribute from elements in the colgroup (in any)
        syncGrips(table); //the grips are positioned according to the current table layout
        //there is a small problem, some cells in the table could contain dimension values interfering with the
        //width value set by this plugin. Those values are removed
        table.find('td, th').not(th).not('table th, table td').each(function () {
            $(this).removeAttr('width'); //the width attribute is removed from all table cells which are not nested in other tables and dont belong to the header
        });
    };


    var readStored = function readStored (tableId) {
      if (store.colResizable) {
        return JSON.parse(store.colResizable)[tableId];
      } else {
        return [];
      }
    };

    var writeStored = function writeStored (tableId, data) {
      if (!store.colResizable) store.colResizable = "{}";
      var storedData = JSON.parse(store.colResizable);
      storedData[tableId] = data
      return store.colResizable = JSON.stringify(storedData);
    };

    /**
     * Function to allow the persistence of columns dimensions after a browser postback. It is based in
     * the HTML5 sessionStorage object, which can be emulated for older browsers using sessionstorage.js
     * @param {jQuery ref} t - table object
     * @param {jQuery ref} th - reference to the first row elements (only set in deserialization)
     */
    var memento = function (table, th) {
        if (!store) return;
        var width, totalWidth = 0,
            columnsWidth = [];
            i = 0,
            aux = [];
        if (th) { //in deserialization mode (after a postback)
            table.cg.removeAttr("width");
            if (table.opt.flush) {
                writeStored(table.id, []);
                return;
            } //if flush is activated, stored data is removed
            width = readStored(table.id); //column widths is obtained
            for (; i < table.ln; i++) { //for each column
                aux.push(100 * width[i] / width[table.ln] + "%"); //width is stored in an array since it will be required again a couple of lines ahead
                th.eq(i).css("width", aux[i]); //each column width in % is resotred
            }
            for (i = 0; i < table.ln; i++) {
              table.cg.eq(i).css("width", aux[i]); //this code is required in order to create an inline CSS rule with higher precedence than an existing CSS class in the "col" elements
            }
        } else { //in serialization mode (after resizing a column)
            for (; i < table.c.length; i++) { //iterate through columns
                columnsWidth.push(table.c[i].width());
                totalWidth += columnsWidth[i];
            }
            columnsWidth.push(totalWidth);
            writeStored(table.id, columnsWidth);
            //to be able to obtain % width value of each columns while deserializing
        }
    };


    /**
     * Function that places each grip in the correct position according to the current table layout     *
     * @param {jQuery ref} t - table object
     */
    var syncGrips = function (table) {
        table.gc.width(table.w); //the grip's container width is updated
        for (var i = 0; i < table.ln; i++) { //for each column
            var column = table.c[i];
            table.g[i].css({ //height and position of the grip is updated according to the table layout
                left: column.offset().left - table.offset().left + column.width() + table.cs / 2 + PX,
                height: table.opt.headerOnly ? table.c[0].outerHeight(false) : table.outerHeight(false),
                display: column.is(":visible") ? 'block' : 'none'
            });
        }
    };


    /**
     * This function updates column's width according to the horizontal position increment of the grip being
     * dragged. The function can be called while dragging if liveDragging is enabled and also from the onGripDragOver
     * event handler to synchronize grip's position with their related columns.
     * @param {jQuery ref} t - table object
     * @param {nunmber} i - index of the grip being dragged
     * @param {bool} isOver - to identify when the function is being called from the onGripDragOver event
     */
    var syncCols = function (table, dripId, isOver) {
        var inc = drag.x - drag.l,
            column = table.c[dripId],
            column2 = table.c[dripId + 1];
        var width = column.w + inc;
        var width2 = column2.w; // - inc; //their new width is obtained
        column.width(width + PX);
        column2.width(width2 + PX); //and set
        table.cg.eq(dripId).width(width + PX);
        table.cg.eq(dripId + 1).width(width2 + PX);
        if (isOver) {
            column.w = width;
            column2.w = width2;
        }
    };


    /**
     * Event handler used while dragging a grip. It checks if the next grip's position is valid and updates it.
     * @param {event} e - mousemove event binded to the window object
     */
    var onGripDrag = function (event) {
        if (!drag) return;
        var table = drag.t; //table object reference
        var x = event.pageX - drag.ox + drag.l; //next position according to horizontal mouse position increment
        var minWidth = table.opt.minWidth,
            i = drag.i; //cell's min width
        var l = table.cs * 1.5 + minWidth + table.b;

        var max = i == table.ln - 1 ? table.w - l : table.g[i + 1].position().left - table.cs - minWidth; //max position according to the contiguous cells
        var min = i ? table.g[i - 1].position().left + table.cs + minWidth : l; //min position according to the contiguous cells
        x = Math.max(min, x); // Math.max(min, Math.min(max, x)); //apply boundings

        drag.x = x;
        drag.css("left", x + PX); //apply position increment
        if (table.opt.liveDrag) { //if liveDrag is enabled
            syncCols(table, i);
            syncGrips(table); //columns and grips are synchronized
            var cb = table.opt.onDrag; //check if there is an onDrag callback
            if (cb) {
                event.currentTarget = table[0];
                cb(event);
            } //if any, it is fired
        }

        return false; //prevent text selection
    };


    /**
     * Event handler fired when the dragging is over, updating table layout
     */
    var onGripDragOver = function (event) {
        doc.unbind('mousemove.' + SIGNATURE).unbind('mouseup.' + SIGNATURE);
        $("head :last-child").remove(); //remove the dragging cursor style
        if (!drag) return;
        drag.removeClass(drag.t.opt.draggingClass); //remove the grip's dragging css-class
        var table = drag.t,
            cb = table.opt.onResize; //get some values
        if (drag.x) { //only if the column width has been changed
            syncCols(table, drag.i, true);
            syncGrips(table); //the columns and grips are updated
            if (cb) {
                event.currentTarget = table[0];
                cb(event);
            } //if there is a callback function, it is fired
        }
        if (table.p) memento(table); //if postbackSafe is enabled and there is sessionStorage support, the new layout is serialized and stored
        drag = null; //since the grip's dragging is over
    };


    /**
     * Event handler fired when the grip's dragging is about to start. Its main goal is to set up events
     * and store some values used while dragging.
     * @param {event} e - grip's mousedown event
     */
    var onGripMouseDown = function (event) {
        var gripData = $(this).data(SIGNATURE); //retrieve grip's data
        var table = tables[gripData.t],
            grip = table.g[gripData.i]; //shortcuts for the table and grip objects
        grip.ox = event.pageX;
        grip.l = grip.position().left; //the initial position is kept
        doc.bind('mousemove.' + SIGNATURE, onGripDrag).bind('mouseup.' + SIGNATURE, onGripDragOver); //mousemove and mouseup events are bound
        head.append("<style type='text/css'>*{cursor:" + table.opt.dragCursor + "!important}</style>"); //change the mouse cursor
        grip.addClass(table.opt.draggingClass); //add the dragging class (to allow some visual feedback)
        drag = grip; //the current grip is stored as the current dragging object
        if (table.c[gripData.i].l) {
            for (var i = 0, colum; i < table.ln; i++) {
                colum = table.c[i];
                colum.l = false;
                colum.w = colum.width();
            } //if the colum is locked (after browser resize), then c.w must be updated
        }
        return false; //prevent text selection
    };

    /**
     * Event handler fired when the browser is resized. The main purpose of this function is to update
     * table layout according to the browser's size synchronizing related grips
     */
    var onResize = function () {
        for (table in tables) {
            var table = tables[table],
                i, minWidth = 0;
            table.removeClass(SIGNATURE); //firefox doesnt like layout-fixed in some cases
            if (table.w != table.width()) { //if the the table's width has changed
                table.w = table.width(); //its new value is kept
                for (i = 0; i < table.ln; i++) minWidth += table.c[i].w; //the active cells area is obtained
                //cell rendering is not as trivial as it might seem, and it is slightly different for
                //each browser. In the begining i had a big switch for each browser, but since the code
                //was extremelly ugly now I use a different approach with several reflows. This works
                //pretty well but it's a bit slower. For now, lets keep things simple...
                for (i = 0; i < table.ln; i++) {
                  table.c[i].css("width", Math.round(1000 * table.c[i].w / minWidth) / 10 + "%").l = true;
                }
                //c.l locks the column, telling us that its c.w is outdated
            }
            syncGrips(table.addClass(SIGNATURE));
        }
    };


    //bind resize event, to update grips position
    $(window).bind('resize.' + SIGNATURE, onResize);


    /**
     * The plugin is added to the jQuery library
     * @param {Object} options -  an object containg some basic customization values
     */
    $.fn.colResizable = function colResizable (options) {
        var defaults = {
            //attributes:
            draggingClass: 'JCLRgripDrag',
            //css-class used when a grip is being dragged (for visual feedback purposes)
            gripInnerHtml: '',
            //if it is required to use a custom grip it can be done using some custom HTML
            liveDrag: false,
            //enables table-layout updaing while dragging
            minWidth: 15,
            //minimum width value in pixels allowed for a column
            headerOnly: false,
            //specifies that the size of the the column resizing anchors will be bounded to the size of the first row
            hoverCursor: "e-resize",
            //cursor to be used on grip hover
            dragCursor: "e-resize",
            //cursor to be used while dragging
            postbackSafe: false,
            //when it is enabled, table layout can persist after postback. It requires browsers with sessionStorage support (it can be emulated with sessionStorage.js). Some browsers ony
            flush: false,
            //when postbakSafe is enabled, and it is required to prevent layout restoration after postback, 'flush' will remove its associated layout data
            marginLeft: null,
            //in case the table contains any margins, colResizable needs to know the values used, e.g. "10%", "15em", "5px" ...
            marginRight: null,
            //in case the table contains any margins, colResizable needs to know the values used, e.g. "10%", "15em", "5px" ...
            disable: false,
            //disables all the enhancements performed in a previously colResized table
            //events:
            onDrag: null,
            //callback function to be fired during the column resizing process if liveDrag is enabled
            onResize: null //callback function fired when the dragging process is over
        }
        var options = $.extend(defaults, options);
        return this.each(function () {
            init(this, options);
        });
    };

    $.fn.colResizable.tables = tables;
})(window.jQuery || window.Zepto);