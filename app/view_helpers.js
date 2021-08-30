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
    formatJsonArray: (value: any) => string
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

var helpers = global.ViewHelpers = {

  relatedRowsIcon(rel, columnName, value) {
    if (value !== null && rel) {
      var escapedValue = typeof value == 'string' ? value.replace(/('|")/g, "\\$1") : value;
      var execAttr = `viewForeign('${rel.foreign_table_schema}', '${rel.foreign_table_name}', '${rel.foreign_column_name}', '${escapedValue}')`;
      return `<a class="foreign" exec="${execAttr}"></span>`;
    }
  },

  // may be not used
  truncate: function(str, length) {
    if (typeof str != 'string') str = '' + str;
    if (!length) length = 100;
    if (str.length > length) {
      return str.substr(0, length - 3) + '...';
    } else {
      return str;
    }
  },

  // may be not used
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


  getIndexType: function (indexSql) {
    var regM = indexSql.match(/USING ([^\s]+)\s/i);
    return regM ? regM[1] : undefined;
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
