global.SidebarResize = jClass.extend({
  following: false,

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

  mouseCoords: function mouseCoords (ev) { 
    if (ev.pageX || ev.pageY) {
      return { x: ev.pageX, y: ev.pageY };
    }
    return {
      x: ev.clientX + document.body.scrollLeft - document.body.clientLeft,
      y: ev.clientY + document.body.scrollTop  - document.body.clientTop
    };
  },

  onChanged: function (event) {
    //var currentWidth = parseInt(this.sidebar.width(), 10);
    //var position = this.mouseCoords(event.pageX);
    //this.mainbar.css('margin-left', '' + position.x + 'px');
    //this.sidebar.width(position.x);

    this.mainbar[0].style.marginLeft = '' + event.pageX + 'px';
    this.sidebar[0].style.width =         '' + event.pageX + 'px';
  },

  startTracking: function () {
    //this.bindEvent(this.element, ['mousedown', 'touchstart'], function(e) {
    this.element.on('mousedown touchstart', function(e) {
      this.following = true;
      $u(window.document.body).addClass('sidebar-resizing');
      console.log('mouse down', e);
      this.waitingForMouseUp();
    }.bind(this));
  },

  waitingForMouseUp: function (doc) {
    this.doc.one('mouseup touchend', function (e) {
      this.following = false;
      $u(window.document.body).removeClass('sidebar-resizing');
      console.log('mouse up', e);
      //this.doc.off('mousemove');
    }.bind(this));
  },

  bindEvent: function (element, eventTypes, handler) {
    eventTypes.forEach(function(name) {
      for(var i = 0; i < element.length; i++) {
        element[i].addEventListener(name, handler);
      }
    });
  }
});

window.SidebarResize = global.SidebarResize;