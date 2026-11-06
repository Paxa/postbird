class QueryTabResizer {
  
  following: boolean
  codeMirrorEditor: CodeMirror.EditorFromTextArea
  element: JQuery<HTMLElement>
  editor: JQuery<HTMLElement>
  result: JQuery<HTMLElement>
  handler: JQuery<HTMLElement>
  topOffset: number
  dragOffset: number
  doc: JQuery<Document>
  
  constructor (element, codeMirrorEditor) {
    this.following = false;

    this.codeMirrorEditor = codeMirrorEditor;
    this.element = $u(element);
    this.editor = this.element.find('.editing');
    this.result = this.element.find('.result');
    this.handler = this.element.find('.resizer');

    this.topOffset = (this.editor.offset && this.editor.offset().top) || 0;

    this.startTracking();
    var doc = (this.element[0] && this.element[0].ownerDocument) || window.document || (global as any).document;
    this.doc = $u(doc);

    if (this.doc[0] && this.doc[0].addEventListener) {
      this.doc[0].addEventListener('mousemove', (move_ev) => {
        if (this.following) this.onChanged(move_ev);
      });
    }
  }

  onChanged (event) {
    var totalHeight = this.element[0] ? this.element[0].clientHeight : 0;
    var minEditor = 80;
    var minResult = 60;
    var maxEditor = totalHeight > 0 ? Math.max(minEditor, totalHeight - minResult - 42) : 2000;
    var editorHeight = Math.max(minEditor, Math.min(maxEditor, event.pageY - this.topOffset + this.dragOffset));
    if (this.editor[0]) {
      if (!this.editor[0].style) (this.editor[0] as any).style = {};
      this.editor[0].style.height = editorHeight + 'px';
    }
    if (this.result[0]) {
      if (!this.result[0].style) (this.result[0] as any).style = {};
      this.result[0].style.height = 'calc(100% - ' + (editorHeight + 42) + 'px)';
    }
    this.codeMirrorEditor && this.codeMirrorEditor.refresh();
  }

  startTracking () {
    this.handler.on('mousedown touchstart', (event) => {
      event.preventDefault();
      if (this.following) return;
      this.topOffset = this.editor.offset().top;
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

window.QueryTabResizer = (global as any).QueryTabResizer = QueryTabResizer;
