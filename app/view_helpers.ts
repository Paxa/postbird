var strftime = require('strftime');


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
    formatDurationMs: (rawMs: number | string) => string
    extractTargetTable: (query: string) => string
  }
}


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

var helpers = (global as any).ViewHelpers = {

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
  },

  escapeHTML(unsafe: any) {
    if (unsafe === null || unsafe === undefined) return "";
    return String(unsafe)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  },

  formatDurationMs: function (rawMs: number | string) {
    if (rawMs === null || rawMs === undefined || rawMs === '') return '-';
    const ms = Number(rawMs);
    if (isNaN(ms)) return '-';
    if (ms < 0) return '0 ms';

    if (ms < 1000) {
      return `${ms < 10 ? (Math.round(ms * 10) / 10) : Math.round(ms)} ms`;
    }

    const seconds = ms / 1000;
    if (seconds < 60) {
      return `${seconds.toFixed(1)} s`;
    }

    const minutes = seconds / 60;
    if (minutes < 60) {
      return `${minutes.toFixed(1)} min`;
    }

    const hours = minutes / 60;
    if (hours < 24) {
      return `${hours.toFixed(1)} hrs`;
    }

    const days = hours / 24;
    return `${days.toFixed(1)} days`;
  },

  extractTargetTable: function (query: string): string {
    if (!query) return '-';
    const cleaned = query
      .replace(/--.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .trim();

    // 1. UPDATE [ONLY] table
    let match = cleaned.match(/\bUPDATE\s+(?:ONLY\s+)?([a-zA-Z0-9_."]+)/i);
    if (match) return match[1].replace(/["']/g, '').trim();

    // 2. INSERT INTO table
    match = cleaned.match(/\bINSERT\s+INTO\s+([a-zA-Z0-9_."]+)/i);
    if (match) return match[1].replace(/["']/g, '').trim();

    // 3. DELETE FROM [ONLY] table
    match = cleaned.match(/\bDELETE\s+FROM\s+(?:ONLY\s+)?([a-zA-Z0-9_."]+)/i);
    if (match) return match[1].replace(/["']/g, '').trim();

    // 4. FROM [ONLY] table
    match = cleaned.match(/\bFROM\s+(?:ONLY\s+)?([a-zA-Z0-9_."]+)(?!\s*\()/i);
    if (match) {
      const candidate = match[1].replace(/["']/g, '').trim();
      const lower = candidate.toLowerCase();
      if (!['select', 'lateral', 'jsonb_to_record', 'unnest', 'generate_series'].includes(lower)) {
        return candidate;
      }
    }

    // 5. TRUNCATE / LOCK TABLE
    match = cleaned.match(/\b(?:TRUNCATE|LOCK\s+TABLE|TABLE)\s+([a-zA-Z0-9_."]+)/i);
    if (match) return match[1].replace(/["']/g, '').trim();

    return '-';
  }
};

module.exports = helpers;
