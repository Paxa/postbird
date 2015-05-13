global.QueryTabResizer = jClass.extend({
  following: false,
  minWidth: 150,

  init: function (element, codeMirrorEditor) {
    this.codeMirrorEditor = codeMirrorEditor;
    this.element = $u(element);
    this.editor = this.element.find('.editing');
    this.result = this.element.find('.result');
    this.handler = this.element.find('.resizer');

    this.topOffset = this.editor.offset().top;

    //console.log(this.editor.offset());

    this.startTracking();
    this.doc = $u(this.element[0].ownerDocument);

    this.doc[0].addEventListener('mousemove', function (move_ev) {
      if (this.following) this.onChanged(move_ev);
    }.bind(this));
  },

  onChanged: function (event) {
    var editorHeight = event.pageY - this.topOffset + this.dragOffset;
    this.editor[0].style.height = editorHeight + 'px';
    this.codeMirrorEditor && this.codeMirrorEditor.refresh();

    /*
    var width = event.pageX > this.minWidth ? event.pageX : this.minWidth;
    this.mainbar[0].style.marginLeft = '' + width + 'px';
    this.sidebar[0].style.width =      '' + width + 'px';
    */
  },

  startTracking: function () {
    this.handler.on('mousedown touchstart', function(event) {
      event.preventDefault();
      if (this.following) return;
      this.dragOffset = this.handler.offset().top - event.pageY;
      console.log('start dragging', this.dragOffset);
      this.following = true;
      //$u(window.document.body).addClass('sidebar-resizing');
      this.waitingForMouseUp();
    }.bind(this));
  },

  waitingForMouseUp: function (doc) {
    this.doc.one('mouseup touchend', function (e) {
      e.preventDefault();
      this.following = false;
      //$u(window.document.body).removeClass('sidebar-resizing');
    }.bind(this));
  }
});

window.QueryTabResizer = global.QueryTabResizer;