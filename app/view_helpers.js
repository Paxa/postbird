var strftime = require('strftime');
var sprintf = require("sprintf-js").sprintf;

var GRANTS_ABBR = {
  r: 'SELECT',
  w: 'UPDATE',
  a: 'INSERT',
  d: 'DELETE',
  D: 'TRUNCATE',
  R: 'RULE',
  x: 'REFERENCES',
  t: 'TRIGGER',
  X: 'EXECUTE',
  U: 'USAGE',
  C: 'CREATE',
  c: 'CONNECT',
  T: 'TEMPORARY'
};


var helpers = global.ViewHelpers = {
  formatCell: function (value, format, dataType) {
    if (typeof value == 'string') {
      value = this.escapeHTML(value);
    }

    var formated = value;
    if (!formated) return formated;

    switch (format) {
      case 'hstore': case 'text':
        formated = '<span class="text">' + value + '</span>';
        break;
      case 'xml':
        formated = '<span class="text type-xml">' + value + '</span>';
        break;
      case 'varchar':
        if (typeof value == 'string' && value.length > 20) {
          formated = '<span class="text">' + value + '</span>';
        }
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
      case 'jsonb': case 'json':
        formated = this.formatJson(value);
        break;
    }

    if (dataType == 'ARRAY' && Array.isArray(value)) {
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
    Object.keys(options).forEach((key) => {
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
    return sprintf('<img src="./public/icons/%s.png" width="20" height="20" class="app-icon" title="%s"/>', name, title);
  },

  column_type_label: function (column, short) {
    var baseName = column.udt_name || column.data_type;
    if (column.data_type == 'ARRAY') {
      baseName = baseName.replace(/^_/, '') + "[]";
    }
    return short ? this.shorterTypeName(baseName) : baseName;
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

  timeFormat: function (date) {
    return strftime('%H:%M:%S', date);
  },

  execTime: function (time) {
    if (time >= 1000) {
      return "" + (time / 1000) + " sec";
    } else {
      return "" + time + " ms";
    }
  },

  formatJson: function (value) {
    var json;
    var wrongJson = false;
    if (typeof value == 'string') {
      json = value;
      if (value.startsWith('{') && value.endsWith('}') || value.startsWith('[') && value.endsWith(']')) {
        try {
          JSON.parse(value);
          wrongJson = true;
        } catch (e) {}
      }
    }
    json = JSON.stringify(value, null, 4);
    json = this.escapeHTML(json);
    return `<span class="text ${wrongJson ? 'wrong-json' : ''}" ${wrongJson ? 'title="JSON value saved as string"' : ''}>${json}</span>`;
  },

  formatArray: function (value, format) {
    var fomrmatted = value.map((element) => {
      if (Array.isArray(element)) {
        return this.formatArray(element, format);
      } else {
        return this.formatCell(element, format);
      }
    });

    return '{' + fomrmatted.join(',') + '}';
  },

  getIndexType: function (indexSql) {
    var regM = indexSql.match(/USING ([^\s]+)\s/i);
    return regM ? regM[1] : undefined;
  },

  escapeHTML: function(unsafe) {
    if (unsafe.match(/[<>]/)) {
      var result = unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
      //console.log('unsafe', unsafe, result);
      return result;
    } else {
      return unsafe;
    }
  },

  shorterTypeName(typeName) {
    if (typeName == undefined) typeName = '';
    return typeName
      .replace(/character varying/, 'varchar')
      .replace(/timestamp without time zone/, 'timestamp')
      .replace(/timestamp with time zone/, 'timestampz')
      .replace(/time without time zone/, 'time')
      .replace(/time with time zone/, 'timez');
  },

  relType(type) {
    // r = ordinary table, i = index, S = sequence, t = TOAST table, v = view, m = materialized view, c = composite type, f = foreign table, p = partitioned table
    if (type == 'r') return 'table';
    if (type == 'i') return 'index';
    if (type == 'S') return 'sequence';
    if (type == 't') return 'TOAST table';
    if (type == 'v') return 'view';
    if (type == 'm') return 'mat. view';
    if (type == 'c') return 'composite type';
    if (type == 'f') return 'foreign table';
    if (type == 'p') return 'partitioned table';
    return type;
  },

  tableGrantsDesc(permissions) {
    var allPerms = 'arwdDxt';
    if (permissions == 'arwdDxt') {
      return "Full Access";
    } else if (permissions.length > 4) {
      var actions = [];
      allPerms.split('').forEach(letter => {
        if (!permissions.includes(letter)) {
          actions.push(GRANTS_ABBR[letter] || letter);
        }
      });
      return `All except ${actions.join(", ")}`;
    } else {
      var actions = [];
      permissions.split('').forEach(letter => {
        actions.push(GRANTS_ABBR[letter] || letter);
      });
      return actions.join(", ");
    }
  }
};