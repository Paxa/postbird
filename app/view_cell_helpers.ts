var strftime = require('strftime');

var moment = require('moment');

interface ViewCellHelpers {
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
  betterDateTime: (date: any) => string
  betterDateTimeZ: (date: any) => string
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


var DEFAULT_TRUNCATE_LIMIT = 10000;

function getTruncateLimit(): number {
  var envLimit = (typeof window !== 'undefined' && (window as any).POSTBIRD_MAX_TEXT_LENGTH)
    || (typeof global !== 'undefined' && (global as any).POSTBIRD_MAX_TEXT_LENGTH);
  if (envLimit) {
    return Number(envLimit);
  }
  if (typeof window !== 'undefined' && window.localStorage && window.localStorage.maxCellTextLength) {
    var parsed = parseInt(window.localStorage.maxCellTextLength, 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  return DEFAULT_TRUNCATE_LIMIT;
}

var helpers = (global as any).ViewCellHelpers = {

  TIMESTAMPTZ_OID: 1184,
  TIMESTAMP_OID: 1114,
  TRUNCATE_LONG_TEXT: DEFAULT_TRUNCATE_LIMIT,

  getTruncateLimit: getTruncateLimit,

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

    var formated = value;
    if (!formated) return formated;

    var wrapTextSpan = false;
    var htmlEscaped = false;
    var isTruncated = false;
    var originalLength = typeof value === 'string' ? value.length : 0;
    var truncateLimit = getTruncateLimit();

    switch (format) {
      case 'hstore': case 'text': case 'tsvector':
        if (value.length > truncateLimit) {
          formated = value.slice(0, truncateLimit) + '...';
          isTruncated = true;
        } else {
          formated = value;
        }
        wrapTextSpan = true;
        break;
      case 'xml':
        wrapTextSpan = true;
        break;
      case 'varchar':
        if (typeof value == 'string' && value.length > 20) {
          if (value.length > truncateLimit) {
            formated = value.slice(0, truncateLimit) + '...';
            isTruncated = true;
          } else {
            formated = value;
          }
          wrapTextSpan = true;
        }
        break;
      case 'timestamp':
        formated = this.betterDateTime(value);
        htmlEscaped = true;
        break;
      case 'timestamptz':
        formated = this.betterDateTimeZ(value);
        htmlEscaped = true;
        break;
      case 'date':
        formated = this.betterDate(value);
        htmlEscaped = true;
        break;
      case 'jsonb': case 'json':
        formated = this.formatJson(value);
        htmlEscaped = true;
        break;
      case 'bytea':
        var str = value.toString('ascii', 0, 100);
        formated = str;
        if (formated.length > truncateLimit) {
          formated = formated.slice(0, truncateLimit) + '...';
          isTruncated = true;
        }
        wrapTextSpan = true;
        break;
      case 'interval':
        formated = `${value.toPostgres()}`
        break;
    }

    if (Array.isArray(value)) {
      if (dataType == 'ARRAY') {
        formated = this.formatArray(value, format);
      } else {
        formated = this.formatJson(value);
        htmlEscaped = true
      }
    }

    if (!htmlEscaped && typeof formated == 'string') {
      formated = this.escapeHTML(formated);
    }

    if (wrapTextSpan) {
      var tooltip = isTruncated ? ` title="Truncated: ${originalLength} characters (full length available in editor)"` : '';
      formated = `<span class="text${isTruncated ? ' truncated' : ''}"${tooltip}>${formated}</span>`;
    }

    return formated;
  },

  formatArray: function (value, format) {
    var formatted = value.map((element) => {
      if (Array.isArray(element)) {
        return this.formatArray(element, format);
      } else {
        return this.formatCell(element, format);
      }
    });

    return '{' + formatted.join(',') + '}';
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

  formatJsonArray: function (value) {
    return '[' + value.map(this.formatJson.bind(this)).join(', ') + ']';
  },

  betterDateTime: function (date) {
    if (!date) return '';
    if (typeof date === 'string' || date instanceof Date) {
      date = moment.parseZone(date);
    }
    if (!date._d) date._d = date.toDate ? date.toDate() : new Date(date);
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
    if (!date) return '';
    if (typeof date === 'string' || date instanceof Date) {
      date = moment.parseZone(date);
    }
    if (!date._d) date._d = date.toDate ? date.toDate() : new Date(date);
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

  // 1999-01-08
  betterDate: function (date) {
    //var date = new Date(Date.parse(value));
    return '<time>' + strftime('%Y-%m-%d', date) + '</time>';
  },

  escapeHTML: function(unsafe) {
    if (unsafe.match(/[<>]/)) {
      var result = unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
      return result;
    } else {
      return unsafe;
    }
  },

};

module.exports = helpers;
