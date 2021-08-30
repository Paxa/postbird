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

var TRUNCATE_LONG_TEXT = 500;


var helpers = global.ViewCellHelpers = {

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

    var formated = value;
    if (!formated) return formated;

    var wrapTextSpan = false;
    var htmlEscaped = false;

    switch (format) {
      case 'hstore': case 'text': case 'tsvector':
        var formated = value.length > TRUNCATE_LONG_TEXT ? value.slice(0, TRUNCATE_LONG_TEXT) + '...' : value;
        wrapTextSpan = true
        // formated = `<span class="text">${shorterValue}</span>`;
        break;
      case 'xml':
        wrapTextSpan = true
        // formated = '<span class="text">' + value + '</span>';
        break;
      case 'varchar':
        if (typeof value == 'string' && value.length > 20) {
          var formated /*: any */ = value.length > TRUNCATE_LONG_TEXT ? value.slice(0, TRUNCATE_LONG_TEXT) + '...' : value;
          wrapTextSpan = true;
          // formated = `<span class="text">${shorterValue}</span>`;
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
        var formated = formated.length > TRUNCATE_LONG_TEXT ? formated.slice(0, TRUNCATE_LONG_TEXT) + '...' : formated;
        wrapTextSpan = true;
        //formated = value.length > 100 ? value.substr(0, 100) : value;
        break;
      case 'interval':
        formated = `${value.toPostgres()}`
        break;
    }

    if (dataType == 'ARRAY' && Array.isArray(value)) {
      formated = this.formatArray(value, format);
    } else if (['json[]', 'jsonb[]'].includes(dataType) && Array.isArray(value)) {
      formated = this.formatJsonArray(value);
      htmlEscaped = true;
    }

    if (!htmlEscaped && typeof formated == 'string') {
      formated = this.escapeHTML(formated);
    }

    if (wrapTextSpan) {
      formated = `<span class="text">${formated}</span>`;
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
