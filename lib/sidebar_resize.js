global.SidebarResize = jClass.extend({
  following: false,
  minWidth: 150,

  init: function (element) {
    this.element = $u(element);
    this.sidebar = this.element.parent();
    this.mainbar = this.element.closest('.main-screen').find('.main');
    this.startTracking();
    this.doc = $u(this.element[0].ownerDocument);

    this.doc[0].addEventListener('mousemove', function (move_ev) {
      if (this.following) this.onChanged(move_ev);
    }.bind(this));
  },

  onChanged: function (event) {
    var width = event.pageX > this.minWidth ? event.pageX : this.minWidth;
    this.mainbar[0].style.marginLeft = '' + width + 'px';
    this.sidebar[0].style.width =      '' + width + 'px';
  },

  startTracking: function () {
    this.element.on('mousedown touchstart', function(e) {
      e.preventDefault();
      if (this.following) return;
      this.following = true;
      $u(window.document.body).addClass('sidebar-resizing');
      this.waitingForMouseUp();
    }.bind(this));
  },

  waitingForMouseUp: function (doc) {
    this.doc.one('mouseup touchend', function (e) {
      e.preventDefault();
      this.following = false;
      $u(window.document.body).removeClass('sidebar-resizing');
    }.bind(this));
  }
});

window.SidebarResize = global.SidebarResize;