global.Dialog = jClass.extend({
  renderWindow: function (title, nodes) {
    var el = $u('<div>').append(nodes);

    var titleHtml = $u('<h3>').addClass('window-title').text(title)[0].outerHTML;
    var windowHtml = titleHtml + el.html();

    var a = window.alertify.alert(windowHtml, undefined, 'custom-window');

    var windowContent = $u('#alertify .alertify-inner');

    windowContent.find('button.cancel').bind('click', function(e) {
      e && e.preventDefault();
      this.close();
    }.bind(this));


    return windowContent;
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
  }
});