class SidebarResize {
  constructor (element) {
    this.following = false;
    this.minWidth = 150;

    this.element = $u(element);
    this.sidebar = this.element.parent();
    this.mainbar = this.element.closest('.main-screen').find('.main');
    this.startTracking();
    this.doc = $u(this.element[0].ownerDocument);

    this.doc[0].addEventListener('mousemove', (move_ev) => {
      if (this.following) this.onChanged(move_ev);
    });
  }

  onChanged (event) {
    var width = event.pageX > this.minWidth ? event.pageX : this.minWidth;
    this.mainbar[0].style.marginLeft = '' + width + 'px';
    this.sidebar[0].style.width =      '' + width + 'px';
  }

  startTracking () {
    this.element.on('mousedown touchstart', (e) => {
      e.preventDefault();
      if (this.following) return;
      this.following = true;
      $u(window.document.body).addClass('sidebar-resizing');
      this.waitingForMouseUp();
    });
  }

  waitingForMouseUp (doc) {
    this.doc.one('mouseup touchend', (e) => {
      e.preventDefault();
      this.following = false;
      $u(window.document.body).removeClass('sidebar-resizing');
    });
  }
}

window.SidebarResize = global.SidebarResize = SidebarResize;
