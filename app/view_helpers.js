var strftime = require('strftime');

/*::
import * as moment from "moment"

declare module "moment" {
  interface Moment {
    _d: Date
    origValueString: string
  }
}
declare global {
  interface ViewHelpers {
    TIMESTAMPTZ_OID: number
    TIMESTAMP_OID: number
    formatCellFromSelect: (value: any, field: any) => string
    formatCell: (value: any, format: string, dataType: string) => string
    relatedRowsIcon: (rel: any, columnName: string, value: string) => string
    truncate: (str: string, length: number) => string
    tag_options: (options: any) => string
    link_to: (text: string, url: string, options: any) => string
    icon: (name: string, title: string) => string
    column_type_label: (column: any, short: string) => string
    betterDateTime: (date: moment.Moment) => string
    betterDateTimeZ: (date: moment.Moment) => string
    editDateFormat: (value: any, format: string) => string
    betterDate: (value: Date) => string
    timeFormat: (date: string) => string
    execTime: (time: number) => string
    formatJson: (value: any) => string
    formatArray: (value: any, format: string) => string
    getIndexType: (indexSql: string) => string
    escapeHTML: (unsafe: string) => string
    shorterTypeName: (typeName: string) => string
    relType: (type: string) => string
    tableGrantsDesc: (permissions: string) => string
    formatBytes: (size: number) => string
  }
}
*/

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

var TRUNCATE_LONG_TEXT = 500;


var helpers = global.ViewHelpers = {

  TIMESTAMPTZ_OID: 1184,
  TIMESTAMP_OID: 1114,

  formatCellFromSelect(value, field) {
    var format = field.udt_name || field.format;
    if (field.dataTypeID == this.TIMESTAMP_OID) {
      format = 'timestamp';
    }
    if (field.dataTypeID == this.TIMESTAMPTZ_OID) {
      format = 'timestamptz';
    }

    return this.formatCell(value, format, field.data_type);
  },

  formatCell: function (value, format, dataType) {
    if (value === null) {
      return '<i class="null">NULL</i>';
    }
    if (typeof value == 'string') {
      //value = this.escapeHTML(value);
    }

    var formated = value;
    if (!formated) return formated;

    switch (format) {
      case 'hstore': case 'text': case 'tsvector':
        var shorterValue = value.length > TRUNCATE_LONG_TEXT ? value.slice(0, TRUNCATE_LONG_TEXT) + '...' : value;
        formated = `<span class="text">${shorterValue}</span>`;
        break;
      case 'xml':
        formated = '<span class="text type-xml">' + value + '</span>';
        break;
      case 'varchar':
        if (typeof value == 'string' && value.length > 20) {
          var shorterValue /*: any */ = value.length > TRUNCATE_LONG_TEXT ? value.slice(0, TRUNCATE_LONG_TEXT) + '...' : value;
          formated = `<span class="text">${shorterValue}</span>`;
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
      case 'bytea':
        var str = value.toString('ascii', 0, 100);
        formated = str;
        //console.log(value);
        //formated = value.length > 100 ? value.substr(0, 100) : value;
        break;
      case 'interval':
        formated = `${value.toPostgres()}`
        break;
    }

    if (dataType == 'ARRAY' && Array.isArray(value)) {
      formated = this.formatArray(value, format);
    }

    return formated;
  },

  relatedRowsIcon(rel, columnName, value) {
    if (value !== null && rel) {
      var escapedValue = typeof value == 'string' ? value.replace(/('|")/g, "\\$1") : value;
      var execAttr = `viewForeign('${rel.foreign_table_schema}', '${rel.foreign_table_name}', '${rel.foreign_column_name}', '${escapedValue}')`;
      return `<a class="foreign" exec="${execAttr}"></span>`;
    }
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

  icon: function(name, title, height = 20, width = 20) {
    title = title === undefined ? name.replace(/[-_]/g, ' ') : title;
    return `<img src="./public/icons/${name}.png" width="${width}" height="${height}" class="app-icon" title="${title}"/>`;
  },

  column_type_label: function (column, short) {
    // still not sure why it happens
    if (!column) {
      return 'varchar';
    }

    var baseName = column.udt_name || column.data_type;
    if (column.data_type == 'ARRAY') {
      baseName = baseName.replace(/^_/, '') + "[]";
    }
    return short ? this.shorterTypeName(baseName) : baseName;
  },

  betterDateTime: function (date) {
    var dateSec = date._d.getTime() / 1000.0;
    var nowSec = Math.round(Date.now() / 1000);
    var todayStart = nowSec - nowSec % 86400;
    var todayEnd = todayStart + 86400;
    var currentYear = new Date().getFullYear();

    var attrs = date.origValueString ? ` title="${date.origValueString}"` : '';
    var formatted = null;

    if (dateSec > todayStart && dateSec < todayEnd) {
      formatted = "Today, " + date.format("HH:mm:ss");
    } else if (currentYear == date._d.getFullYear()) {
      formatted = date.format("MMM DD HH:mm:ss");
    } else {
      formatted = date.format("MMM DD YYYY HH:mm:ss");
    }

    return `<time${attrs}>${formatted}</time>`;
  },


  betterDateTimeZ: function (date) {
    // date._d - is a date with substracted timezone offset
    var dateSec = date._d.getTime() / 1000.0;
    var nowSec = Math.round(Date.now() / 1000);
    var todayStart = nowSec - nowSec % 86400;
    var todayEnd = todayStart + 86400;
    var currentYear = new Date().getFullYear();

    var attrs = date.origValueString ? ` title="${date.origValueString}"` : '';
    var formatted = null;

    if (dateSec > todayStart && dateSec < todayEnd) {
      formatted = "Today, " + date.format("HH:mm:ss Z").replace(/:00$/, '');
    } else if (currentYear == date._d.getFullYear()) {
      formatted = date.format("MMM DD HH:mm:ss Z").replace(/:00$/, '');
    } else {
      formatted = date.format("MMM DD YYYY HH:mm:ss Z").replace(/:00$/, '');
    }

    return `<time${attrs}>${formatted}</time>`;
  },

  editDateFormat: function (value, format) {
    if (value == null) {
      return value;
    } else if (value.origValueString) {
      return value.origValueString;
    } else {
      if (format == "date") {
        return strftime('%F', value);
      } else if (format == "timetz") {
        return value;
      } else {
        return strftime('%F %T.%L', value);
      }
    }
  },

  // 1999-01-08
  betterDate: function (date) {
    //var date = new Date(Date.parse(value));
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
      //json = value;
      if (value.startsWith('{') && value.endsWith('}') || value.startsWith('[') && value.endsWith(']')) {
        try {
          value = JSON.parse(value);
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
  },

  formatBytes(bytes) {
    if (bytes < 1024) {
      return bytes + " Bytes";
    } else if (bytes < 1048576) {
      return (bytes / 1024).toFixed(3).replace(/\.?0+$/, '') + " KB";
    } else if (bytes < 1073741824) {
      return (bytes / 1048576).toFixed(3).replace(/\.?0+$/, '') + " MB";
    } else {
      return (bytes / 1073741824).toFixed(3).replace(/\.?0+$/, '') + " GB";
    }
  }
};

module.exports = helpers;