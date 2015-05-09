var strftime = require('strftime');
var sprintf = require("sprintf-js").sprintf;

var helpers = global.ViewHelpers = {
  formatCell: function (value, format, dataType) {
    var formated = value;
    if (!formated) return formated;

    switch (format) {
      case 'hstore': case 'text':
        var n = $dom(['span']);
        n.innerText = '' + value;
        formated = '<span class="text">' + n.innerHTML + '</span>';
        break;
      case 'timestamp':
        formated = this.betterDateTime(value);
        break;
      case 'timestamptz':
        formated = this.betterDateTimeZ(value);
        break;
      case 'date':
        formated = this.betterDate(value);
        break;
      case 'jsonb':
        formated = this.formatJson(value);
        break;
    }

    if (dataType == 'ARRAY') {
      formated = this.formatArray(value, format);
    }

    return formated;
  },

  truncate: function(str, length) {
    if (typeof str != 'string') str = '' + str;
    if (!length) length = 100;
    if (str.length > length) {
      return str.substr(0, length - 3) + '...';
    } else {
      return str;
    }
  },

  tag_options: function (options) {
    var attrs = [];
    Object.keys(options).forEach(function(key) {
      attrs.push(key + '="' + options[key] + '"');
    });
    return attrs.join(" ");
  },

  link_to: function (text, url, options) {
    options = options || {}
    options.href = url;
    return "<a " + this.tag_options(options) + '>' + text + '</a>';
  },

  icon: function(name, title) {
    title = title === undefined ? name.replace(/[\-_]/g, ' ') : title;
    return sprintf('<img src="./assets/icons/%s.png" width="20" height="20" class="app-icon" title="%s"/>', name, title);
  },

  column_type_label: function (column) {
    var baseName = column.udt_name;
    if (column.data_type == 'ARRAY') {
      baseName = baseName.replace(/^_/, '') + "[]";
    }
    return baseName;
  },

  betterDateTime: function (value) {
    var date = new Date(Date.parse(value)); // convert to current timezone
    var now = new Date();

    if (now.toDateString() == date.toDateString()) {
      return '<time>' + strftime('Today, %H:%M:%S', date) + '</time>';
    } else if (now.getFullYear() == date.getFullYear()) {
      return '<time>' + strftime('%b %d, %H:%M:%S', date) + '</time>';
    } else {
      return '<time>' + strftime('%b %d, %Y, %H:%M:%S', date) + '</time>';
    }
  },

  betterDateTimeZ: function (value) {
    var date = new Date(Date.parse(value)); // convert to current timezone
    var now = new Date();

    if (now.toDateString() == date.toDateString()) {
      return '<time>' + strftime('Today, %H:%M:%S %z', date).replace(/00$/, '') + '</time>';
    } else if (now.getFullYear() == date.getFullYear()) {
      return '<time>' + strftime('%b %d, %H:%M:%S %z', date).replace(/00$/, '') + '</time>';
    } else {
      return '<time>' + strftime('%b %d, %Y, %H:%M:%S %z', date).replace(/00$/, '') + '</time>';
    }
  },

  // 1999-01-08
  betterDate: function (value) {
    var date = new Date(Date.parse(value));
    return '<time>' + strftime('%Y-%m-%d', date) + '</time>';
  },

  formatJson: function (value) {
    var json = JSON.stringify(value);
    var n = $dom(['span']);
    n.innerText = '' + json;
    return '<span class="text">' + n.innerHTML + '</span>';
  },

  formatArray: function (value, format) {
    var fomrmatted = value.map(function (element) {
      if (Array.isArray(element)) {
        return this.formatArray(element, format);
      } else {
        return this.formatCell(element, format);
      }
    }.bind(this));

    return '{' + fomrmatted.join(',') + '}';
  }
};