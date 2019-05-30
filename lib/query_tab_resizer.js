class QueryTabResizer {
  /*::
  following: boolean
  codeMirrorEditor: CodeMirror.EditorFromTextArea
  element: JQuery<HTMLElement>
  editor: JQuery<HTMLElement>
  result: JQuery<HTMLElement>
  handler: JQuery<HTMLElement>
  topOffset: number
  dragOffset: number
  doc: JQuery<Document>
  */
  constructor (element, codeMirrorEditor) {
    this.following = false;

    this.codeMirrorEditor = codeMirrorEditor;
    this.element = $u(element);
    this.editor = this.element.find('.editing');
    this.result = this.element.find('.result');
    this.handler = this.element.find('.resizer');

    this.topOffset = this.editor.offset().top;

    this.startTracking();
    this.doc = $u(this.element[0].ownerDocument);

    this.doc[0].addEventListener('mousemove', (move_ev) => {
      if (this.following) this.onChanged(move_ev);
    });
  }

  onChanged (event) {
    var editorHeight = event.pageY - this.topOffset + this.dragOffset;
    this.editor[0].style.height = editorHeight + 'px';
    this.result[0].style.height = 'calc(100% - ' + (editorHeight + 42) + 'px)';
    this.codeMirrorEditor && this.codeMirrorEditor.refresh();
  }

  startTracking () {
    this.handler.on('mousedown touchstart', (event) => {
      event.preventDefault();
      if (this.following) return;
      this.dragOffset = this.handler.offset().top - event.pageY;
      //console.log('start dragging', this.dragOffset);
      this.following = true;
      //$u(window.document.body).addClass('sidebar-resizing');
      this.waitingForMouseUp();
    });
  }

  waitingForMouseUp () {
    this.doc.one('mouseup touchend', (e) => {
      e.preventDefault();
      this.following = false;
      //$u(window.document.body).removeClass('sidebar-resizing');
    });
  }
}

window.QueryTabResizer = global.QueryTabResizer = QueryTabResizer;
