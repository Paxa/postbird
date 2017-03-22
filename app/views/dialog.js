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

    this.windowContent.find('input, textarea').each((i, el) => {
      $u.textInputMenu(el);
    });

    if (this.dialogClass) {
      this.addClass(this.dialogClass);
    }

    this.windowContent.find('button.cancel').bind('click', (e) => {
      e && e.preventDefault();
      this.close();
    });

    this.setInputFocus();
    this.initTables();

    return this.windowContent;
  },

  addClass: function (className) {
    this.windowContent.addClass(className);
  },

  setAutofocus: function () {
    setTimeout(() => {
      var inputs = this.content.find('input[autofocus], input[type=text], input:not([type=hidden]), input[type=password]');
      inputs[0] && inputs[0].focus();
    }, 300);
  },

  close: function () {
    window.alertify.hide();
  },

  bindFormSubmitting: function () {
    var handler = (e) => {
      e && e.preventDefault();
      var data = $u.formValues(this.content.find('form'));
      this.onSubmit(data);
    };

    this.content.find('button.ok').bind('click', handler);
    this.content.find('form').bind('submit', handler);
  },

  onSubmit: function (data) {
    console.log('onSubmit', data)
  },

  defaultServerResponse: function (data, error) {
    if (error) {
      window.alert(error.message);
    } else {
      this.close();
    }
  },

  renderTemplate: function (template, locals, title) {
    title = title || this.title;
    locals = locals || {};

    var nodes = App.renderView(template, locals);
    this.content = this.renderWindow(title, nodes);
  },

  setInputFocus: function () {
    var focusable = this.windowContent.find('[autofocus]');
    if (focusable.length) {
      setTimeout(() => {
        focusable[0].focus();
      }, 120);
      focusable[0].focus();
    } else {
      var firstInput = this.windowContent.find('input, select, textare')[0];
      if (firstInput) firstInput.focus();
      setTimeout(() => {
        if (firstInput) firstInput.focus();
      }, 120);
    }
  },

  // TODO: dry
  initTables: function () {
    // heavy stuff, run it with delay
    setTimeout(() => {
      this.content.find('.rescol-wrapper').forEach((table) => {
        new ResizableColumns(table);
      });

      this.content.find('.rescol-content-wrapper table').forEach((table) => {
        if (!table.hasAttribute('native-table-init')) {
          new GenericTable(table);
          $u(table).trigger('generic-table-init');
          table.setAttribute('native-table-init', true);
        }
      });
    }, 10);
  }
});