global.Dialog = jClass.extend({

  init: function(handler) {
    this.handler = handler;
    this.showWindow();
  },

  renderWindow: function (title, nodes) {
    var el = $u('<div>').append(nodes);

    var titleHtml = $u('<h3>').addClass('window-title').text(title)[0].outerHTML;
    var windowHtml = titleHtml + el.html();

    var dialog = window.alertify.alert(windowHtml, undefined, 'custom-window');

    this.windowContent = $u('#alertify .alertify-inner');

    if (this.dialogClass) {
      this.addClass(this.dialogClass);
    }

    this.windowContent.find('button.cancel').bind('click', function(e) {
      e && e.preventDefault();
      this.close();
    }.bind(this));


    return this.windowContent;
  },

  addClass: function (className) {
    this.windowContent.addClass(className);
  },

  setAutofocus: function () {
    setTimeout(function() {
      var inputs = this.content.find('input[autofocus], input[type=text], input:not([type=hidden]), input[type=password]');
      inputs[0] && inputs[0].focus();
    }.bind(this), 300);
  },

  close: function () {
    window.alertify.hide();
  },

  bindFormSubmitting: function () {
    var handler = function (e) {
      e && e.preventDefault();
      var data = $u.formValues(this.content.find('form'));
      this.onSubmit(data);
    }.bind(this);

    this.content.find('button.ok').bind('click', handler);
    this.content.find('form').bind('submit', handler);
  },

  onSubmit: function (data) {
    console.log('onSubmit', data)
  },

  defaultServerResponse: function (data, error) {
    if (error)
      window.alert(error.message);
    else
      this.close();
  }
});