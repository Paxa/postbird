exports["_loader"] = function template(jade, locals) {
var jade_debug = [{ lineno: 1, filename: "/Users/pavel/Sites/postbird/views/_loader.jade" }];
try {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (undefined, message) {
var jade_indent = [];
jade_debug.unshift({ lineno: 0, filename: "/Users/pavel/Sites/postbird/views/_loader.jade" });
jade_debug.unshift({ lineno: 1, filename: "/Users/pavel/Sites/postbird/views/_loader.jade" });
buf.push("\n<div class=\"app-loader\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 2, filename: "/Users/pavel/Sites/postbird/views/_loader.jade" });
buf.push("<span>" + (jade.escape(null == (jade_interp = message) ? "" : jade_interp)));
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</span>");
jade_debug.shift();
jade_debug.unshift({ lineno: 3, filename: "/Users/pavel/Sites/postbird/views/_loader.jade" });
buf.push("<small>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 3, filename: jade_debug[0].filename });
buf.push("Please wait");
jade_debug.shift();
jade_debug.shift();
buf.push("</small>");
jade_debug.shift();
jade_debug.shift();
buf.push("</div>");
jade_debug.shift();
jade_debug.shift();}.call(this,"undefined" in locals_for_with?locals_for_with.undefined:typeof undefined!=="undefined"?undefined:undefined,"message" in locals_for_with?locals_for_with.message:typeof message!=="undefined"?message:undefined));;return buf.join("");
} catch (err) {
  jade.rethrow(err, jade_debug[0].filename, jade_debug[0].lineno, ".app-loader\n  span= message\n  small Please wait");
}
};
exports["_loader"].content = ".app-loader\n  span= message\n  small Please wait";
exports["content_tab"] = function template(jade, locals) {
var jade_debug = [{ lineno: 1, filename: "/Users/pavel/Sites/postbird/views/content_tab.jade" }];
try {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (undefined, data, types, formatCell) {
var jade_indent = [];
jade_debug.unshift({ lineno: 0, filename: "/Users/pavel/Sites/postbird/views/content_tab.jade" });
jade_debug.unshift({ lineno: 1, filename: "/Users/pavel/Sites/postbird/views/content_tab.jade" });
buf.push("\n<div class=\"big-data-table\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 2, filename: "/Users/pavel/Sites/postbird/views/content_tab.jade" });
buf.push("\n  <table class=\"native-view\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 3, filename: "/Users/pavel/Sites/postbird/views/content_tab.jade" });
buf.push("\n    <thead>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 4, filename: "/Users/pavel/Sites/postbird/views/content_tab.jade" });
buf.push("\n      <tr>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 5, filename: "/Users/pavel/Sites/postbird/views/content_tab.jade" });
// iterate data.fields
;(function(){
  var $$obj = data.fields;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var column = $$obj[$index];

jade_debug.unshift({ lineno: 5, filename: "/Users/pavel/Sites/postbird/views/content_tab.jade" });
jade_debug.unshift({ lineno: 6, filename: "/Users/pavel/Sites/postbird/views/content_tab.jade" });
buf.push("\n        <th" + (jade.cls(['format-' + types[column.name].real_format], [true])) + ">" + (jade.escape(null == (jade_interp = column.name) ? "" : jade_interp)));
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</th>");
jade_debug.shift();
jade_debug.shift();
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var column = $$obj[$index];

jade_debug.unshift({ lineno: 5, filename: "/Users/pavel/Sites/postbird/views/content_tab.jade" });
jade_debug.unshift({ lineno: 6, filename: "/Users/pavel/Sites/postbird/views/content_tab.jade" });
buf.push("\n        <th" + (jade.cls(['format-' + types[column.name].real_format], [true])) + ">" + (jade.escape(null == (jade_interp = column.name) ? "" : jade_interp)));
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</th>");
jade_debug.shift();
jade_debug.shift();
    }

  }
}).call(this);

jade_debug.shift();
jade_debug.shift();
buf.push("\n      </tr>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n    </thead>");
jade_debug.shift();
jade_debug.unshift({ lineno: 7, filename: "/Users/pavel/Sites/postbird/views/content_tab.jade" });
buf.push("\n    <tbody>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 8, filename: "/Users/pavel/Sites/postbird/views/content_tab.jade" });
// iterate data.rows
;(function(){
  var $$obj = data.rows;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var row = $$obj[$index];

jade_debug.unshift({ lineno: 8, filename: "/Users/pavel/Sites/postbird/views/content_tab.jade" });
jade_debug.unshift({ lineno: 9, filename: "/Users/pavel/Sites/postbird/views/content_tab.jade" });
buf.push("\n      <tr>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 10, filename: "/Users/pavel/Sites/postbird/views/content_tab.jade" });
// iterate data.fields
;(function(){
  var $$obj = data.fields;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var column = $$obj[$index];

jade_debug.unshift({ lineno: 10, filename: "/Users/pavel/Sites/postbird/views/content_tab.jade" });
jade_debug.unshift({ lineno: 11, filename: "/Users/pavel/Sites/postbird/views/content_tab.jade" });
buf.push("\n        <td>" + (null == (jade_interp = formatCell(row[column.name], types[column.name].real_format)) ? "" : jade_interp));
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</td>");
jade_debug.shift();
jade_debug.shift();
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var column = $$obj[$index];

jade_debug.unshift({ lineno: 10, filename: "/Users/pavel/Sites/postbird/views/content_tab.jade" });
jade_debug.unshift({ lineno: 11, filename: "/Users/pavel/Sites/postbird/views/content_tab.jade" });
buf.push("\n        <td>" + (null == (jade_interp = formatCell(row[column.name], types[column.name].real_format)) ? "" : jade_interp));
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</td>");
jade_debug.shift();
jade_debug.shift();
    }

  }
}).call(this);

jade_debug.shift();
jade_debug.shift();
buf.push("\n      </tr>");
jade_debug.shift();
jade_debug.shift();
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var row = $$obj[$index];

jade_debug.unshift({ lineno: 8, filename: "/Users/pavel/Sites/postbird/views/content_tab.jade" });
jade_debug.unshift({ lineno: 9, filename: "/Users/pavel/Sites/postbird/views/content_tab.jade" });
buf.push("\n      <tr>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 10, filename: "/Users/pavel/Sites/postbird/views/content_tab.jade" });
// iterate data.fields
;(function(){
  var $$obj = data.fields;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var column = $$obj[$index];

jade_debug.unshift({ lineno: 10, filename: "/Users/pavel/Sites/postbird/views/content_tab.jade" });
jade_debug.unshift({ lineno: 11, filename: "/Users/pavel/Sites/postbird/views/content_tab.jade" });
buf.push("\n        <td>" + (null == (jade_interp = formatCell(row[column.name], types[column.name].real_format)) ? "" : jade_interp));
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</td>");
jade_debug.shift();
jade_debug.shift();
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var column = $$obj[$index];

jade_debug.unshift({ lineno: 10, filename: "/Users/pavel/Sites/postbird/views/content_tab.jade" });
jade_debug.unshift({ lineno: 11, filename: "/Users/pavel/Sites/postbird/views/content_tab.jade" });
buf.push("\n        <td>" + (null == (jade_interp = formatCell(row[column.name], types[column.name].real_format)) ? "" : jade_interp));
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</td>");
jade_debug.shift();
jade_debug.shift();
    }

  }
}).call(this);

jade_debug.shift();
jade_debug.shift();
buf.push("\n      </tr>");
jade_debug.shift();
jade_debug.shift();
    }

  }
}).call(this);

jade_debug.shift();
jade_debug.shift();
buf.push("\n    </tbody>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n  </table>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n</div>");
jade_debug.shift();
jade_debug.unshift({ lineno: 13, filename: "/Users/pavel/Sites/postbird/views/content_tab.jade" });
buf.push("\n<div class=\"summary-and-pages native-footer-bar\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 14, filename: "/Users/pavel/Sites/postbird/views/content_tab.jade" });
buf.push("\n  <ul>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 15, filename: "/Users/pavel/Sites/postbird/views/content_tab.jade" });
buf.push("\n    <li>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 16, filename: "/Users/pavel/Sites/postbird/views/content_tab.jade" });
buf.push("<a>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 16, filename: jade_debug[0].filename });
buf.push("Add");
jade_debug.shift();
jade_debug.shift();
buf.push("</a>");
jade_debug.shift();
jade_debug.shift();
buf.push("</li>");
jade_debug.shift();
jade_debug.unshift({ lineno: 17, filename: "/Users/pavel/Sites/postbird/views/content_tab.jade" });
buf.push("\n    <li>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 18, filename: "/Users/pavel/Sites/postbird/views/content_tab.jade" });
buf.push("<a>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 18, filename: jade_debug[0].filename });
buf.push("Remove");
jade_debug.shift();
jade_debug.shift();
buf.push("</a>");
jade_debug.shift();
jade_debug.shift();
buf.push("</li>");
jade_debug.shift();
jade_debug.unshift({ lineno: 19, filename: "/Users/pavel/Sites/postbird/views/content_tab.jade" });
buf.push("\n    <li>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 20, filename: "/Users/pavel/Sites/postbird/views/content_tab.jade" });
buf.push("<a>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 20, filename: jade_debug[0].filename });
buf.push("Duplicate");
jade_debug.shift();
jade_debug.shift();
buf.push("</a>");
jade_debug.shift();
jade_debug.shift();
buf.push("</li>");
jade_debug.shift();
jade_debug.unshift({ lineno: 21, filename: "/Users/pavel/Sites/postbird/views/content_tab.jade" });
buf.push("\n    <li class=\"info\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</li>");
jade_debug.shift();
jade_debug.unshift({ lineno: 23, filename: "/Users/pavel/Sites/postbird/views/content_tab.jade" });
buf.push("\n    <li class=\"pages right\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 24, filename: "/Users/pavel/Sites/postbird/views/content_tab.jade" });
buf.push("<a exec=\"nextPage\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 24, filename: jade_debug[0].filename });
buf.push("Next");
jade_debug.shift();
jade_debug.shift();
buf.push("</a>");
jade_debug.shift();
jade_debug.shift();
buf.push("</li>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n  </ul>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n</div>");
jade_debug.shift();
jade_debug.shift();}.call(this,"undefined" in locals_for_with?locals_for_with.undefined:typeof undefined!=="undefined"?undefined:undefined,"data" in locals_for_with?locals_for_with.data:typeof data!=="undefined"?data:undefined,"types" in locals_for_with?locals_for_with.types:typeof types!=="undefined"?types:undefined,"formatCell" in locals_for_with?locals_for_with.formatCell:typeof formatCell!=="undefined"?formatCell:undefined));;return buf.join("");
} catch (err) {
  jade.rethrow(err, jade_debug[0].filename, jade_debug[0].lineno, ".big-data-table\n  table.native-view\n    thead\n      tr\n        each column in data.fields\n          th(class= 'format-' + types[column.name].real_format)= column.name\n    tbody\n      each row in data.rows\n        tr\n          each column in data.fields\n            td!= formatCell(row[column.name], types[column.name].real_format)\n\n.summary-and-pages.native-footer-bar\n  ul\n    li\n      a Add\n    li\n      a Remove\n    li\n      a Duplicate\n    li.info\n\n    li.pages.right\n      a(exec=\"nextPage\") Next");
}
};
exports["content_tab"].content = ".big-data-table\n  table.native-view\n    thead\n      tr\n        each column in data.fields\n          th(class= 'format-' + types[column.name].real_format)= column.name\n    tbody\n      each row in data.rows\n        tr\n          each column in data.fields\n            td!= formatCell(row[column.name], types[column.name].real_format)\n\n.summary-and-pages.native-footer-bar\n  ul\n    li\n      a Add\n    li\n      a Remove\n    li\n      a Duplicate\n    li.info\n\n    li.pages.right\n      a(exec=\"nextPage\") Next";
exports["db_rows_table"] = function template(jade, locals) {
var jade_debug = [{ lineno: 1, filename: "/Users/pavel/Sites/postbird/views/db_rows_table.jade" }];
try {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (undefined, data, formatCell) {
var jade_indent = [];
jade_debug.unshift({ lineno: 0, filename: "/Users/pavel/Sites/postbird/views/db_rows_table.jade" });
jade_debug.unshift({ lineno: 1, filename: "/Users/pavel/Sites/postbird/views/db_rows_table.jade" });
buf.push("\n<table class=\"native-view\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 2, filename: "/Users/pavel/Sites/postbird/views/db_rows_table.jade" });
buf.push("\n  <thead>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 3, filename: "/Users/pavel/Sites/postbird/views/db_rows_table.jade" });
buf.push("\n    <tr>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 4, filename: "/Users/pavel/Sites/postbird/views/db_rows_table.jade" });
// iterate data.fields
;(function(){
  var $$obj = data.fields;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var column = $$obj[$index];

jade_debug.unshift({ lineno: 4, filename: "/Users/pavel/Sites/postbird/views/db_rows_table.jade" });
jade_debug.unshift({ lineno: 5, filename: "/Users/pavel/Sites/postbird/views/db_rows_table.jade" });
buf.push("\n      <th class=\"format-text\">" + (jade.escape(null == (jade_interp = column.name) ? "" : jade_interp)));
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</th>");
jade_debug.shift();
jade_debug.shift();
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var column = $$obj[$index];

jade_debug.unshift({ lineno: 4, filename: "/Users/pavel/Sites/postbird/views/db_rows_table.jade" });
jade_debug.unshift({ lineno: 5, filename: "/Users/pavel/Sites/postbird/views/db_rows_table.jade" });
buf.push("\n      <th class=\"format-text\">" + (jade.escape(null == (jade_interp = column.name) ? "" : jade_interp)));
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</th>");
jade_debug.shift();
jade_debug.shift();
    }

  }
}).call(this);

jade_debug.shift();
jade_debug.shift();
buf.push("\n    </tr>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n  </thead>");
jade_debug.shift();
jade_debug.unshift({ lineno: 6, filename: "/Users/pavel/Sites/postbird/views/db_rows_table.jade" });
buf.push("\n  <tbody>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 7, filename: "/Users/pavel/Sites/postbird/views/db_rows_table.jade" });
// iterate data.rows
;(function(){
  var $$obj = data.rows;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var row = $$obj[$index];

jade_debug.unshift({ lineno: 7, filename: "/Users/pavel/Sites/postbird/views/db_rows_table.jade" });
jade_debug.unshift({ lineno: 8, filename: "/Users/pavel/Sites/postbird/views/db_rows_table.jade" });
buf.push("\n    <tr>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 9, filename: "/Users/pavel/Sites/postbird/views/db_rows_table.jade" });
// iterate data.fields
;(function(){
  var $$obj = data.fields;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var column = $$obj[$index];

jade_debug.unshift({ lineno: 9, filename: "/Users/pavel/Sites/postbird/views/db_rows_table.jade" });
jade_debug.unshift({ lineno: 10, filename: "/Users/pavel/Sites/postbird/views/db_rows_table.jade" });
buf.push("\n      <td>" + (null == (jade_interp = formatCell(row[column.name], 'text')) ? "" : jade_interp));
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</td>");
jade_debug.shift();
jade_debug.shift();
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var column = $$obj[$index];

jade_debug.unshift({ lineno: 9, filename: "/Users/pavel/Sites/postbird/views/db_rows_table.jade" });
jade_debug.unshift({ lineno: 10, filename: "/Users/pavel/Sites/postbird/views/db_rows_table.jade" });
buf.push("\n      <td>" + (null == (jade_interp = formatCell(row[column.name], 'text')) ? "" : jade_interp));
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</td>");
jade_debug.shift();
jade_debug.shift();
    }

  }
}).call(this);

jade_debug.shift();
jade_debug.shift();
buf.push("\n    </tr>");
jade_debug.shift();
jade_debug.shift();
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var row = $$obj[$index];

jade_debug.unshift({ lineno: 7, filename: "/Users/pavel/Sites/postbird/views/db_rows_table.jade" });
jade_debug.unshift({ lineno: 8, filename: "/Users/pavel/Sites/postbird/views/db_rows_table.jade" });
buf.push("\n    <tr>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 9, filename: "/Users/pavel/Sites/postbird/views/db_rows_table.jade" });
// iterate data.fields
;(function(){
  var $$obj = data.fields;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var column = $$obj[$index];

jade_debug.unshift({ lineno: 9, filename: "/Users/pavel/Sites/postbird/views/db_rows_table.jade" });
jade_debug.unshift({ lineno: 10, filename: "/Users/pavel/Sites/postbird/views/db_rows_table.jade" });
buf.push("\n      <td>" + (null == (jade_interp = formatCell(row[column.name], 'text')) ? "" : jade_interp));
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</td>");
jade_debug.shift();
jade_debug.shift();
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var column = $$obj[$index];

jade_debug.unshift({ lineno: 9, filename: "/Users/pavel/Sites/postbird/views/db_rows_table.jade" });
jade_debug.unshift({ lineno: 10, filename: "/Users/pavel/Sites/postbird/views/db_rows_table.jade" });
buf.push("\n      <td>" + (null == (jade_interp = formatCell(row[column.name], 'text')) ? "" : jade_interp));
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</td>");
jade_debug.shift();
jade_debug.shift();
    }

  }
}).call(this);

jade_debug.shift();
jade_debug.shift();
buf.push("\n    </tr>");
jade_debug.shift();
jade_debug.shift();
    }

  }
}).call(this);

jade_debug.shift();
jade_debug.shift();
buf.push("\n  </tbody>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n</table>");
jade_debug.shift();
jade_debug.shift();}.call(this,"undefined" in locals_for_with?locals_for_with.undefined:typeof undefined!=="undefined"?undefined:undefined,"data" in locals_for_with?locals_for_with.data:typeof data!=="undefined"?data:undefined,"formatCell" in locals_for_with?locals_for_with.formatCell:typeof formatCell!=="undefined"?formatCell:undefined));;return buf.join("");
} catch (err) {
  jade.rethrow(err, jade_debug[0].filename, jade_debug[0].lineno, "table.native-view\n  thead\n    tr\n      each column in data.fields\n        th(class= 'format-text')= column.name\n  tbody\n    each row in data.rows\n      tr\n        each column in data.fields\n          td!= formatCell(row[column.name], 'text')\n");
}
};
exports["db_rows_table"].content = "table.native-view\n  thead\n    tr\n      each column in data.fields\n        th(class= 'format-text')= column.name\n  tbody\n    each row in data.rows\n      tr\n        each column in data.fields\n          td!= formatCell(row[column.name], 'text')\n";
exports["dialogs/column_form"] = function template(jade, locals) {
var jade_debug = [{ lineno: 1, filename: "/Users/pavel/Sites/postbird/views/dialogs/column_form.jade" }];
try {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (data, undefined, groupedTypes, action) {
var jade_indent = [];
jade_debug.unshift({ lineno: 0, filename: "/Users/pavel/Sites/postbird/views/dialogs/column_form.jade" });
jade_debug.unshift({ lineno: 1, filename: "/Users/pavel/Sites/postbird/views/dialogs/column_form.jade" });
data = data || {}
jade_debug.shift();
jade_debug.unshift({ lineno: 3, filename: "/Users/pavel/Sites/postbird/views/dialogs/column_form.jade" });
buf.push("\n<form>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 4, filename: "/Users/pavel/Sites/postbird/views/dialogs/column_form.jade" });
buf.push("\n  <p>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 5, filename: "/Users/pavel/Sites/postbird/views/dialogs/column_form.jade" });
buf.push("\n    <label>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 5, filename: jade_debug[0].filename });
buf.push("Name");
jade_debug.shift();
jade_debug.shift();
buf.push("</label>");
jade_debug.shift();
jade_debug.unshift({ lineno: 6, filename: "/Users/pavel/Sites/postbird/views/dialogs/column_form.jade" });
buf.push("\n    <input name=\"name\"" + (jade.attr("value", data.column_name, true, false)) + "/>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n  </p>");
jade_debug.shift();
jade_debug.unshift({ lineno: 8, filename: "/Users/pavel/Sites/postbird/views/dialogs/column_form.jade" });
buf.push("\n  <p>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 9, filename: "/Users/pavel/Sites/postbird/views/dialogs/column_form.jade" });
buf.push("\n    <label>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 9, filename: jade_debug[0].filename });
buf.push("Type");
jade_debug.shift();
jade_debug.shift();
buf.push("</label>");
jade_debug.shift();
jade_debug.unshift({ lineno: 10, filename: "/Users/pavel/Sites/postbird/views/dialogs/column_form.jade" });
buf.push("\n    <select name=\"type\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 11, filename: "/Users/pavel/Sites/postbird/views/dialogs/column_form.jade" });
buf.push("\n      <option>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</option>");
jade_debug.shift();
jade_debug.unshift({ lineno: 12, filename: "/Users/pavel/Sites/postbird/views/dialogs/column_form.jade" });
// iterate groupedTypes
;(function(){
  var $$obj = groupedTypes;
  if ('number' == typeof $$obj.length) {

    for (var group = 0, $$l = $$obj.length; group < $$l; group++) {
      var types = $$obj[group];

jade_debug.unshift({ lineno: 12, filename: "/Users/pavel/Sites/postbird/views/dialogs/column_form.jade" });
jade_debug.unshift({ lineno: 13, filename: "/Users/pavel/Sites/postbird/views/dialogs/column_form.jade" });
buf.push("\n      <optgroup" + (jade.attr("label", group, true, false)) + ">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</optgroup>");
jade_debug.shift();
jade_debug.unshift({ lineno: 14, filename: "/Users/pavel/Sites/postbird/views/dialogs/column_form.jade" });
// iterate types
;(function(){
  var $$obj = types;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var type = $$obj[$index];

jade_debug.unshift({ lineno: 14, filename: "/Users/pavel/Sites/postbird/views/dialogs/column_form.jade" });
jade_debug.unshift({ lineno: 15, filename: "/Users/pavel/Sites/postbird/views/dialogs/column_form.jade" });
if ( type)
{
jade_debug.unshift({ lineno: 16, filename: "/Users/pavel/Sites/postbird/views/dialogs/column_form.jade" });
jade_debug.unshift({ lineno: 16, filename: "/Users/pavel/Sites/postbird/views/dialogs/column_form.jade" });
buf.push("\n      <option" + (jade.attr("value", type.name, true, false)) + (jade.attr("title", type.description, true, false)) + (jade.attr("selected", (data.data_type == type.name), true, false)) + ">" + (jade.escape(null == (jade_interp = type.name) ? "" : jade_interp)));
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</option>");
jade_debug.shift();
jade_debug.shift();
}
jade_debug.shift();
jade_debug.shift();
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var type = $$obj[$index];

jade_debug.unshift({ lineno: 14, filename: "/Users/pavel/Sites/postbird/views/dialogs/column_form.jade" });
jade_debug.unshift({ lineno: 15, filename: "/Users/pavel/Sites/postbird/views/dialogs/column_form.jade" });
if ( type)
{
jade_debug.unshift({ lineno: 16, filename: "/Users/pavel/Sites/postbird/views/dialogs/column_form.jade" });
jade_debug.unshift({ lineno: 16, filename: "/Users/pavel/Sites/postbird/views/dialogs/column_form.jade" });
buf.push("\n      <option" + (jade.attr("value", type.name, true, false)) + (jade.attr("title", type.description, true, false)) + (jade.attr("selected", (data.data_type == type.name), true, false)) + ">" + (jade.escape(null == (jade_interp = type.name) ? "" : jade_interp)));
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</option>");
jade_debug.shift();
jade_debug.shift();
}
jade_debug.shift();
jade_debug.shift();
    }

  }
}).call(this);

jade_debug.shift();
jade_debug.shift();
    }

  } else {
    var $$l = 0;
    for (var group in $$obj) {
      $$l++;      var types = $$obj[group];

jade_debug.unshift({ lineno: 12, filename: "/Users/pavel/Sites/postbird/views/dialogs/column_form.jade" });
jade_debug.unshift({ lineno: 13, filename: "/Users/pavel/Sites/postbird/views/dialogs/column_form.jade" });
buf.push("\n      <optgroup" + (jade.attr("label", group, true, false)) + ">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</optgroup>");
jade_debug.shift();
jade_debug.unshift({ lineno: 14, filename: "/Users/pavel/Sites/postbird/views/dialogs/column_form.jade" });
// iterate types
;(function(){
  var $$obj = types;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var type = $$obj[$index];

jade_debug.unshift({ lineno: 14, filename: "/Users/pavel/Sites/postbird/views/dialogs/column_form.jade" });
jade_debug.unshift({ lineno: 15, filename: "/Users/pavel/Sites/postbird/views/dialogs/column_form.jade" });
if ( type)
{
jade_debug.unshift({ lineno: 16, filename: "/Users/pavel/Sites/postbird/views/dialogs/column_form.jade" });
jade_debug.unshift({ lineno: 16, filename: "/Users/pavel/Sites/postbird/views/dialogs/column_form.jade" });
buf.push("\n      <option" + (jade.attr("value", type.name, true, false)) + (jade.attr("title", type.description, true, false)) + (jade.attr("selected", (data.data_type == type.name), true, false)) + ">" + (jade.escape(null == (jade_interp = type.name) ? "" : jade_interp)));
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</option>");
jade_debug.shift();
jade_debug.shift();
}
jade_debug.shift();
jade_debug.shift();
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var type = $$obj[$index];

jade_debug.unshift({ lineno: 14, filename: "/Users/pavel/Sites/postbird/views/dialogs/column_form.jade" });
jade_debug.unshift({ lineno: 15, filename: "/Users/pavel/Sites/postbird/views/dialogs/column_form.jade" });
if ( type)
{
jade_debug.unshift({ lineno: 16, filename: "/Users/pavel/Sites/postbird/views/dialogs/column_form.jade" });
jade_debug.unshift({ lineno: 16, filename: "/Users/pavel/Sites/postbird/views/dialogs/column_form.jade" });
buf.push("\n      <option" + (jade.attr("value", type.name, true, false)) + (jade.attr("title", type.description, true, false)) + (jade.attr("selected", (data.data_type == type.name), true, false)) + ">" + (jade.escape(null == (jade_interp = type.name) ? "" : jade_interp)));
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</option>");
jade_debug.shift();
jade_debug.shift();
}
jade_debug.shift();
jade_debug.shift();
    }

  }
}).call(this);

jade_debug.shift();
jade_debug.shift();
    }

  }
}).call(this);

jade_debug.shift();
jade_debug.shift();
buf.push("\n    </select>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n  </p>");
jade_debug.shift();
jade_debug.unshift({ lineno: 17, filename: "/Users/pavel/Sites/postbird/views/dialogs/column_form.jade" });
buf.push("\n  <p>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 18, filename: "/Users/pavel/Sites/postbird/views/dialogs/column_form.jade" });
buf.push("See ");
jade_debug.shift();
jade_debug.unshift({ lineno: 19, filename: "/Users/pavel/Sites/postbird/views/dialogs/column_form.jade" });
buf.push("<a href=\"http://www.postgresql.org/docs/8.4/static/datatype.html\" target=\"new\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 19, filename: jade_debug[0].filename });
buf.push("documentation for datatypes");
jade_debug.shift();
jade_debug.shift();
buf.push("</a>");
jade_debug.shift();
jade_debug.unshift({ lineno: 21, filename: "/Users/pavel/Sites/postbird/views/dialogs/column_form.jade" });
buf.push("\n    <p>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</p>");
jade_debug.shift();
jade_debug.unshift({ lineno: 22, filename: "/Users/pavel/Sites/postbird/views/dialogs/column_form.jade" });
buf.push("\n    <label>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 22, filename: jade_debug[0].filename });
buf.push("Default value");
jade_debug.shift();
jade_debug.shift();
buf.push("</label>");
jade_debug.shift();
jade_debug.unshift({ lineno: 23, filename: "/Users/pavel/Sites/postbird/views/dialogs/column_form.jade" });
buf.push("\n    <input name=\"default_value\"" + (jade.attr("value", data.column_default, true, false)) + "/>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n  </p>");
jade_debug.shift();
jade_debug.unshift({ lineno: 25, filename: "/Users/pavel/Sites/postbird/views/dialogs/column_form.jade" });
buf.push("\n  <p>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 26, filename: "/Users/pavel/Sites/postbird/views/dialogs/column_form.jade" });
buf.push("\n    <label>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 26, filename: jade_debug[0].filename });
buf.push("Max length");
jade_debug.shift();
jade_debug.shift();
buf.push("</label>");
jade_debug.shift();
jade_debug.unshift({ lineno: 27, filename: "/Users/pavel/Sites/postbird/views/dialogs/column_form.jade" });
buf.push("\n    <input name=\"max_length\"" + (jade.attr("value", data.character_maximum_length, true, false)) + "/>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n  </p>");
jade_debug.shift();
jade_debug.unshift({ lineno: 29, filename: "/Users/pavel/Sites/postbird/views/dialogs/column_form.jade" });
buf.push("\n  <p>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 30, filename: "/Users/pavel/Sites/postbird/views/dialogs/column_form.jade" });
buf.push("\n    <label>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 31, filename: "/Users/pavel/Sites/postbird/views/dialogs/column_form.jade" });
buf.push("\n      <input type=\"hidden\" name=\"allow_null\" value=\"0\"/>");
jade_debug.shift();
jade_debug.unshift({ lineno: 32, filename: "/Users/pavel/Sites/postbird/views/dialogs/column_form.jade" });
buf.push("\n      <input type=\"checkbox\" name=\"allow_null\" value=\"1\"" + (jade.attr("checked", (data.is_nullable == 'YES'), true, false)) + "/>");
jade_debug.shift();
jade_debug.unshift({ lineno: 33, filename: "/Users/pavel/Sites/postbird/views/dialogs/column_form.jade" });
buf.push("Allow null");
jade_debug.shift();
jade_debug.shift();
buf.push("\n    </label>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n  </p>");
jade_debug.shift();
jade_debug.unshift({ lineno: 35, filename: "/Users/pavel/Sites/postbird/views/dialogs/column_form.jade" });
buf.push("\n  <input type=\"submit\" class=\"pseudo-hidden\"/>");
jade_debug.shift();
jade_debug.unshift({ lineno: 36, filename: "/Users/pavel/Sites/postbird/views/dialogs/column_form.jade" });
buf.push("\n  <p class=\"buttons\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 37, filename: "/Users/pavel/Sites/postbird/views/dialogs/column_form.jade" });
if ( action == "edit")
{
jade_debug.unshift({ lineno: 38, filename: "/Users/pavel/Sites/postbird/views/dialogs/column_form.jade" });
jade_debug.unshift({ lineno: 38, filename: "/Users/pavel/Sites/postbird/views/dialogs/column_form.jade" });
buf.push("\n    <button class=\"ok\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 38, filename: jade_debug[0].filename });
buf.push("Update column");
jade_debug.shift();
jade_debug.shift();
buf.push("</button>");
jade_debug.shift();
jade_debug.shift();
}
else
{
jade_debug.unshift({ lineno: 40, filename: "/Users/pavel/Sites/postbird/views/dialogs/column_form.jade" });
jade_debug.unshift({ lineno: 40, filename: "/Users/pavel/Sites/postbird/views/dialogs/column_form.jade" });
buf.push("\n    <button class=\"ok\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 40, filename: jade_debug[0].filename });
buf.push("Add column");
jade_debug.shift();
jade_debug.shift();
buf.push("</button>");
jade_debug.shift();
jade_debug.shift();
}
jade_debug.shift();
jade_debug.unshift({ lineno: 41, filename: "/Users/pavel/Sites/postbird/views/dialogs/column_form.jade" });
buf.push("\n    <button class=\"cancel\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 41, filename: jade_debug[0].filename });
buf.push("cancel");
jade_debug.shift();
jade_debug.shift();
buf.push("</button>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n  </p>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n</form>");
jade_debug.shift();
jade_debug.shift();}.call(this,"data" in locals_for_with?locals_for_with.data:typeof data!=="undefined"?data:undefined,"undefined" in locals_for_with?locals_for_with.undefined:typeof undefined!=="undefined"?undefined:undefined,"groupedTypes" in locals_for_with?locals_for_with.groupedTypes:typeof groupedTypes!=="undefined"?groupedTypes:undefined,"action" in locals_for_with?locals_for_with.action:typeof action!=="undefined"?action:undefined));;return buf.join("");
} catch (err) {
  jade.rethrow(err, jade_debug[0].filename, jade_debug[0].lineno, "- data = data || {}\n\nform\n  p\n    label Name\n    input(name=\"name\", value = data.column_name)\n\n  p\n    label Type\n    select(name=\"type\")\n      option\n      each types, group in groupedTypes\n        optgroup(label = group)\n        each type in types\n          if type\n            option(value = type.name, title = type.description, selected = (data.data_type == type.name))= type.name\n  p\n    = \"See \"\n    a(href=\"http://www.postgresql.org/docs/8.4/static/datatype.html\", target=\"new\") documentation for datatypes\n\n    p\n    label Default value\n    input(name=\"default_value\", value = data.column_default)\n\n  p\n    label Max length\n    input(name=\"max_length\", value = data.character_maximum_length)\n\n  p\n    label\n      input(type=\"hidden\", name=\"allow_null\" value=\"0\")\n      input(type=\"checkbox\" name=\"allow_null\" value=\"1\", checked = (data.is_nullable == 'YES'))\n      = \"Allow null\"\n\n  input.pseudo-hidden(type=\"submit\")\n  p.buttons\n    if action == \"edit\"\n        button.ok Update column\n    else\n        button.ok Add column\n    button.cancel cancel\n");
}
};
exports["dialogs/column_form"].content = "- data = data || {}\n\nform\n  p\n    label Name\n    input(name=\"name\", value = data.column_name)\n\n  p\n    label Type\n    select(name=\"type\")\n      option\n      each types, group in groupedTypes\n        optgroup(label = group)\n        each type in types\n          if type\n            option(value = type.name, title = type.description, selected = (data.data_type == type.name))= type.name\n  p\n    = \"See \"\n    a(href=\"http://www.postgresql.org/docs/8.4/static/datatype.html\", target=\"new\") documentation for datatypes\n\n    p\n    label Default value\n    input(name=\"default_value\", value = data.column_default)\n\n  p\n    label Max length\n    input(name=\"max_length\", value = data.character_maximum_length)\n\n  p\n    label\n      input(type=\"hidden\", name=\"allow_null\" value=\"0\")\n      input(type=\"checkbox\" name=\"allow_null\" value=\"1\", checked = (data.is_nullable == 'YES'))\n      = \"Allow null\"\n\n  input.pseudo-hidden(type=\"submit\")\n  p.buttons\n    if action == \"edit\"\n        button.ok Update column\n    else\n        button.ok Add column\n    button.cancel cancel\n";
exports["dialogs/heroku_connection"] = function template(jade, locals) {
var jade_debug = [{ lineno: 1, filename: "/Users/pavel/Sites/postbird/views/dialogs/heroku_connection.jade" }];
try {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (name, undefined, connectionUrl) {
var jade_indent = [];
jade_debug.unshift({ lineno: 0, filename: "/Users/pavel/Sites/postbird/views/dialogs/heroku_connection.jade" });
jade_debug.unshift({ lineno: 1, filename: "/Users/pavel/Sites/postbird/views/dialogs/heroku_connection.jade" });
buf.push("<strong>" + (jade.escape(null == (jade_interp = name) ? "" : jade_interp)));
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</strong>");
jade_debug.shift();
jade_debug.unshift({ lineno: 3, filename: "/Users/pavel/Sites/postbird/views/dialogs/heroku_connection.jade" });
buf.push("<code class=\"connection-info\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 4, filename: "/Users/pavel/Sites/postbird/views/dialogs/heroku_connection.jade" });
buf.push(jade.escape(null == (jade_interp = connectionUrl) ? "" : jade_interp));
jade_debug.shift();
jade_debug.shift();
buf.push("</code>");
jade_debug.shift();
jade_debug.unshift({ lineno: 6, filename: "/Users/pavel/Sites/postbird/views/dialogs/heroku_connection.jade" });
buf.push("\n<p>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 7, filename: "/Users/pavel/Sites/postbird/views/dialogs/heroku_connection.jade" });
buf.push("<i>Note: This information can be changed in future by heroku");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</i>");
jade_debug.shift();
jade_debug.shift();
buf.push("</p>");
jade_debug.shift();
jade_debug.unshift({ lineno: 9, filename: "/Users/pavel/Sites/postbird/views/dialogs/heroku_connection.jade" });
buf.push("\n<button class=\"save-conn native-look\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 9, filename: jade_debug[0].filename });
buf.push("Save locally");
jade_debug.shift();
jade_debug.shift();
buf.push("</button>");
jade_debug.shift();
jade_debug.unshift({ lineno: 10, filename: "/Users/pavel/Sites/postbird/views/dialogs/heroku_connection.jade" });
buf.push("\n<button autofocus=\"autofocus\" class=\"cancel native-look\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 10, filename: jade_debug[0].filename });
buf.push("Close");
jade_debug.shift();
jade_debug.shift();
buf.push("</button>");
jade_debug.shift();
jade_debug.shift();}.call(this,"name" in locals_for_with?locals_for_with.name:typeof name!=="undefined"?name:undefined,"undefined" in locals_for_with?locals_for_with.undefined:typeof undefined!=="undefined"?undefined:undefined,"connectionUrl" in locals_for_with?locals_for_with.connectionUrl:typeof connectionUrl!=="undefined"?connectionUrl:undefined));;return buf.join("");
} catch (err) {
  jade.rethrow(err, jade_debug[0].filename, jade_debug[0].lineno, "strong= name\n\ncode.connection-info\n  = connectionUrl\n\np\n  i= \"Note: This information can be changed in future by heroku\"\n\nbutton.save-conn.native-look Save locally\nbutton.cancel.native-look(autofocus=true) Close");
}
};
exports["dialogs/heroku_connection"].content = "strong= name\n\ncode.connection-info\n  = connectionUrl\n\np\n  i= \"Note: This information can be changed in future by heroku\"\n\nbutton.save-conn.native-look Save locally\nbutton.cancel.native-look(autofocus=true) Close";
exports["dialogs/import_file"] = function template(jade, locals) {
var jade_debug = [{ lineno: 1, filename: "/Users/pavel/Sites/postbird/views/dialogs/import_file.jade" }];
try {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (undefined, filename, databases, currentDb) {
var jade_indent = [];
jade_debug.unshift({ lineno: 0, filename: "/Users/pavel/Sites/postbird/views/dialogs/import_file.jade" });
jade_debug.unshift({ lineno: 1, filename: "/Users/pavel/Sites/postbird/views/dialogs/import_file.jade" });
buf.push("\n<header>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 2, filename: "/Users/pavel/Sites/postbird/views/dialogs/import_file.jade" });
buf.push("Importing file:");
jade_debug.shift();
jade_debug.unshift({ lineno: 3, filename: "/Users/pavel/Sites/postbird/views/dialogs/import_file.jade" });
buf.push("<code>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 4, filename: "/Users/pavel/Sites/postbird/views/dialogs/import_file.jade" });
buf.push(jade.escape(null == (jade_interp = filename) ? "" : jade_interp));
jade_debug.shift();
jade_debug.shift();
buf.push("</code>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n</header>");
jade_debug.shift();
jade_debug.unshift({ lineno: 6, filename: "/Users/pavel/Sites/postbird/views/dialogs/import_file.jade" });
buf.push("\n<form>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 7, filename: "/Users/pavel/Sites/postbird/views/dialogs/import_file.jade" });
buf.push("\n  <p>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 8, filename: "/Users/pavel/Sites/postbird/views/dialogs/import_file.jade" });
buf.push("\n    <label>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 8, filename: jade_debug[0].filename });
buf.push("Database");
jade_debug.shift();
jade_debug.shift();
buf.push("</label>");
jade_debug.shift();
jade_debug.unshift({ lineno: 9, filename: "/Users/pavel/Sites/postbird/views/dialogs/import_file.jade" });
buf.push("\n    <select name=\"database\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 10, filename: "/Users/pavel/Sites/postbird/views/dialogs/import_file.jade" });
// iterate databases
;(function(){
  var $$obj = databases;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var database = $$obj[$index];

jade_debug.unshift({ lineno: 10, filename: "/Users/pavel/Sites/postbird/views/dialogs/import_file.jade" });
jade_debug.unshift({ lineno: 11, filename: "/Users/pavel/Sites/postbird/views/dialogs/import_file.jade" });
buf.push("\n      <option" + (jade.attr("value", database, true, false)) + (jade.attr("selected", (database == currentDb), true, false)) + ">" + (jade.escape(null == (jade_interp = database) ? "" : jade_interp)));
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</option>");
jade_debug.shift();
jade_debug.shift();
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var database = $$obj[$index];

jade_debug.unshift({ lineno: 10, filename: "/Users/pavel/Sites/postbird/views/dialogs/import_file.jade" });
jade_debug.unshift({ lineno: 11, filename: "/Users/pavel/Sites/postbird/views/dialogs/import_file.jade" });
buf.push("\n      <option" + (jade.attr("value", database, true, false)) + (jade.attr("selected", (database == currentDb), true, false)) + ">" + (jade.escape(null == (jade_interp = database) ? "" : jade_interp)));
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</option>");
jade_debug.shift();
jade_debug.shift();
    }

  }
}).call(this);

jade_debug.shift();
jade_debug.unshift({ lineno: 13, filename: "/Users/pavel/Sites/postbird/views/dialogs/import_file.jade" });
buf.push("\n      <option disabled=\"disabled\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 13, filename: jade_debug[0].filename });
buf.push("-----");
jade_debug.shift();
jade_debug.shift();
buf.push("</option>");
jade_debug.shift();
jade_debug.unshift({ lineno: 14, filename: "/Users/pavel/Sites/postbird/views/dialogs/import_file.jade" });
buf.push("\n      <option value=\"**create-db**\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 14, filename: jade_debug[0].filename });
buf.push("Create database");
jade_debug.shift();
jade_debug.shift();
buf.push("</option>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n    </select>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n  </p>");
jade_debug.shift();
jade_debug.unshift({ lineno: 16, filename: "/Users/pavel/Sites/postbird/views/dialogs/import_file.jade" });
buf.push("\n  <p class=\"new-database-input is-hidden\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 17, filename: "/Users/pavel/Sites/postbird/views/dialogs/import_file.jade" });
buf.push("\n    <label>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 17, filename: jade_debug[0].filename });
buf.push("New database");
jade_debug.shift();
jade_debug.shift();
buf.push("</label>");
jade_debug.shift();
jade_debug.unshift({ lineno: 18, filename: "/Users/pavel/Sites/postbird/views/dialogs/import_file.jade" });
buf.push("\n    <input name=\"new_database_name\"/>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n  </p>");
jade_debug.shift();
jade_debug.unshift({ lineno: 20, filename: "/Users/pavel/Sites/postbird/views/dialogs/import_file.jade" });
buf.push("\n  <input type=\"submit\" class=\"pseudo-hidden\"/>");
jade_debug.shift();
jade_debug.unshift({ lineno: 22, filename: "/Users/pavel/Sites/postbird/views/dialogs/import_file.jade" });
buf.push("<code class=\"result\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</code>");
jade_debug.shift();
jade_debug.unshift({ lineno: 24, filename: "/Users/pavel/Sites/postbird/views/dialogs/import_file.jade" });
buf.push("\n  <p class=\"buttons\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 25, filename: "/Users/pavel/Sites/postbird/views/dialogs/import_file.jade" });
buf.push("\n    <button class=\"ok\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 25, filename: jade_debug[0].filename });
buf.push("Import file");
jade_debug.shift();
jade_debug.shift();
buf.push("</button>");
jade_debug.shift();
jade_debug.unshift({ lineno: 26, filename: "/Users/pavel/Sites/postbird/views/dialogs/import_file.jade" });
buf.push("\n    <button class=\"cancel\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 26, filename: jade_debug[0].filename });
buf.push("cancel");
jade_debug.shift();
jade_debug.shift();
buf.push("</button>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n  </p>");
jade_debug.shift();
jade_debug.unshift({ lineno: 27, filename: "/Users/pavel/Sites/postbird/views/dialogs/import_file.jade" });
buf.push("\n  <p class=\"buttons close-btn is-hidden\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 28, filename: "/Users/pavel/Sites/postbird/views/dialogs/import_file.jade" });
buf.push("\n    <button class=\"cancel\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 28, filename: jade_debug[0].filename });
buf.push("Close");
jade_debug.shift();
jade_debug.shift();
buf.push("</button>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n  </p>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n</form>");
jade_debug.shift();
jade_debug.shift();}.call(this,"undefined" in locals_for_with?locals_for_with.undefined:typeof undefined!=="undefined"?undefined:undefined,"filename" in locals_for_with?locals_for_with.filename:typeof filename!=="undefined"?filename:undefined,"databases" in locals_for_with?locals_for_with.databases:typeof databases!=="undefined"?databases:undefined,"currentDb" in locals_for_with?locals_for_with.currentDb:typeof currentDb!=="undefined"?currentDb:undefined));;return buf.join("");
} catch (err) {
  jade.rethrow(err, jade_debug[0].filename, jade_debug[0].lineno, "header\n  = \"Importing file:\"\n  code\n    = filename\n\nform\n  p\n    label Database\n    select(name=\"database\")\n      each database in databases\n        option( value = database, selected = (database == currentDb) )= database\n\n      option(disabled = true) -----\n      option(value = '**create-db**') Create database\n\n  p.new-database-input.is-hidden\n    label New database\n    input(name=\"new_database_name\")\n\n  input.pseudo-hidden(type=\"submit\")\n\n  code.result\n\n  p.buttons\n    button.ok Import file\n    button.cancel cancel\n  p.buttons.close-btn.is-hidden\n    button.cancel Close");
}
};
exports["dialogs/import_file"].content = "header\n  = \"Importing file:\"\n  code\n    = filename\n\nform\n  p\n    label Database\n    select(name=\"database\")\n      each database in databases\n        option( value = database, selected = (database == currentDb) )= database\n\n      option(disabled = true) -----\n      option(value = '**create-db**') Create database\n\n  p.new-database-input.is-hidden\n    label New database\n    input(name=\"new_database_name\")\n\n  input.pseudo-hidden(type=\"submit\")\n\n  code.result\n\n  p.buttons\n    button.ok Import file\n    button.cancel cancel\n  p.buttons.close-btn.is-hidden\n    button.cancel Close";
exports["dialogs/new_database"] = function template(jade, locals) {
var jade_debug = [{ lineno: 1, filename: "/Users/pavel/Sites/postbird/views/dialogs/new_database.jade" }];
try {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (undefined) {
var jade_indent = [];
jade_debug.unshift({ lineno: 0, filename: "/Users/pavel/Sites/postbird/views/dialogs/new_database.jade" });
jade_debug.unshift({ lineno: 1, filename: "/Users/pavel/Sites/postbird/views/dialogs/new_database.jade" });
buf.push("\n<form>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 2, filename: "/Users/pavel/Sites/postbird/views/dialogs/new_database.jade" });
buf.push("\n  <p>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 3, filename: "/Users/pavel/Sites/postbird/views/dialogs/new_database.jade" });
buf.push("\n    <label>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 3, filename: jade_debug[0].filename });
buf.push("Database");
jade_debug.shift();
jade_debug.shift();
buf.push("</label>");
jade_debug.shift();
jade_debug.unshift({ lineno: 4, filename: "/Users/pavel/Sites/postbird/views/dialogs/new_database.jade" });
buf.push("\n    <input type=\"text\" name=\"dbname\"/>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n  </p>");
jade_debug.shift();
jade_debug.unshift({ lineno: 5, filename: "/Users/pavel/Sites/postbird/views/dialogs/new_database.jade" });
buf.push("\n  <p>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 6, filename: "/Users/pavel/Sites/postbird/views/dialogs/new_database.jade" });
buf.push("\n    <label>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 6, filename: jade_debug[0].filename });
buf.push("Template");
jade_debug.shift();
jade_debug.shift();
buf.push("</label>");
jade_debug.shift();
jade_debug.unshift({ lineno: 7, filename: "/Users/pavel/Sites/postbird/views/dialogs/new_database.jade" });
buf.push("\n    <select name=\"template\" class=\"template\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</select>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n  </p>");
jade_debug.shift();
jade_debug.unshift({ lineno: 8, filename: "/Users/pavel/Sites/postbird/views/dialogs/new_database.jade" });
buf.push("\n  <p>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 9, filename: "/Users/pavel/Sites/postbird/views/dialogs/new_database.jade" });
buf.push("\n    <label>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 9, filename: jade_debug[0].filename });
buf.push("Encoding");
jade_debug.shift();
jade_debug.shift();
buf.push("</label>");
jade_debug.shift();
jade_debug.unshift({ lineno: 10, filename: "/Users/pavel/Sites/postbird/views/dialogs/new_database.jade" });
buf.push("\n    <select name=\"encoding\" class=\"encoding\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</select>");
jade_debug.shift();
jade_debug.unshift({ lineno: 12, filename: "/Users/pavel/Sites/postbird/views/dialogs/new_database.jade" });
buf.push("\n    <input type=\"submit\" class=\"pseudo-hidden\"/>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n  </p>");
jade_debug.shift();
jade_debug.unshift({ lineno: 13, filename: "/Users/pavel/Sites/postbird/views/dialogs/new_database.jade" });
buf.push("\n  <p class=\"buttons\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 14, filename: "/Users/pavel/Sites/postbird/views/dialogs/new_database.jade" });
buf.push("\n    <button class=\"ok\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 14, filename: jade_debug[0].filename });
buf.push("Create database");
jade_debug.shift();
jade_debug.shift();
buf.push("</button>");
jade_debug.shift();
jade_debug.unshift({ lineno: 15, filename: "/Users/pavel/Sites/postbird/views/dialogs/new_database.jade" });
buf.push("\n    <button class=\"cancel\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 15, filename: jade_debug[0].filename });
buf.push("cancel");
jade_debug.shift();
jade_debug.shift();
buf.push("</button>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n  </p>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n</form>");
jade_debug.shift();
jade_debug.shift();}.call(this,"undefined" in locals_for_with?locals_for_with.undefined:typeof undefined!=="undefined"?undefined:undefined));;return buf.join("");
} catch (err) {
  jade.rethrow(err, jade_debug[0].filename, jade_debug[0].lineno, "form\n  p\n    label Database\n    input(type=\"text\" name=\"dbname\")\n  p\n    label Template\n    select.template(name=\"template\")\n  p\n    label Encoding\n    select.encoding(name=\"encoding\")\n\n    input.pseudo-hidden(type=\"submit\")\n  p.buttons\n    button.ok Create database\n    button.cancel cancel\n");
}
};
exports["dialogs/new_database"].content = "form\n  p\n    label Database\n    input(type=\"text\" name=\"dbname\")\n  p\n    label Template\n    select.template(name=\"template\")\n  p\n    label Encoding\n    select.encoding(name=\"encoding\")\n\n    input.pseudo-hidden(type=\"submit\")\n  p.buttons\n    button.ok Create database\n    button.cancel cancel\n";
exports["dialogs/new_table"] = function template(jade, locals) {
var jade_debug = [{ lineno: 1, filename: "/Users/pavel/Sites/postbird/views/dialogs/new_table.jade" }];
try {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (undefined) {
var jade_indent = [];
jade_debug.unshift({ lineno: 0, filename: "/Users/pavel/Sites/postbird/views/dialogs/new_table.jade" });
jade_debug.unshift({ lineno: 1, filename: "/Users/pavel/Sites/postbird/views/dialogs/new_table.jade" });
buf.push("\n<form>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 2, filename: "/Users/pavel/Sites/postbird/views/dialogs/new_table.jade" });
buf.push("\n  <p>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 3, filename: "/Users/pavel/Sites/postbird/views/dialogs/new_table.jade" });
buf.push("\n    <label>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 3, filename: jade_debug[0].filename });
buf.push("Table name");
jade_debug.shift();
jade_debug.shift();
buf.push("</label>");
jade_debug.shift();
jade_debug.unshift({ lineno: 4, filename: "/Users/pavel/Sites/postbird/views/dialogs/new_table.jade" });
buf.push("\n    <input name=\"name\"/>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n  </p>");
jade_debug.shift();
jade_debug.unshift({ lineno: 6, filename: "/Users/pavel/Sites/postbird/views/dialogs/new_table.jade" });
buf.push("\n  <p>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 7, filename: "/Users/pavel/Sites/postbird/views/dialogs/new_table.jade" });
buf.push("\n    <label>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 7, filename: jade_debug[0].filename });
buf.push("Tablespace");
jade_debug.shift();
jade_debug.shift();
buf.push("</label>");
jade_debug.shift();
jade_debug.unshift({ lineno: 8, filename: "/Users/pavel/Sites/postbird/views/dialogs/new_table.jade" });
buf.push("\n    <select name=\"tablespace\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</select>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n  </p>");
jade_debug.shift();
jade_debug.unshift({ lineno: 10, filename: "/Users/pavel/Sites/postbird/views/dialogs/new_table.jade" });
buf.push("\n  <input type=\"submit\" class=\"pseudo-hidden\"/>");
jade_debug.shift();
jade_debug.unshift({ lineno: 12, filename: "/Users/pavel/Sites/postbird/views/dialogs/new_table.jade" });
buf.push("\n  <p class=\"buttons\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 13, filename: "/Users/pavel/Sites/postbird/views/dialogs/new_table.jade" });
buf.push("\n    <button class=\"ok\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 13, filename: jade_debug[0].filename });
buf.push("Create table");
jade_debug.shift();
jade_debug.shift();
buf.push("</button>");
jade_debug.shift();
jade_debug.unshift({ lineno: 14, filename: "/Users/pavel/Sites/postbird/views/dialogs/new_table.jade" });
buf.push("\n    <button class=\"cancel\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 14, filename: jade_debug[0].filename });
buf.push("cancel");
jade_debug.shift();
jade_debug.shift();
buf.push("</button>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n  </p>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n</form>");
jade_debug.shift();
jade_debug.shift();}.call(this,"undefined" in locals_for_with?locals_for_with.undefined:typeof undefined!=="undefined"?undefined:undefined));;return buf.join("");
} catch (err) {
  jade.rethrow(err, jade_debug[0].filename, jade_debug[0].lineno, "form\n  p\n    label Table name\n    input(name=\"name\")\n\n  p\n    label Tablespace\n    select(name=\"tablespace\")\n\n  input.pseudo-hidden(type=\"submit\")\n\n  p.buttons\n    button.ok Create table\n    button.cancel cancel\n");
}
};
exports["dialogs/new_table"].content = "form\n  p\n    label Table name\n    input(name=\"name\")\n\n  p\n    label Tablespace\n    select(name=\"tablespace\")\n\n  input.pseudo-hidden(type=\"submit\")\n\n  p.buttons\n    button.ok Create table\n    button.cancel cancel\n";
exports["dialogs/user_form"] = function template(jade, locals) {
var jade_debug = [{ lineno: 1, filename: "/Users/pavel/Sites/postbird/views/dialogs/user_form.jade" }];
try {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (undefined) {
var jade_indent = [];
jade_debug.unshift({ lineno: 0, filename: "/Users/pavel/Sites/postbird/views/dialogs/user_form.jade" });
jade_debug.unshift({ lineno: 1, filename: "/Users/pavel/Sites/postbird/views/dialogs/user_form.jade" });
buf.push("\n<form>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 2, filename: "/Users/pavel/Sites/postbird/views/dialogs/user_form.jade" });
buf.push("\n  <p>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 3, filename: "/Users/pavel/Sites/postbird/views/dialogs/user_form.jade" });
buf.push("\n    <label>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 3, filename: jade_debug[0].filename });
buf.push("Name");
jade_debug.shift();
jade_debug.shift();
buf.push("</label>");
jade_debug.shift();
jade_debug.unshift({ lineno: 4, filename: "/Users/pavel/Sites/postbird/views/dialogs/user_form.jade" });
buf.push("\n    <input name=\"username\"/>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n  </p>");
jade_debug.shift();
jade_debug.unshift({ lineno: 5, filename: "/Users/pavel/Sites/postbird/views/dialogs/user_form.jade" });
buf.push("\n  <p>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 6, filename: "/Users/pavel/Sites/postbird/views/dialogs/user_form.jade" });
buf.push("\n    <label>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 6, filename: jade_debug[0].filename });
buf.push("Password");
jade_debug.shift();
jade_debug.shift();
buf.push("</label>");
jade_debug.shift();
jade_debug.unshift({ lineno: 7, filename: "/Users/pavel/Sites/postbird/views/dialogs/user_form.jade" });
buf.push("\n    <input name=\"password\"/>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n  </p>");
jade_debug.shift();
jade_debug.unshift({ lineno: 9, filename: "/Users/pavel/Sites/postbird/views/dialogs/user_form.jade" });
buf.push("\n  <!--p-->");
jade_debug.shift();
jade_debug.unshift({ lineno: 10, filename: "/Users/pavel/Sites/postbird/views/dialogs/user_form.jade" });
buf.push("\n  <!--  label Password (again)-->");
jade_debug.shift();
jade_debug.unshift({ lineno: 11, filename: "/Users/pavel/Sites/postbird/views/dialogs/user_form.jade" });
buf.push("\n  <!--  input(name=\"password_again\")-->");
jade_debug.shift();
jade_debug.unshift({ lineno: 11, filename: "/Users/pavel/Sites/postbird/views/dialogs/user_form.jade" });
buf.push("\n  <p>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 12, filename: "/Users/pavel/Sites/postbird/views/dialogs/user_form.jade" });
buf.push("\n    <label>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 13, filename: "/Users/pavel/Sites/postbird/views/dialogs/user_form.jade" });
buf.push("\n      <input type=\"checkbox\" name=\"admin\" value=\"1\"/>");
jade_debug.shift();
jade_debug.unshift({ lineno: 14, filename: "/Users/pavel/Sites/postbird/views/dialogs/user_form.jade" });
buf.push("Admin?");
jade_debug.shift();
jade_debug.shift();
buf.push("\n    </label>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n  </p>");
jade_debug.shift();
jade_debug.unshift({ lineno: 15, filename: "/Users/pavel/Sites/postbird/views/dialogs/user_form.jade" });
buf.push("\n  <input type=\"submit\" class=\"pseudo-hidden\"/>");
jade_debug.shift();
jade_debug.unshift({ lineno: 16, filename: "/Users/pavel/Sites/postbird/views/dialogs/user_form.jade" });
buf.push("\n  <p class=\"buttons\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 17, filename: "/Users/pavel/Sites/postbird/views/dialogs/user_form.jade" });
buf.push("\n    <button class=\"ok\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 17, filename: jade_debug[0].filename });
buf.push("Create user");
jade_debug.shift();
jade_debug.shift();
buf.push("</button>");
jade_debug.shift();
jade_debug.unshift({ lineno: 18, filename: "/Users/pavel/Sites/postbird/views/dialogs/user_form.jade" });
buf.push("\n    <button class=\"cancel\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 18, filename: jade_debug[0].filename });
buf.push("cancel");
jade_debug.shift();
jade_debug.shift();
buf.push("</button>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n  </p>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n</form>");
jade_debug.shift();
jade_debug.shift();}.call(this,"undefined" in locals_for_with?locals_for_with.undefined:typeof undefined!=="undefined"?undefined:undefined));;return buf.join("");
} catch (err) {
  jade.rethrow(err, jade_debug[0].filename, jade_debug[0].lineno, "form\n  p\n    label Name\n    input(name=\"username\")\n  p\n    label Password\n    input(name=\"password\")\n  //p\n  //  label Password (again)\n  //  input(name=\"password_again\")\n  p\n    label\n      input(type=\"checkbox\" name=\"admin\" value=\"1\")\n      = \"Admin?\"\n  input.pseudo-hidden(type=\"submit\")\n  p.buttons\n    button.ok Create user\n    button.cancel cancel\n");
}
};
exports["dialogs/user_form"].content = "form\n  p\n    label Name\n    input(name=\"username\")\n  p\n    label Password\n    input(name=\"password\")\n  //p\n  //  label Password (again)\n  //  input(name=\"password_again\")\n  p\n    label\n      input(type=\"checkbox\" name=\"admin\" value=\"1\")\n      = \"Admin?\"\n  input.pseudo-hidden(type=\"submit\")\n  p.buttons\n    button.ok Create user\n    button.cancel cancel\n";
exports["extensions_tab"] = function template(jade, locals) {
var jade_debug = [{ lineno: 1, filename: "/Users/pavel/Sites/postbird/views/extensions_tab.jade" }];
try {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (undefined, rows) {
var jade_indent = [];
jade_debug.unshift({ lineno: 0, filename: "/Users/pavel/Sites/postbird/views/extensions_tab.jade" });
jade_debug.unshift({ lineno: 1, filename: "/Users/pavel/Sites/postbird/views/extensions_tab.jade" });
buf.push("\n<table class=\"native-view\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 2, filename: "/Users/pavel/Sites/postbird/views/extensions_tab.jade" });
buf.push("\n  <thead>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 3, filename: "/Users/pavel/Sites/postbird/views/extensions_tab.jade" });
buf.push("\n    <tr>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 4, filename: "/Users/pavel/Sites/postbird/views/extensions_tab.jade" });
buf.push("\n      <th>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 4, filename: jade_debug[0].filename });
buf.push("name");
jade_debug.shift();
jade_debug.shift();
buf.push("</th>");
jade_debug.shift();
jade_debug.unshift({ lineno: 5, filename: "/Users/pavel/Sites/postbird/views/extensions_tab.jade" });
buf.push("\n      <th>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 5, filename: jade_debug[0].filename });
buf.push("default version");
jade_debug.shift();
jade_debug.shift();
buf.push("</th>");
jade_debug.shift();
jade_debug.unshift({ lineno: 6, filename: "/Users/pavel/Sites/postbird/views/extensions_tab.jade" });
buf.push("\n      <th>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 6, filename: jade_debug[0].filename });
buf.push("installed_version");
jade_debug.shift();
jade_debug.shift();
buf.push("</th>");
jade_debug.shift();
jade_debug.unshift({ lineno: 7, filename: "/Users/pavel/Sites/postbird/views/extensions_tab.jade" });
buf.push("\n      <th>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</th>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n    </tr>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n  </thead>");
jade_debug.shift();
jade_debug.unshift({ lineno: 8, filename: "/Users/pavel/Sites/postbird/views/extensions_tab.jade" });
buf.push("\n  <tbody>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 9, filename: "/Users/pavel/Sites/postbird/views/extensions_tab.jade" });
// iterate rows
;(function(){
  var $$obj = rows;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var column = $$obj[$index];

jade_debug.unshift({ lineno: 9, filename: "/Users/pavel/Sites/postbird/views/extensions_tab.jade" });
jade_debug.unshift({ lineno: 10, filename: "/Users/pavel/Sites/postbird/views/extensions_tab.jade" });
buf.push("\n    <tr>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 11, filename: "/Users/pavel/Sites/postbird/views/extensions_tab.jade" });
buf.push("\n      <td>" + (jade.escape(null == (jade_interp = column.name) ? "" : jade_interp)));
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</td>");
jade_debug.shift();
jade_debug.unshift({ lineno: 12, filename: "/Users/pavel/Sites/postbird/views/extensions_tab.jade" });
buf.push("\n      <td>" + (jade.escape(null == (jade_interp = column.default_version) ? "" : jade_interp)));
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</td>");
jade_debug.shift();
jade_debug.unshift({ lineno: 13, filename: "/Users/pavel/Sites/postbird/views/extensions_tab.jade" });
buf.push("\n      <td>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 14, filename: "/Users/pavel/Sites/postbird/views/extensions_tab.jade" });
if ( column.installed_version)
{
jade_debug.unshift({ lineno: 15, filename: "/Users/pavel/Sites/postbird/views/extensions_tab.jade" });
jade_debug.unshift({ lineno: 15, filename: "/Users/pavel/Sites/postbird/views/extensions_tab.jade" });
buf.push("<strong>" + (jade.escape(null == (jade_interp = column.installed_version) ? "" : jade_interp)));
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</strong>");
jade_debug.shift();
jade_debug.unshift({ lineno: 16, filename: "/Users/pavel/Sites/postbird/views/extensions_tab.jade" });
buf.push("\n        <button" + (jade.attr("exec", "uninstall('" + column.name + "')", true, false)) + ">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 16, filename: jade_debug[0].filename });
buf.push("Uninstall");
jade_debug.shift();
jade_debug.shift();
buf.push("</button>");
jade_debug.shift();
jade_debug.shift();
}
else
{
jade_debug.unshift({ lineno: 18, filename: "/Users/pavel/Sites/postbird/views/extensions_tab.jade" });
jade_debug.unshift({ lineno: 18, filename: "/Users/pavel/Sites/postbird/views/extensions_tab.jade" });
buf.push("\n        <button" + (jade.attr("exec", "install('" + column.name + "')", true, false)) + ">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 18, filename: jade_debug[0].filename });
buf.push("Install");
jade_debug.shift();
jade_debug.shift();
buf.push("</button>");
jade_debug.shift();
jade_debug.shift();
}
jade_debug.shift();
jade_debug.shift();
buf.push("\n      </td>");
jade_debug.shift();
jade_debug.unshift({ lineno: 19, filename: "/Users/pavel/Sites/postbird/views/extensions_tab.jade" });
buf.push("\n      <td>" + (jade.escape(null == (jade_interp = column.comment) ? "" : jade_interp)));
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</td>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n    </tr>");
jade_debug.shift();
jade_debug.shift();
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var column = $$obj[$index];

jade_debug.unshift({ lineno: 9, filename: "/Users/pavel/Sites/postbird/views/extensions_tab.jade" });
jade_debug.unshift({ lineno: 10, filename: "/Users/pavel/Sites/postbird/views/extensions_tab.jade" });
buf.push("\n    <tr>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 11, filename: "/Users/pavel/Sites/postbird/views/extensions_tab.jade" });
buf.push("\n      <td>" + (jade.escape(null == (jade_interp = column.name) ? "" : jade_interp)));
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</td>");
jade_debug.shift();
jade_debug.unshift({ lineno: 12, filename: "/Users/pavel/Sites/postbird/views/extensions_tab.jade" });
buf.push("\n      <td>" + (jade.escape(null == (jade_interp = column.default_version) ? "" : jade_interp)));
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</td>");
jade_debug.shift();
jade_debug.unshift({ lineno: 13, filename: "/Users/pavel/Sites/postbird/views/extensions_tab.jade" });
buf.push("\n      <td>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 14, filename: "/Users/pavel/Sites/postbird/views/extensions_tab.jade" });
if ( column.installed_version)
{
jade_debug.unshift({ lineno: 15, filename: "/Users/pavel/Sites/postbird/views/extensions_tab.jade" });
jade_debug.unshift({ lineno: 15, filename: "/Users/pavel/Sites/postbird/views/extensions_tab.jade" });
buf.push("<strong>" + (jade.escape(null == (jade_interp = column.installed_version) ? "" : jade_interp)));
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</strong>");
jade_debug.shift();
jade_debug.unshift({ lineno: 16, filename: "/Users/pavel/Sites/postbird/views/extensions_tab.jade" });
buf.push("\n        <button" + (jade.attr("exec", "uninstall('" + column.name + "')", true, false)) + ">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 16, filename: jade_debug[0].filename });
buf.push("Uninstall");
jade_debug.shift();
jade_debug.shift();
buf.push("</button>");
jade_debug.shift();
jade_debug.shift();
}
else
{
jade_debug.unshift({ lineno: 18, filename: "/Users/pavel/Sites/postbird/views/extensions_tab.jade" });
jade_debug.unshift({ lineno: 18, filename: "/Users/pavel/Sites/postbird/views/extensions_tab.jade" });
buf.push("\n        <button" + (jade.attr("exec", "install('" + column.name + "')", true, false)) + ">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 18, filename: jade_debug[0].filename });
buf.push("Install");
jade_debug.shift();
jade_debug.shift();
buf.push("</button>");
jade_debug.shift();
jade_debug.shift();
}
jade_debug.shift();
jade_debug.shift();
buf.push("\n      </td>");
jade_debug.shift();
jade_debug.unshift({ lineno: 19, filename: "/Users/pavel/Sites/postbird/views/extensions_tab.jade" });
buf.push("\n      <td>" + (jade.escape(null == (jade_interp = column.comment) ? "" : jade_interp)));
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</td>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n    </tr>");
jade_debug.shift();
jade_debug.shift();
    }

  }
}).call(this);

jade_debug.shift();
jade_debug.shift();
buf.push("\n  </tbody>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n</table>");
jade_debug.shift();
jade_debug.shift();}.call(this,"undefined" in locals_for_with?locals_for_with.undefined:typeof undefined!=="undefined"?undefined:undefined,"rows" in locals_for_with?locals_for_with.rows:typeof rows!=="undefined"?rows:undefined));;return buf.join("");
} catch (err) {
  jade.rethrow(err, jade_debug[0].filename, jade_debug[0].lineno, "table.native-view\n  thead\n    tr\n      th name\n      th default version\n      th installed_version\n      th\n  tbody\n    each column in rows\n      tr\n        td= column.name\n        td= column.default_version\n        td\n          if column.installed_version\n            strong= column.installed_version\n            button(exec=\"uninstall('\" + column.name + \"')\") Uninstall\n          else\n            button(exec=\"install('\" + column.name + \"')\") Install\n        td= column.comment");
}
};
exports["extensions_tab"].content = "table.native-view\n  thead\n    tr\n      th name\n      th default version\n      th installed_version\n      th\n  tbody\n    each column in rows\n      tr\n        td= column.name\n        td= column.default_version\n        td\n          if column.installed_version\n            strong= column.installed_version\n            button(exec=\"uninstall('\" + column.name + \"')\") Uninstall\n          else\n            button(exec=\"install('\" + column.name + \"')\") Install\n        td= column.comment";
exports["help"] = function template(jade, locals) {
var jade_debug = [{ lineno: 1, filename: "/Users/pavel/Sites/postbird/views/help.jade" }];
try {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (undefined, link_to) {
var jade_indent = [];
jade_debug.unshift({ lineno: 0, filename: "/Users/pavel/Sites/postbird/views/help.jade" });
jade_debug.unshift({ lineno: 1, filename: "/Users/pavel/Sites/postbird/views/help.jade" });
buf.push("\n<div class=\"help-screen\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 2, filename: "/Users/pavel/Sites/postbird/views/help.jade" });
buf.push("\n  <div class=\"sidebar\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 3, filename: "/Users/pavel/Sites/postbird/views/help.jade" });
buf.push("\n    <ul>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 4, filename: "/Users/pavel/Sites/postbird/views/help.jade" });
buf.push("\n      <li>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 5, filename: "/Users/pavel/Sites/postbird/views/help.jade" });
buf.push("<a page=\"about-postbird\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 5, filename: jade_debug[0].filename });
buf.push("About Postbird");
jade_debug.shift();
jade_debug.shift();
buf.push("</a>");
jade_debug.shift();
jade_debug.shift();
buf.push("</li>");
jade_debug.shift();
jade_debug.unshift({ lineno: 6, filename: "/Users/pavel/Sites/postbird/views/help.jade" });
buf.push("\n      <li>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 7, filename: "/Users/pavel/Sites/postbird/views/help.jade" });
buf.push("<a page=\"get-postgres\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 7, filename: jade_debug[0].filename });
buf.push("Get Postgres");
jade_debug.shift();
jade_debug.shift();
buf.push("</a>");
jade_debug.shift();
jade_debug.shift();
buf.push("</li>");
jade_debug.shift();
jade_debug.unshift({ lineno: 8, filename: "/Users/pavel/Sites/postbird/views/help.jade" });
buf.push("\n      <li>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 9, filename: "/Users/pavel/Sites/postbird/views/help.jade" });
buf.push("<a page=\"sql-basics\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 9, filename: jade_debug[0].filename });
buf.push("SQL basics");
jade_debug.shift();
jade_debug.shift();
buf.push("</a>");
jade_debug.shift();
jade_debug.shift();
buf.push("</li>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n    </ul>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n  </div>");
jade_debug.shift();
jade_debug.unshift({ lineno: 11, filename: "/Users/pavel/Sites/postbird/views/help.jade" });
buf.push("\n  <div class=\"content\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 12, filename: "/Users/pavel/Sites/postbird/views/help.jade" });
buf.push("\n    <div class=\"page about-postbird\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 13, filename: "/Users/pavel/Sites/postbird/views/help.jade" });
buf.push("\n      <h2>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 13, filename: jade_debug[0].filename });
buf.push("About Postbird");
jade_debug.shift();
jade_debug.shift();
buf.push("</h2>");
jade_debug.shift();
jade_debug.unshift({ lineno: 15, filename: "/Users/pavel/Sites/postbird/views/help.jade" });
buf.push("\n      <p class=\"logo\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 16, filename: "/Users/pavel/Sites/postbird/views/help.jade" });
buf.push("<img src=\"./assets/icon.png\"/>");
jade_debug.shift();
jade_debug.shift();
buf.push("</p>");
jade_debug.shift();
jade_debug.unshift({ lineno: 17, filename: "/Users/pavel/Sites/postbird/views/help.jade" });
buf.push("\n      <p>");
jade_debug.unshift({ lineno: 17, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 17, filename: jade_debug[0].filename });
buf.push("It's open source client for postgresql, written in JavaScript, run with node-webkit.");
jade_debug.shift();
jade_debug.shift();
buf.push("</p>");
jade_debug.shift();
jade_debug.unshift({ lineno: 18, filename: "/Users/pavel/Sites/postbird/views/help.jade" });
buf.push("\n      <p>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 19, filename: "/Users/pavel/Sites/postbird/views/help.jade" });
buf.push("Source code at ");
jade_debug.shift();
jade_debug.unshift({ lineno: 20, filename: "/Users/pavel/Sites/postbird/views/help.jade" });
buf.push(null == (jade_interp = link_to("github.com/paxa/postbird", "https://github.com/paxa/postbird", {class: "external"})) ? "" : jade_interp);
jade_debug.shift();
jade_debug.shift();
buf.push("\n      </p>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n    </div>");
jade_debug.shift();
jade_debug.unshift({ lineno: 22, filename: "/Users/pavel/Sites/postbird/views/help.jade" });
buf.push("\n    <div class=\"page get-postgres\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 23, filename: "/Users/pavel/Sites/postbird/views/help.jade" });
buf.push("\n      <h2>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 23, filename: jade_debug[0].filename });
buf.push("Get Postgres");
jade_debug.shift();
jade_debug.shift();
buf.push("</h2>");
jade_debug.shift();
jade_debug.unshift({ lineno: 25, filename: "/Users/pavel/Sites/postbird/views/help.jade" });
buf.push("\n      <article>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 26, filename: "/Users/pavel/Sites/postbird/views/help.jade" });
buf.push("\n        <h5>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 26, filename: jade_debug[0].filename });
buf.push("Postgres.app");
jade_debug.shift();
jade_debug.shift();
buf.push("</h5>");
jade_debug.shift();
jade_debug.unshift({ lineno: 27, filename: "/Users/pavel/Sites/postbird/views/help.jade" });
buf.push("\n        <p>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 28, filename: "/Users/pavel/Sites/postbird/views/help.jade" });
buf.push("Postgres.app is a simple, native Mac OS X app that runs in the menubar without the need of an installer.");
jade_debug.shift();
jade_debug.unshift({ lineno: 29, filename: "/Users/pavel/Sites/postbird/views/help.jade" });
buf.push("Open the app, and you have a PostgreSQL server ready and awaiting new connections.");
jade_debug.shift();
jade_debug.unshift({ lineno: 30, filename: "/Users/pavel/Sites/postbird/views/help.jade" });
buf.push("Close the app, and the server shuts down.");
jade_debug.shift();
jade_debug.shift();
buf.push("\n        </p>");
jade_debug.shift();
jade_debug.unshift({ lineno: 31, filename: "/Users/pavel/Sites/postbird/views/help.jade" });
buf.push("<a href=\"http://postgresapp.com/\" class=\"download external\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 31, filename: jade_debug[0].filename });
buf.push("Download");
jade_debug.shift();
jade_debug.shift();
buf.push("</a>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n      </article>");
jade_debug.shift();
jade_debug.unshift({ lineno: 33, filename: "/Users/pavel/Sites/postbird/views/help.jade" });
buf.push("\n      <article>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 34, filename: "/Users/pavel/Sites/postbird/views/help.jade" });
buf.push("\n        <h5>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 34, filename: jade_debug[0].filename });
buf.push("Postgres Graphical installer");
jade_debug.shift();
jade_debug.shift();
buf.push("</h5>");
jade_debug.shift();
jade_debug.unshift({ lineno: 35, filename: "/Users/pavel/Sites/postbird/views/help.jade" });
buf.push("\n        <p>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 36, filename: "/Users/pavel/Sites/postbird/views/help.jade" });
buf.push("An installer is available for Mac OS X that includes PostgreSQL, pgAdmin and");
jade_debug.shift();
jade_debug.unshift({ lineno: 37, filename: "/Users/pavel/Sites/postbird/views/help.jade" });
buf.push("the StackBuilder utility for installation of additional packages.");
jade_debug.shift();
jade_debug.shift();
buf.push("\n        </p>");
jade_debug.shift();
jade_debug.unshift({ lineno: 38, filename: "/Users/pavel/Sites/postbird/views/help.jade" });
buf.push("<a href=\"http://www.enterprisedb.com/products-services-training/pgdownload#osx\" class=\"download external\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 38, filename: jade_debug[0].filename });
buf.push("Download");
jade_debug.shift();
jade_debug.shift();
buf.push("</a>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n      </article>");
jade_debug.shift();
jade_debug.unshift({ lineno: 40, filename: "/Users/pavel/Sites/postbird/views/help.jade" });
buf.push("\n      <article>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 41, filename: "/Users/pavel/Sites/postbird/views/help.jade" });
buf.push("\n        <h5>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 41, filename: jade_debug[0].filename });
buf.push("Using Homebrew or MacPorts or Fink");
jade_debug.shift();
jade_debug.shift();
buf.push("</h5>");
jade_debug.shift();
jade_debug.unshift({ lineno: 43, filename: "/Users/pavel/Sites/postbird/views/help.jade" });
buf.push("\n        <p>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 44, filename: "/Users/pavel/Sites/postbird/views/help.jade" });
buf.push("<strong>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 44, filename: jade_debug[0].filename });
buf.push("For Homebrew:");
jade_debug.shift();
jade_debug.shift();
buf.push("</strong>");
jade_debug.shift();
jade_debug.unshift({ lineno: 45, filename: "/Users/pavel/Sites/postbird/views/help.jade" });
buf.push("<code>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 45, filename: jade_debug[0].filename });
buf.push("brew isntall postgresql");
jade_debug.shift();
jade_debug.shift();
buf.push("</code>");
jade_debug.shift();
jade_debug.shift();
buf.push("</p>");
jade_debug.shift();
jade_debug.unshift({ lineno: 46, filename: "/Users/pavel/Sites/postbird/views/help.jade" });
buf.push("\n        <p>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 47, filename: "/Users/pavel/Sites/postbird/views/help.jade" });
buf.push("<strong>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 47, filename: jade_debug[0].filename });
buf.push("For MacPorts:");
jade_debug.shift();
jade_debug.shift();
buf.push("</strong>");
jade_debug.shift();
jade_debug.unshift({ lineno: 48, filename: "/Users/pavel/Sites/postbird/views/help.jade" });
buf.push("<code>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 49, filename: "/Users/pavel/Sites/postbird/views/help.jade" });
buf.push("sudo port install postgresql93-server\n");
jade_debug.shift();
jade_debug.unshift({ lineno: 50, filename: "/Users/pavel/Sites/postbird/views/help.jade" });
buf.push("sudo port select --set postgresql postgresql93");
jade_debug.shift();
jade_debug.shift();
buf.push("</code>");
jade_debug.shift();
jade_debug.unshift({ lineno: 51, filename: "/Users/pavel/Sites/postbird/views/help.jade" });
buf.push("<a href=\"http://chriskief.com/2013/11/17/mavericks-macports-postgresql-9-tomcat-6-and-postgresql-studio/\" class=\"external\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 51, filename: jade_debug[0].filename });
buf.push("Manual");
jade_debug.shift();
jade_debug.shift();
buf.push("</a>");
jade_debug.shift();
jade_debug.shift();
buf.push("</p>");
jade_debug.shift();
jade_debug.unshift({ lineno: 52, filename: "/Users/pavel/Sites/postbird/views/help.jade" });
buf.push("\n        <p>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 53, filename: "/Users/pavel/Sites/postbird/views/help.jade" });
buf.push("<strong>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 53, filename: jade_debug[0].filename });
buf.push("For Fink:");
jade_debug.shift();
jade_debug.shift();
buf.push("</strong>");
jade_debug.shift();
jade_debug.unshift({ lineno: 54, filename: "/Users/pavel/Sites/postbird/views/help.jade" });
buf.push("<span>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 54, filename: jade_debug[0].filename });
buf.push("&nbsp;");
jade_debug.shift();
jade_debug.shift();
buf.push("</span>");
jade_debug.shift();
jade_debug.unshift({ lineno: 55, filename: "/Users/pavel/Sites/postbird/views/help.jade" });
buf.push("<a href=\"http://pdb.finkproject.org/pdb/browse.php?summary=postgresql\" class=\"external\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 55, filename: jade_debug[0].filename });
buf.push("find it here");
jade_debug.shift();
jade_debug.shift();
buf.push("</a>");
jade_debug.shift();
jade_debug.shift();
buf.push("</p>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n      </article>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n    </div>");
jade_debug.shift();
jade_debug.unshift({ lineno: 57, filename: "/Users/pavel/Sites/postbird/views/help.jade" });
buf.push("\n    <div class=\"page sql-basics\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 58, filename: "/Users/pavel/Sites/postbird/views/help.jade" });
buf.push("\n      <h5>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 58, filename: jade_debug[0].filename });
buf.push("SQL Basics");
jade_debug.shift();
jade_debug.shift();
buf.push("</h5>");
jade_debug.shift();
jade_debug.unshift({ lineno: 60, filename: "/Users/pavel/Sites/postbird/views/help.jade" });
buf.push("<i>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 60, filename: jade_debug[0].filename });
buf.push("not ready");
jade_debug.shift();
jade_debug.shift();
buf.push("</i>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n    </div>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n  </div>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n</div>");
jade_debug.shift();
jade_debug.shift();}.call(this,"undefined" in locals_for_with?locals_for_with.undefined:typeof undefined!=="undefined"?undefined:undefined,"link_to" in locals_for_with?locals_for_with.link_to:typeof link_to!=="undefined"?link_to:undefined));;return buf.join("");
} catch (err) {
  jade.rethrow(err, jade_debug[0].filename, jade_debug[0].lineno, ".help-screen\n  .sidebar\n    ul\n      li\n        a(page=\"about-postbird\") About Postbird\n      li\n        a(page=\"get-postgres\") Get Postgres\n      li\n        a(page=\"sql-basics\") SQL basics\n\n  .content\n    .page.about-postbird\n      h2 About Postbird\n\n      p.logo\n        img(src=\"./assets/icon.png\")\n      p.\n        It's open source client for postgresql, written in JavaScript, run with node-webkit.\n      p\n        = \"Source code at \"\n        != link_to(\"github.com/paxa/postbird\", \"https://github.com/paxa/postbird\", {class: \"external\"})\n\n    .page.get-postgres\n      h2 Get Postgres\n\n      article\n        h5 Postgres.app\n        p\n          = \"Postgres.app is a simple, native Mac OS X app that runs in the menubar without the need of an installer.\"\n          = \"Open the app, and you have a PostgreSQL server ready and awaiting new connections.\"\n          = \"Close the app, and the server shuts down.\"\n        a.download.external(href=\"http://postgresapp.com/\") Download\n\n      article\n        h5 Postgres Graphical installer\n        p\n          = \"An installer is available for Mac OS X that includes PostgreSQL, pgAdmin and\"\n          = \"the StackBuilder utility for installation of additional packages.\"\n        a.download.external(href=\"http://www.enterprisedb.com/products-services-training/pgdownload#osx\") Download\n\n      article\n        h5 Using Homebrew or MacPorts or Fink\n\n        p\n          strong For Homebrew:\n          code brew isntall postgresql\n        p\n          strong For MacPorts:\n          code\n            = \"sudo port install postgresql93-server\\n\"\n            = \"sudo port select --set postgresql postgresql93\"\n          a.external(href=\"http://chriskief.com/2013/11/17/mavericks-macports-postgresql-9-tomcat-6-and-postgresql-studio/\") Manual\n        p\n          strong For Fink:\n          span &nbsp;\n          a.external(href=\"http://pdb.finkproject.org/pdb/browse.php?summary=postgresql\") find it here\n\n    .page.sql-basics\n      h5 SQL Basics\n\n      i not ready");
}
};
exports["help"].content = ".help-screen\n  .sidebar\n    ul\n      li\n        a(page=\"about-postbird\") About Postbird\n      li\n        a(page=\"get-postgres\") Get Postgres\n      li\n        a(page=\"sql-basics\") SQL basics\n\n  .content\n    .page.about-postbird\n      h2 About Postbird\n\n      p.logo\n        img(src=\"./assets/icon.png\")\n      p.\n        It's open source client for postgresql, written in JavaScript, run with node-webkit.\n      p\n        = \"Source code at \"\n        != link_to(\"github.com/paxa/postbird\", \"https://github.com/paxa/postbird\", {class: \"external\"})\n\n    .page.get-postgres\n      h2 Get Postgres\n\n      article\n        h5 Postgres.app\n        p\n          = \"Postgres.app is a simple, native Mac OS X app that runs in the menubar without the need of an installer.\"\n          = \"Open the app, and you have a PostgreSQL server ready and awaiting new connections.\"\n          = \"Close the app, and the server shuts down.\"\n        a.download.external(href=\"http://postgresapp.com/\") Download\n\n      article\n        h5 Postgres Graphical installer\n        p\n          = \"An installer is available for Mac OS X that includes PostgreSQL, pgAdmin and\"\n          = \"the StackBuilder utility for installation of additional packages.\"\n        a.download.external(href=\"http://www.enterprisedb.com/products-services-training/pgdownload#osx\") Download\n\n      article\n        h5 Using Homebrew or MacPorts or Fink\n\n        p\n          strong For Homebrew:\n          code brew isntall postgresql\n        p\n          strong For MacPorts:\n          code\n            = \"sudo port install postgresql93-server\\n\"\n            = \"sudo port select --set postgresql postgresql93\"\n          a.external(href=\"http://chriskief.com/2013/11/17/mavericks-macports-postgresql-9-tomcat-6-and-postgresql-studio/\") Manual\n        p\n          strong For Fink:\n          span &nbsp;\n          a.external(href=\"http://pdb.finkproject.org/pdb/browse.php?summary=postgresql\") find it here\n\n    .page.sql-basics\n      h5 SQL Basics\n\n      i not ready";
exports["home"] = function template(jade, locals) {
var jade_debug = [{ lineno: 1, filename: "/Users/pavel/Sites/postbird/views/home.jade" }];
try {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (undefined, link_to) {
var jade_indent = [];
jade_debug.unshift({ lineno: 0, filename: "/Users/pavel/Sites/postbird/views/home.jade" });
jade_debug.unshift({ lineno: 1, filename: "/Users/pavel/Sites/postbird/views/home.jade" });
buf.push("\n<div class=\"home-screen\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 2, filename: "/Users/pavel/Sites/postbird/views/home.jade" });
buf.push("\n  <div class=\"sidebar\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 3, filename: "/Users/pavel/Sites/postbird/views/home.jade" });
buf.push("\n    <h4>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 3, filename: jade_debug[0].filename });
buf.push("Saved connections");
jade_debug.shift();
jade_debug.shift();
buf.push("</h4>");
jade_debug.shift();
jade_debug.unshift({ lineno: 4, filename: "/Users/pavel/Sites/postbird/views/home.jade" });
buf.push("\n    <ul class=\"connections\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</ul>");
jade_debug.shift();
jade_debug.unshift({ lineno: 5, filename: "/Users/pavel/Sites/postbird/views/home.jade" });
buf.push("<a exec=\"addNewConnection\" class=\"add-connection\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 5, filename: jade_debug[0].filename });
buf.push("Add");
jade_debug.shift();
jade_debug.shift();
buf.push("</a>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n  </div>");
jade_debug.shift();
jade_debug.unshift({ lineno: 7, filename: "/Users/pavel/Sites/postbird/views/home.jade" });
buf.push("\n  <form class=\"middle-window plain\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 8, filename: "/Users/pavel/Sites/postbird/views/home.jade" });
buf.push("\n    <p>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 9, filename: "/Users/pavel/Sites/postbird/views/home.jade" });
buf.push("\n      <label for=\"login_host\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 9, filename: jade_debug[0].filename });
buf.push("Host");
jade_debug.shift();
jade_debug.shift();
buf.push("</label>");
jade_debug.shift();
jade_debug.unshift({ lineno: 10, filename: "/Users/pavel/Sites/postbird/views/home.jade" });
buf.push("\n      <input id=\"login_host\" name=\"host\" type=\"text\" value=\"localhost\"/>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n    </p>");
jade_debug.shift();
jade_debug.unshift({ lineno: 11, filename: "/Users/pavel/Sites/postbird/views/home.jade" });
buf.push("\n    <p>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 12, filename: "/Users/pavel/Sites/postbird/views/home.jade" });
buf.push("\n      <label for=\"login_port\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 12, filename: jade_debug[0].filename });
buf.push("Port");
jade_debug.shift();
jade_debug.shift();
buf.push("</label>");
jade_debug.shift();
jade_debug.unshift({ lineno: 13, filename: "/Users/pavel/Sites/postbird/views/home.jade" });
buf.push("\n      <input id=\"login_port\" name=\"port\" type=\"text\" value=\"5432\"/>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n    </p>");
jade_debug.shift();
jade_debug.unshift({ lineno: 14, filename: "/Users/pavel/Sites/postbird/views/home.jade" });
buf.push("\n    <p>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 15, filename: "/Users/pavel/Sites/postbird/views/home.jade" });
buf.push("\n      <label for=\"login_username\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 15, filename: jade_debug[0].filename });
buf.push("Username");
jade_debug.shift();
jade_debug.shift();
buf.push("</label>");
jade_debug.shift();
jade_debug.unshift({ lineno: 16, filename: "/Users/pavel/Sites/postbird/views/home.jade" });
buf.push("\n      <input id=\"login_username\" name=\"user\" type=\"text\" value=\"pavel\"/>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n    </p>");
jade_debug.shift();
jade_debug.unshift({ lineno: 17, filename: "/Users/pavel/Sites/postbird/views/home.jade" });
buf.push("\n    <p>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 18, filename: "/Users/pavel/Sites/postbird/views/home.jade" });
buf.push("\n      <label for=\"login_password\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 18, filename: jade_debug[0].filename });
buf.push("Password");
jade_debug.shift();
jade_debug.shift();
buf.push("</label>");
jade_debug.shift();
jade_debug.unshift({ lineno: 19, filename: "/Users/pavel/Sites/postbird/views/home.jade" });
buf.push("\n      <input id=\"login_password\" name=\"password\" type=\"password\" value=\"\"/>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n    </p>");
jade_debug.shift();
jade_debug.unshift({ lineno: 21, filename: "/Users/pavel/Sites/postbird/views/home.jade" });
buf.push("\n    <p>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 22, filename: "/Users/pavel/Sites/postbird/views/home.jade" });
buf.push("\n      <label for=\"login_database\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 22, filename: jade_debug[0].filename });
buf.push("Database");
jade_debug.shift();
jade_debug.shift();
buf.push("</label>");
jade_debug.shift();
jade_debug.unshift({ lineno: 23, filename: "/Users/pavel/Sites/postbird/views/home.jade" });
buf.push("\n      <input id=\"login_database\" name=\"database\" type=\"text\" value=\"\"/>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n    </p>");
jade_debug.shift();
jade_debug.unshift({ lineno: 25, filename: "/Users/pavel/Sites/postbird/views/home.jade" });
buf.push("\n    <input name=\"query\" type=\"hidden\"/>");
jade_debug.shift();
jade_debug.unshift({ lineno: 27, filename: "/Users/pavel/Sites/postbird/views/home.jade" });
buf.push("\n    <p class=\"buttons\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 28, filename: "/Users/pavel/Sites/postbird/views/home.jade" });
buf.push("\n      <button exec=\"testConnection\" class=\"native-look\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 28, filename: jade_debug[0].filename });
buf.push("Test connection");
jade_debug.shift();
jade_debug.shift();
buf.push("</button>");
jade_debug.shift();
jade_debug.unshift({ lineno: 29, filename: "/Users/pavel/Sites/postbird/views/home.jade" });
buf.push("\n      <button exec=\"saveAndConnect\" class=\"native-look\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 29, filename: jade_debug[0].filename });
buf.push("Save & connect");
jade_debug.shift();
jade_debug.shift();
buf.push("</button>");
jade_debug.shift();
jade_debug.unshift({ lineno: 30, filename: "/Users/pavel/Sites/postbird/views/home.jade" });
buf.push("\n      <input type=\"submit\" value=\"Connect\" autofocus=\"autofocus\" class=\"native-look\"/>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n    </p>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n  </form>");
jade_debug.shift();
jade_debug.unshift({ lineno: 32, filename: "/Users/pavel/Sites/postbird/views/home.jade" });
buf.push("\n  <div class=\"middle-window heroku-1\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 33, filename: "/Users/pavel/Sites/postbird/views/home.jade" });
buf.push("\n    <h5>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 33, filename: jade_debug[0].filename });
buf.push("Heroku login");
jade_debug.shift();
jade_debug.shift();
buf.push("</h5>");
jade_debug.shift();
jade_debug.unshift({ lineno: 35, filename: "/Users/pavel/Sites/postbird/views/home.jade" });
buf.push("\n    <p>" + (null == (jade_interp = link_to("Access with OAuth", '#', {exec: 'startHerokuOAuth'})) ? "" : jade_interp));
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</p>");
jade_debug.shift();
jade_debug.unshift({ lineno: 36, filename: "/Users/pavel/Sites/postbird/views/home.jade" });
//p!= link_to('Access with "$ heroku" command line tool', '#')
jade_debug.shift();
jade_debug.shift();
buf.push("\n  </div>");
jade_debug.shift();
jade_debug.unshift({ lineno: 38, filename: "/Users/pavel/Sites/postbird/views/home.jade" });
buf.push("\n  <div class=\"middle-window heroku-oauth\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 39, filename: "/Users/pavel/Sites/postbird/views/home.jade" });
buf.push("\n    <ul class=\"steps\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 40, filename: "/Users/pavel/Sites/postbird/views/home.jade" });
buf.push("\n      <li class=\"access-token\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 40, filename: jade_debug[0].filename });
buf.push("Grand access");
jade_debug.shift();
jade_debug.shift();
buf.push("</li>");
jade_debug.shift();
jade_debug.unshift({ lineno: 41, filename: "/Users/pavel/Sites/postbird/views/home.jade" });
buf.push("\n      <li class=\"request-token\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 41, filename: jade_debug[0].filename });
buf.push("Request Token");
jade_debug.shift();
jade_debug.shift();
buf.push("</li>");
jade_debug.shift();
jade_debug.unshift({ lineno: 42, filename: "/Users/pavel/Sites/postbird/views/home.jade" });
buf.push("\n      <li class=\"get-apps\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 42, filename: jade_debug[0].filename });
buf.push("Get applications list");
jade_debug.shift();
jade_debug.shift();
buf.push("</li>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n    </ul>");
jade_debug.shift();
jade_debug.unshift({ lineno: 43, filename: "/Users/pavel/Sites/postbird/views/home.jade" });
buf.push("\n    <ul class=\"apps\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</ul>");
jade_debug.shift();
jade_debug.unshift({ lineno: 44, filename: "/Users/pavel/Sites/postbird/views/home.jade" });
buf.push("\n    <ul class=\"steps\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 45, filename: "/Users/pavel/Sites/postbird/views/home.jade" });
buf.push("\n      <li class=\"database-url\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 45, filename: jade_debug[0].filename });
buf.push("Database URL");
jade_debug.shift();
jade_debug.shift();
buf.push("</li>");
jade_debug.shift();
jade_debug.unshift({ lineno: 46, filename: "/Users/pavel/Sites/postbird/views/home.jade" });
buf.push("\n      <li class=\"connect-db\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 46, filename: jade_debug[0].filename });
buf.push("Connect to DB");
jade_debug.shift();
jade_debug.shift();
buf.push("</li>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n    </ul>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n  </div>");
jade_debug.shift();
jade_debug.unshift({ lineno: 48, filename: "/Users/pavel/Sites/postbird/views/home.jade" });
buf.push("\n  <div class=\"middle-window heroku-cl\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 49, filename: "/Users/pavel/Sites/postbird/views/home.jade" });
buf.push("\n    <ul>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 50, filename: "/Users/pavel/Sites/postbird/views/home.jade" });
buf.push("\n      <li>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 50, filename: jade_debug[0].filename });
buf.push("Detect command line utilite");
jade_debug.shift();
jade_debug.shift();
buf.push("</li>");
jade_debug.shift();
jade_debug.unshift({ lineno: 51, filename: "/Users/pavel/Sites/postbird/views/home.jade" });
buf.push("\n      <li>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 51, filename: jade_debug[0].filename });
buf.push("Get applications list");
jade_debug.shift();
jade_debug.shift();
buf.push("</li>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n    </ul>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n  </div>");
jade_debug.shift();
jade_debug.unshift({ lineno: 53, filename: "/Users/pavel/Sites/postbird/views/home.jade" });
buf.push("\n  <footer>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 54, filename: "/Users/pavel/Sites/postbird/views/home.jade" });
buf.push(null == (jade_interp = link_to("Login with heroku", '#', {exec: 'showHerokuPane1', class: 'login-with-heroku'})) ? "" : jade_interp);
jade_debug.shift();
jade_debug.unshift({ lineno: 55, filename: "/Users/pavel/Sites/postbird/views/home.jade" });
buf.push(null == (jade_interp = link_to("Login with password", '#', {exec: 'showPlainPane', class: 'login-with-password'})) ? "" : jade_interp);
jade_debug.shift();
jade_debug.unshift({ lineno: 56, filename: "/Users/pavel/Sites/postbird/views/home.jade" });
buf.push("<br/>");
jade_debug.shift();
jade_debug.unshift({ lineno: 57, filename: "/Users/pavel/Sites/postbird/views/home.jade" });
buf.push("<a class=\"go-to-help\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 57, filename: jade_debug[0].filename });
buf.push("Get Postgres");
jade_debug.shift();
jade_debug.shift();
buf.push("</a>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n  </footer>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n</div>");
jade_debug.shift();
jade_debug.shift();}.call(this,"undefined" in locals_for_with?locals_for_with.undefined:typeof undefined!=="undefined"?undefined:undefined,"link_to" in locals_for_with?locals_for_with.link_to:typeof link_to!=="undefined"?link_to:undefined));;return buf.join("");
} catch (err) {
  jade.rethrow(err, jade_debug[0].filename, jade_debug[0].lineno, ".home-screen\n  .sidebar\n    h4 Saved connections\n    ul.connections\n    a.add-connection(exec=\"addNewConnection\") Add\n\n  form.middle-window.plain\n    p\n      label(for=\"login_host\") Host\n      input#login_host(name='host', type='text', value='localhost')\n    p\n      label(for=\"login_port\") Port\n      input#login_port(name='port', type='text', value='5432')\n    p\n      label(for=\"login_username\") Username\n      input#login_username(name='user', type='text', value='pavel')\n    p\n      label(for=\"login_password\") Password\n      input#login_password(name='password', type='password', value='')\n\n    p\n      label(for=\"login_database\") Database\n      input#login_database(name='database', type='text', value='')\n\n    input(name=\"query\", type=\"hidden\")\n\n    p.buttons\n      button.native-look(exec=\"testConnection\") Test connection\n      button.native-look(exec=\"saveAndConnect\") Save & connect\n      input.native-look(type=\"submit\", value=\"Connect\", autofocus=true)\n\n  .middle-window.heroku-1\n    h5 Heroku login\n\n    p!= link_to(\"Access with OAuth\", '#', {exec: 'startHerokuOAuth'})\n    - //p!= link_to('Access with \"$ heroku\" command line tool', '#')\n\n  .middle-window.heroku-oauth\n    ul.steps\n      li.access-token Grand access\n      li.request-token Request Token\n      li.get-apps Get applications list\n    ul.apps\n    ul.steps\n      li.database-url Database URL\n      li.connect-db Connect to DB\n\n  .middle-window.heroku-cl\n    ul\n      li Detect command line utilite\n      li Get applications list\n\n  footer\n    != link_to(\"Login with heroku\", '#', {exec: 'showHerokuPane1', class: 'login-with-heroku'})\n    != link_to(\"Login with password\", '#', {exec: 'showPlainPane', class: 'login-with-password'})\n    br\n    a.go-to-help Get Postgres\n");
}
};
exports["home"].content = ".home-screen\n  .sidebar\n    h4 Saved connections\n    ul.connections\n    a.add-connection(exec=\"addNewConnection\") Add\n\n  form.middle-window.plain\n    p\n      label(for=\"login_host\") Host\n      input#login_host(name='host', type='text', value='localhost')\n    p\n      label(for=\"login_port\") Port\n      input#login_port(name='port', type='text', value='5432')\n    p\n      label(for=\"login_username\") Username\n      input#login_username(name='user', type='text', value='pavel')\n    p\n      label(for=\"login_password\") Password\n      input#login_password(name='password', type='password', value='')\n\n    p\n      label(for=\"login_database\") Database\n      input#login_database(name='database', type='text', value='')\n\n    input(name=\"query\", type=\"hidden\")\n\n    p.buttons\n      button.native-look(exec=\"testConnection\") Test connection\n      button.native-look(exec=\"saveAndConnect\") Save & connect\n      input.native-look(type=\"submit\", value=\"Connect\", autofocus=true)\n\n  .middle-window.heroku-1\n    h5 Heroku login\n\n    p!= link_to(\"Access with OAuth\", '#', {exec: 'startHerokuOAuth'})\n    - //p!= link_to('Access with \"$ heroku\" command line tool', '#')\n\n  .middle-window.heroku-oauth\n    ul.steps\n      li.access-token Grand access\n      li.request-token Request Token\n      li.get-apps Get applications list\n    ul.apps\n    ul.steps\n      li.database-url Database URL\n      li.connect-db Connect to DB\n\n  .middle-window.heroku-cl\n    ul\n      li Detect command line utilite\n      li Get applications list\n\n  footer\n    != link_to(\"Login with heroku\", '#', {exec: 'showHerokuPane1', class: 'login-with-heroku'})\n    != link_to(\"Login with password\", '#', {exec: 'showPlainPane', class: 'login-with-password'})\n    br\n    a.go-to-help Get Postgres\n";
exports["main"] = function template(jade, locals) {
var jade_debug = [{ lineno: 1, filename: "/Users/pavel/Sites/postbird/views/main.jade" }];
try {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (undefined, icon) {
var jade_indent = [];
jade_debug.unshift({ lineno: 0, filename: "/Users/pavel/Sites/postbird/views/main.jade" });
jade_debug.unshift({ lineno: 1, filename: "/Users/pavel/Sites/postbird/views/main.jade" });
buf.push("\n<div class=\"main-screen\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 2, filename: "/Users/pavel/Sites/postbird/views/main.jade" });
buf.push("\n  <div class=\"sidebar\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 3, filename: "/Users/pavel/Sites/postbird/views/main.jade" });
buf.push("\n    <div class=\"databases\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 4, filename: "/Users/pavel/Sites/postbird/views/main.jade" });
buf.push("\n      <label>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 4, filename: jade_debug[0].filename });
buf.push("Select database");
jade_debug.shift();
jade_debug.shift();
buf.push("</label>");
jade_debug.shift();
jade_debug.unshift({ lineno: 5, filename: "/Users/pavel/Sites/postbird/views/main.jade" });
buf.push("\n      <select>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 6, filename: "/Users/pavel/Sites/postbird/views/main.jade" });
buf.push("\n        <option>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 6, filename: jade_debug[0].filename });
buf.push("Select database...");
jade_debug.shift();
jade_debug.shift();
buf.push("</option>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n      </select>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n    </div>");
jade_debug.shift();
jade_debug.unshift({ lineno: 7, filename: "/Users/pavel/Sites/postbird/views/main.jade" });
buf.push("\n    <div class=\"tables without-system-tables\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 8, filename: "/Users/pavel/Sites/postbird/views/main.jade" });
buf.push("\n      <ul>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</ul>");
jade_debug.shift();
jade_debug.unshift({ lineno: 9, filename: "/Users/pavel/Sites/postbird/views/main.jade" });
buf.push("\n      <div class=\"show-system-tables\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 10, filename: "/Users/pavel/Sites/postbird/views/main.jade" });
buf.push("\n        <label>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 11, filename: "/Users/pavel/Sites/postbird/views/main.jade" });
buf.push("\n          <input type=\"checkbox\"/>");
jade_debug.shift();
jade_debug.unshift({ lineno: 12, filename: "/Users/pavel/Sites/postbird/views/main.jade" });
buf.push("Show system tables");
jade_debug.shift();
jade_debug.shift();
buf.push("\n        </label>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n      </div>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n    </div>");
jade_debug.shift();
jade_debug.unshift({ lineno: 14, filename: "/Users/pavel/Sites/postbird/views/main.jade" });
buf.push("\n    <ul class=\"extras\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 15, filename: "/Users/pavel/Sites/postbird/views/main.jade" });
buf.push("\n      <li class=\"reload\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 16, filename: "/Users/pavel/Sites/postbird/views/main.jade" });
buf.push("<a class=\"reloadStructure\">" + (null == (jade_interp = icon('reload', 'Reload tables')) ? "" : jade_interp));
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</a>");
jade_debug.shift();
jade_debug.shift();
buf.push("</li>");
jade_debug.shift();
jade_debug.unshift({ lineno: 17, filename: "/Users/pavel/Sites/postbird/views/main.jade" });
buf.push("\n      <li class=\"add-table\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 18, filename: "/Users/pavel/Sites/postbird/views/main.jade" });
buf.push("<a class=\"addTable\">" + (null == (jade_interp = icon('add-table', 'Add table')) ? "" : jade_interp));
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</a>");
jade_debug.shift();
jade_debug.shift();
buf.push("</li>");
jade_debug.shift();
jade_debug.unshift({ lineno: 19, filename: "/Users/pavel/Sites/postbird/views/main.jade" });
buf.push("\n      <li tab=\"users\" class=\"users\">" + (null == (jade_interp = icon('users', 'Users')) ? "" : jade_interp));
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</li>");
jade_debug.shift();
jade_debug.unshift({ lineno: 20, filename: "/Users/pavel/Sites/postbird/views/main.jade" });
buf.push("\n      <li tab=\"extensions\" class=\"extensions\">" + (null == (jade_interp = icon('extensions', "Postgres extensions")) ? "" : jade_interp));
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</li>");
jade_debug.shift();
jade_debug.unshift({ lineno: 22, filename: "/Users/pavel/Sites/postbird/views/main.jade" });
buf.push("\n      <!--li.procedures(tab='procedures')!= icon('procedures', \"Procedures\")-->");
jade_debug.shift();
jade_debug.shift();
buf.push("\n    </ul>");
jade_debug.shift();
jade_debug.unshift({ lineno: 22, filename: "/Users/pavel/Sites/postbird/views/main.jade" });
buf.push("\n    <div class=\"resize-handler\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</div>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n  </div>");
jade_debug.shift();
jade_debug.unshift({ lineno: 23, filename: "/Users/pavel/Sites/postbird/views/main.jade" });
buf.push("\n  <div class=\"main\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 24, filename: "/Users/pavel/Sites/postbird/views/main.jade" });
buf.push("\n    <div class=\"window-tabs\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 25, filename: "/Users/pavel/Sites/postbird/views/main.jade" });
buf.push("\n      <div tab=\"structure\" class=\"tab structure\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 25, filename: jade_debug[0].filename });
buf.push("Structure");
jade_debug.shift();
jade_debug.shift();
buf.push("</div>");
jade_debug.shift();
jade_debug.unshift({ lineno: 26, filename: "/Users/pavel/Sites/postbird/views/main.jade" });
buf.push("\n      <div tab=\"content\" class=\"tab content\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 26, filename: jade_debug[0].filename });
buf.push("Content");
jade_debug.shift();
jade_debug.shift();
buf.push("</div>");
jade_debug.shift();
jade_debug.unshift({ lineno: 27, filename: "/Users/pavel/Sites/postbird/views/main.jade" });
buf.push("\n      <div tab=\"query\" class=\"tab query\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 27, filename: jade_debug[0].filename });
buf.push("Query");
jade_debug.shift();
jade_debug.shift();
buf.push("</div>");
jade_debug.shift();
jade_debug.unshift({ lineno: 29, filename: "/Users/pavel/Sites/postbird/views/main.jade" });
buf.push("\n      <!--.tab.triggers(tab='triggers') Triggers-->");
jade_debug.shift();
jade_debug.unshift({ lineno: 29, filename: "/Users/pavel/Sites/postbird/views/main.jade" });
buf.push("");
jade_debug.shift();
jade_debug.shift();
buf.push("\n    </div>");
jade_debug.shift();
jade_debug.unshift({ lineno: 30, filename: "/Users/pavel/Sites/postbird/views/main.jade" });
buf.push("\n    <div class=\"window-content structure\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</div>");
jade_debug.shift();
jade_debug.unshift({ lineno: 31, filename: "/Users/pavel/Sites/postbird/views/main.jade" });
buf.push("\n    <div class=\"window-content content\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</div>");
jade_debug.shift();
jade_debug.unshift({ lineno: 32, filename: "/Users/pavel/Sites/postbird/views/main.jade" });
buf.push("\n    <div class=\"window-content query\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</div>");
jade_debug.shift();
jade_debug.unshift({ lineno: 33, filename: "/Users/pavel/Sites/postbird/views/main.jade" });
buf.push("\n    <div class=\"window-content triggers\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</div>");
jade_debug.shift();
jade_debug.unshift({ lineno: 34, filename: "/Users/pavel/Sites/postbird/views/main.jade" });
buf.push("\n    <div class=\"window-content users\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</div>");
jade_debug.shift();
jade_debug.unshift({ lineno: 35, filename: "/Users/pavel/Sites/postbird/views/main.jade" });
buf.push("\n    <div class=\"window-content extensions\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</div>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n  </div>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n</div>");
jade_debug.shift();
jade_debug.shift();}.call(this,"undefined" in locals_for_with?locals_for_with.undefined:typeof undefined!=="undefined"?undefined:undefined,"icon" in locals_for_with?locals_for_with.icon:typeof icon!=="undefined"?icon:undefined));;return buf.join("");
} catch (err) {
  jade.rethrow(err, jade_debug[0].filename, jade_debug[0].lineno, ".main-screen\n  .sidebar\n    .databases\n      label Select database\n      select\n        option Select database...\n    .tables.without-system-tables\n      ul\n      .show-system-tables\n        label\n          input(type=\"checkbox\")\n          = \"Show system tables\"\n\n    ul.extras\n      li.reload\n        a.reloadStructure!= icon('reload', 'Reload tables')\n      li.add-table\n        a.addTable!= icon('add-table', 'Add table')\n      li.users(tab='users')!= icon('users', 'Users')\n      li.extensions(tab='extensions')!= icon('extensions', \"Postgres extensions\")\n      //li.procedures(tab='procedures')!= icon('procedures', \"Procedures\")\n    .resize-handler\n  .main\n    .window-tabs\n      .tab.structure(tab='structure') Structure\n      .tab.content(tab='content') Content\n      .tab.query(tab='query') Query\n      //.tab.triggers(tab='triggers') Triggers\n\n    .window-content.structure\n    .window-content.content\n    .window-content.query\n    .window-content.triggers\n    .window-content.users\n    .window-content.extensions");
}
};
exports["main"].content = ".main-screen\n  .sidebar\n    .databases\n      label Select database\n      select\n        option Select database...\n    .tables.without-system-tables\n      ul\n      .show-system-tables\n        label\n          input(type=\"checkbox\")\n          = \"Show system tables\"\n\n    ul.extras\n      li.reload\n        a.reloadStructure!= icon('reload', 'Reload tables')\n      li.add-table\n        a.addTable!= icon('add-table', 'Add table')\n      li.users(tab='users')!= icon('users', 'Users')\n      li.extensions(tab='extensions')!= icon('extensions', \"Postgres extensions\")\n      //li.procedures(tab='procedures')!= icon('procedures', \"Procedures\")\n    .resize-handler\n  .main\n    .window-tabs\n      .tab.structure(tab='structure') Structure\n      .tab.content(tab='content') Content\n      .tab.query(tab='query') Query\n      //.tab.triggers(tab='triggers') Triggers\n\n    .window-content.structure\n    .window-content.content\n    .window-content.query\n    .window-content.triggers\n    .window-content.users\n    .window-content.extensions";
exports["query_tab"] = function template(jade, locals) {
var jade_debug = [{ lineno: 1, filename: "/Users/pavel/Sites/postbird/views/query_tab.jade" }];
try {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (undefined) {
var jade_indent = [];
jade_debug.unshift({ lineno: 0, filename: "/Users/pavel/Sites/postbird/views/query_tab.jade" });
jade_debug.unshift({ lineno: 1, filename: "/Users/pavel/Sites/postbird/views/query_tab.jade" });
buf.push("\n<div class=\"editing\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 2, filename: "/Users/pavel/Sites/postbird/views/query_tab.jade" });
buf.push("\n  <textarea class=\"editor\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</textarea>");
jade_debug.shift();
jade_debug.unshift({ lineno: 3, filename: "/Users/pavel/Sites/postbird/views/query_tab.jade" });
buf.push("\n  <button exec=\"runQuery\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 3, filename: jade_debug[0].filename });
buf.push("Run query");
jade_debug.shift();
jade_debug.shift();
buf.push("</button>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n</div>");
jade_debug.shift();
jade_debug.unshift({ lineno: 4, filename: "/Users/pavel/Sites/postbird/views/query_tab.jade" });
buf.push("\n<div class=\"result\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 5, filename: "/Users/pavel/Sites/postbird/views/query_tab.jade" });
buf.push("\n  <table>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</table>");
jade_debug.shift();
jade_debug.unshift({ lineno: 6, filename: "/Users/pavel/Sites/postbird/views/query_tab.jade" });
buf.push("\n  <div class=\"status\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</div>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n</div>");
jade_debug.shift();
jade_debug.shift();}.call(this,"undefined" in locals_for_with?locals_for_with.undefined:typeof undefined!=="undefined"?undefined:undefined));;return buf.join("");
} catch (err) {
  jade.rethrow(err, jade_debug[0].filename, jade_debug[0].lineno, ".editing\n  textarea.editor\n  button(exec=\"runQuery\") Run query\n.result\n  table\n  .status");
}
};
exports["query_tab"].content = ".editing\n  textarea.editor\n  button(exec=\"runQuery\") Run query\n.result\n  table\n  .status";
exports["structure_tab"] = function template(jade, locals) {
var jade_debug = [{ lineno: 1, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" }];
try {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (undefined, rows, indexes) {
var jade_indent = [];
jade_debug.unshift({ lineno: 0, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
jade_debug.unshift({ lineno: 1, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("\n<table class=\"native-view\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 2, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("\n  <thead>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 3, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("\n    <tr>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 4, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("\n      <th>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 4, filename: jade_debug[0].filename });
buf.push("column");
jade_debug.shift();
jade_debug.shift();
buf.push("</th>");
jade_debug.shift();
jade_debug.unshift({ lineno: 5, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("\n      <th>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 5, filename: jade_debug[0].filename });
buf.push("type");
jade_debug.shift();
jade_debug.shift();
buf.push("</th>");
jade_debug.shift();
jade_debug.unshift({ lineno: 6, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("\n      <th>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 6, filename: jade_debug[0].filename });
buf.push("max length");
jade_debug.shift();
jade_debug.shift();
buf.push("</th>");
jade_debug.shift();
jade_debug.unshift({ lineno: 7, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("\n      <th>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 7, filename: jade_debug[0].filename });
buf.push("default");
jade_debug.shift();
jade_debug.shift();
buf.push("</th>");
jade_debug.shift();
jade_debug.unshift({ lineno: 8, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("\n      <th>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 8, filename: jade_debug[0].filename });
buf.push("primary key");
jade_debug.shift();
jade_debug.shift();
buf.push("</th>");
jade_debug.shift();
jade_debug.unshift({ lineno: 9, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("\n      <th>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 9, filename: jade_debug[0].filename });
buf.push("Null");
jade_debug.shift();
jade_debug.shift();
buf.push("</th>");
jade_debug.shift();
jade_debug.unshift({ lineno: 10, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("\n      <th>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</th>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n    </tr>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n  </thead>");
jade_debug.shift();
jade_debug.unshift({ lineno: 11, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("\n  <tbody>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 12, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
// iterate rows
;(function(){
  var $$obj = rows;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var column = $$obj[$index];

jade_debug.unshift({ lineno: 12, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
jade_debug.unshift({ lineno: 13, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("\n    <tr>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 14, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("\n      <td>" + (jade.escape(null == (jade_interp = column.column_name) ? "" : jade_interp)));
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</td>");
jade_debug.shift();
jade_debug.unshift({ lineno: 15, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("\n      <td>" + (jade.escape(null == (jade_interp = column.udt_name) ? "" : jade_interp)));
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</td>");
jade_debug.shift();
jade_debug.unshift({ lineno: 16, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("\n      <td>" + (jade.escape(null == (jade_interp = column.character_maximum_length) ? "" : jade_interp)));
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</td>");
jade_debug.shift();
jade_debug.unshift({ lineno: 17, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("\n      <td>" + (jade.escape(null == (jade_interp = ('' + column.column_default).match(/^nextval/) ? 'auto increment' : column.column_default) ? "" : jade_interp)));
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</td>");
jade_debug.shift();
jade_debug.unshift({ lineno: 18, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("\n      <td>" + (jade.escape(null == (jade_interp = column.is_primary_key ? 'yes' : '') ? "" : jade_interp)));
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</td>");
jade_debug.shift();
jade_debug.unshift({ lineno: 19, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("\n      <td>" + (jade.escape(null == (jade_interp = column.is_nullable == 'YES' ? 'yes' : 'no') ? "" : jade_interp)));
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</td>");
jade_debug.shift();
jade_debug.unshift({ lineno: 20, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("\n      <td>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 21, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("<a" + (jade.attr("exec", "editColumn('" + column.column_name + "')", true, false)) + ">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 21, filename: jade_debug[0].filename });
buf.push("Edit");
jade_debug.shift();
jade_debug.shift();
buf.push("</a>");
jade_debug.shift();
jade_debug.unshift({ lineno: 22, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("&nbsp;");
jade_debug.shift();
jade_debug.unshift({ lineno: 23, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("<a" + (jade.attr("exec", "deleteColumn('" + column.column_name + "')", true, false)) + ">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 23, filename: jade_debug[0].filename });
buf.push("Delete");
jade_debug.shift();
jade_debug.shift();
buf.push("</a>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n      </td>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n    </tr>");
jade_debug.shift();
jade_debug.shift();
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var column = $$obj[$index];

jade_debug.unshift({ lineno: 12, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
jade_debug.unshift({ lineno: 13, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("\n    <tr>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 14, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("\n      <td>" + (jade.escape(null == (jade_interp = column.column_name) ? "" : jade_interp)));
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</td>");
jade_debug.shift();
jade_debug.unshift({ lineno: 15, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("\n      <td>" + (jade.escape(null == (jade_interp = column.udt_name) ? "" : jade_interp)));
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</td>");
jade_debug.shift();
jade_debug.unshift({ lineno: 16, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("\n      <td>" + (jade.escape(null == (jade_interp = column.character_maximum_length) ? "" : jade_interp)));
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</td>");
jade_debug.shift();
jade_debug.unshift({ lineno: 17, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("\n      <td>" + (jade.escape(null == (jade_interp = ('' + column.column_default).match(/^nextval/) ? 'auto increment' : column.column_default) ? "" : jade_interp)));
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</td>");
jade_debug.shift();
jade_debug.unshift({ lineno: 18, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("\n      <td>" + (jade.escape(null == (jade_interp = column.is_primary_key ? 'yes' : '') ? "" : jade_interp)));
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</td>");
jade_debug.shift();
jade_debug.unshift({ lineno: 19, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("\n      <td>" + (jade.escape(null == (jade_interp = column.is_nullable == 'YES' ? 'yes' : 'no') ? "" : jade_interp)));
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</td>");
jade_debug.shift();
jade_debug.unshift({ lineno: 20, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("\n      <td>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 21, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("<a" + (jade.attr("exec", "editColumn('" + column.column_name + "')", true, false)) + ">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 21, filename: jade_debug[0].filename });
buf.push("Edit");
jade_debug.shift();
jade_debug.shift();
buf.push("</a>");
jade_debug.shift();
jade_debug.unshift({ lineno: 22, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("&nbsp;");
jade_debug.shift();
jade_debug.unshift({ lineno: 23, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("<a" + (jade.attr("exec", "deleteColumn('" + column.column_name + "')", true, false)) + ">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 23, filename: jade_debug[0].filename });
buf.push("Delete");
jade_debug.shift();
jade_debug.shift();
buf.push("</a>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n      </td>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n    </tr>");
jade_debug.shift();
jade_debug.shift();
    }

  }
}).call(this);

jade_debug.shift();
jade_debug.shift();
buf.push("\n  </tbody>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n</table>");
jade_debug.shift();
jade_debug.unshift({ lineno: 25, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("\n<footer>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 26, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("\n  <button exec=\"addColumnForm\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 26, filename: jade_debug[0].filename });
buf.push("Add column");
jade_debug.shift();
jade_debug.shift();
buf.push("</button>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n</footer>");
jade_debug.shift();
jade_debug.unshift({ lineno: 28, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("\n<h4>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 28, filename: jade_debug[0].filename });
buf.push("Indexes");
jade_debug.shift();
jade_debug.shift();
buf.push("</h4>");
jade_debug.shift();
jade_debug.unshift({ lineno: 29, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("\n<table class=\"native-view\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 30, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("\n  <thead>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 31, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("\n    <tr>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 32, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("\n      <th>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 32, filename: jade_debug[0].filename });
buf.push("name");
jade_debug.shift();
jade_debug.shift();
buf.push("</th>");
jade_debug.shift();
jade_debug.unshift({ lineno: 33, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("\n      <th>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 33, filename: jade_debug[0].filename });
buf.push("p. key");
jade_debug.shift();
jade_debug.shift();
buf.push("</th>");
jade_debug.shift();
jade_debug.unshift({ lineno: 34, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("\n      <th>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 34, filename: jade_debug[0].filename });
buf.push("uniq");
jade_debug.shift();
jade_debug.shift();
buf.push("</th>");
jade_debug.shift();
jade_debug.unshift({ lineno: 35, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("\n      <th>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 35, filename: jade_debug[0].filename });
buf.push("columns");
jade_debug.shift();
jade_debug.shift();
buf.push("</th>");
jade_debug.shift();
jade_debug.unshift({ lineno: 36, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("\n      <th>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</th>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n    </tr>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n  </thead>");
jade_debug.shift();
jade_debug.unshift({ lineno: 37, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("\n  <tbody>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 38, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
// iterate indexes
;(function(){
  var $$obj = indexes;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var index = $$obj[$index];

jade_debug.unshift({ lineno: 38, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
jade_debug.unshift({ lineno: 39, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("\n    <tr>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 40, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("\n      <td>" + (jade.escape(null == (jade_interp = index.relname) ? "" : jade_interp)));
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</td>");
jade_debug.shift();
jade_debug.unshift({ lineno: 41, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("\n      <td>" + (jade.escape(null == (jade_interp = index.indisprimary ? 'Yes' : 'No') ? "" : jade_interp)));
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</td>");
jade_debug.shift();
jade_debug.unshift({ lineno: 42, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("\n      <td>" + (jade.escape(null == (jade_interp = index.indisunique ? 'Yes' : 'No') ? "" : jade_interp)));
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</td>");
jade_debug.shift();
jade_debug.unshift({ lineno: 43, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("\n      <td>" + (jade.escape(null == (jade_interp = index.pg_get_indexdef.match(/ON [^\(]+\((.+)\)/)[1]) ? "" : jade_interp)));
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</td>");
jade_debug.shift();
jade_debug.unshift({ lineno: 44, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("\n      <td>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 45, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("<a" + (jade.attr("exec", "editIndex('" + index.relname + "')", true, false)) + ">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 45, filename: jade_debug[0].filename });
buf.push("Edit");
jade_debug.shift();
jade_debug.shift();
buf.push("</a>");
jade_debug.shift();
jade_debug.unshift({ lineno: 46, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("&nbsp;");
jade_debug.shift();
jade_debug.unshift({ lineno: 47, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("<a" + (jade.attr("exec", "deleteIndex('" + index.relname + "')", true, false)) + ">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 47, filename: jade_debug[0].filename });
buf.push("Delete");
jade_debug.shift();
jade_debug.shift();
buf.push("</a>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n      </td>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n    </tr>");
jade_debug.shift();
jade_debug.shift();
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var index = $$obj[$index];

jade_debug.unshift({ lineno: 38, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
jade_debug.unshift({ lineno: 39, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("\n    <tr>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 40, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("\n      <td>" + (jade.escape(null == (jade_interp = index.relname) ? "" : jade_interp)));
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</td>");
jade_debug.shift();
jade_debug.unshift({ lineno: 41, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("\n      <td>" + (jade.escape(null == (jade_interp = index.indisprimary ? 'Yes' : 'No') ? "" : jade_interp)));
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</td>");
jade_debug.shift();
jade_debug.unshift({ lineno: 42, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("\n      <td>" + (jade.escape(null == (jade_interp = index.indisunique ? 'Yes' : 'No') ? "" : jade_interp)));
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</td>");
jade_debug.shift();
jade_debug.unshift({ lineno: 43, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("\n      <td>" + (jade.escape(null == (jade_interp = index.pg_get_indexdef.match(/ON [^\(]+\((.+)\)/)[1]) ? "" : jade_interp)));
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</td>");
jade_debug.shift();
jade_debug.unshift({ lineno: 44, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("\n      <td>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 45, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("<a" + (jade.attr("exec", "editIndex('" + index.relname + "')", true, false)) + ">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 45, filename: jade_debug[0].filename });
buf.push("Edit");
jade_debug.shift();
jade_debug.shift();
buf.push("</a>");
jade_debug.shift();
jade_debug.unshift({ lineno: 46, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("&nbsp;");
jade_debug.shift();
jade_debug.unshift({ lineno: 47, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("<a" + (jade.attr("exec", "deleteIndex('" + index.relname + "')", true, false)) + ">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 47, filename: jade_debug[0].filename });
buf.push("Delete");
jade_debug.shift();
jade_debug.shift();
buf.push("</a>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n      </td>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n    </tr>");
jade_debug.shift();
jade_debug.shift();
    }

  }
}).call(this);

jade_debug.shift();
jade_debug.shift();
buf.push("\n  </tbody>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n</table>");
jade_debug.shift();
jade_debug.unshift({ lineno: 49, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("\n<footer>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 50, filename: "/Users/pavel/Sites/postbird/views/structure_tab.jade" });
buf.push("\n  <button exec=\"addIndexForm\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 50, filename: jade_debug[0].filename });
buf.push("Add index");
jade_debug.shift();
jade_debug.shift();
buf.push("</button>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n</footer>");
jade_debug.shift();
jade_debug.shift();}.call(this,"undefined" in locals_for_with?locals_for_with.undefined:typeof undefined!=="undefined"?undefined:undefined,"rows" in locals_for_with?locals_for_with.rows:typeof rows!=="undefined"?rows:undefined,"indexes" in locals_for_with?locals_for_with.indexes:typeof indexes!=="undefined"?indexes:undefined));;return buf.join("");
} catch (err) {
  jade.rethrow(err, jade_debug[0].filename, jade_debug[0].lineno, "table.native-view\n  thead\n    tr\n      th column\n      th type\n      th max length\n      th default\n      th primary key\n      th Null\n      th\n  tbody\n    each column in rows\n      tr\n        td= column.column_name\n        td= column.udt_name\n        td= column.character_maximum_length\n        td= ('' + column.column_default).match(/^nextval/) ? 'auto increment' : column.column_default\n        td= column.is_primary_key ? 'yes' : ''\n        td= column.is_nullable == 'YES' ? 'yes' : 'no'\n        td\n          a(exec=\"editColumn('\" + column.column_name + \"')\") Edit\n          != \"&nbsp;\"\n          a(exec=\"deleteColumn('\" + column.column_name + \"')\") Delete\n\nfooter\n  button(exec=\"addColumnForm\") Add column\n\nh4 Indexes\ntable.native-view\n  thead\n    tr\n      th name\n      th p. key\n      th uniq\n      th columns\n      th\n  tbody\n    each index in indexes\n      tr\n        td= index.relname\n        td= index.indisprimary ? 'Yes' : 'No'\n        td= index.indisunique ? 'Yes' : 'No'\n        td= index.pg_get_indexdef.match(/ON [^\\(]+\\((.+)\\)/)[1]\n        td\n          a(exec=\"editIndex('\" + index.relname + \"')\") Edit\n          != \"&nbsp;\"\n          a(exec=\"deleteIndex('\" + index.relname + \"')\") Delete\n\nfooter\n  button(exec=\"addIndexForm\") Add index");
}
};
exports["structure_tab"].content = "table.native-view\n  thead\n    tr\n      th column\n      th type\n      th max length\n      th default\n      th primary key\n      th Null\n      th\n  tbody\n    each column in rows\n      tr\n        td= column.column_name\n        td= column.udt_name\n        td= column.character_maximum_length\n        td= ('' + column.column_default).match(/^nextval/) ? 'auto increment' : column.column_default\n        td= column.is_primary_key ? 'yes' : ''\n        td= column.is_nullable == 'YES' ? 'yes' : 'no'\n        td\n          a(exec=\"editColumn('\" + column.column_name + \"')\") Edit\n          != \"&nbsp;\"\n          a(exec=\"deleteColumn('\" + column.column_name + \"')\") Delete\n\nfooter\n  button(exec=\"addColumnForm\") Add column\n\nh4 Indexes\ntable.native-view\n  thead\n    tr\n      th name\n      th p. key\n      th uniq\n      th columns\n      th\n  tbody\n    each index in indexes\n      tr\n        td= index.relname\n        td= index.indisprimary ? 'Yes' : 'No'\n        td= index.indisunique ? 'Yes' : 'No'\n        td= index.pg_get_indexdef.match(/ON [^\\(]+\\((.+)\\)/)[1]\n        td\n          a(exec=\"editIndex('\" + index.relname + \"')\") Edit\n          != \"&nbsp;\"\n          a(exec=\"deleteIndex('\" + index.relname + \"')\") Delete\n\nfooter\n  button(exec=\"addIndexForm\") Add index";
exports["users_tab"] = function template(jade, locals) {
var jade_debug = [{ lineno: 1, filename: "/Users/pavel/Sites/postbird/views/users_tab.jade" }];
try {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (undefined, rows) {
var jade_indent = [];
jade_debug.unshift({ lineno: 0, filename: "/Users/pavel/Sites/postbird/views/users_tab.jade" });
jade_debug.unshift({ lineno: 1, filename: "/Users/pavel/Sites/postbird/views/users_tab.jade" });
buf.push("\n<table class=\"native-view\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 2, filename: "/Users/pavel/Sites/postbird/views/users_tab.jade" });
buf.push("\n  <thead>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 3, filename: "/Users/pavel/Sites/postbird/views/users_tab.jade" });
buf.push("\n    <tr>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 4, filename: "/Users/pavel/Sites/postbird/views/users_tab.jade" });
buf.push("\n      <th>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 4, filename: jade_debug[0].filename });
buf.push("Role name");
jade_debug.shift();
jade_debug.shift();
buf.push("</th>");
jade_debug.shift();
jade_debug.unshift({ lineno: 5, filename: "/Users/pavel/Sites/postbird/views/users_tab.jade" });
buf.push("\n      <th>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 5, filename: jade_debug[0].filename });
buf.push("List of roles");
jade_debug.shift();
jade_debug.shift();
buf.push("</th>");
jade_debug.shift();
jade_debug.unshift({ lineno: 6, filename: "/Users/pavel/Sites/postbird/views/users_tab.jade" });
buf.push("\n      <th>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 6, filename: jade_debug[0].filename });
buf.push("Member of");
jade_debug.shift();
jade_debug.shift();
buf.push("</th>");
jade_debug.shift();
jade_debug.unshift({ lineno: 7, filename: "/Users/pavel/Sites/postbird/views/users_tab.jade" });
buf.push("\n      <th>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</th>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n    </tr>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n  </thead>");
jade_debug.shift();
jade_debug.unshift({ lineno: 8, filename: "/Users/pavel/Sites/postbird/views/users_tab.jade" });
buf.push("\n  <tbody>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 9, filename: "/Users/pavel/Sites/postbird/views/users_tab.jade" });
// iterate rows
;(function(){
  var $$obj = rows;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var user = $$obj[$index];

jade_debug.unshift({ lineno: 9, filename: "/Users/pavel/Sites/postbird/views/users_tab.jade" });
jade_debug.unshift({ lineno: 10, filename: "/Users/pavel/Sites/postbird/views/users_tab.jade" });
buf.push("\n    <tr>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 11, filename: "/Users/pavel/Sites/postbird/views/users_tab.jade" });
buf.push("\n      <td>" + (jade.escape(null == (jade_interp = user.rolname) ? "" : jade_interp)));
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</td>");
jade_debug.shift();
jade_debug.unshift({ lineno: 12, filename: "/Users/pavel/Sites/postbird/views/users_tab.jade" });
buf.push("\n      <td>" + (jade.escape(null == (jade_interp = user.roles.join(', ')) ? "" : jade_interp)));
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</td>");
jade_debug.shift();
jade_debug.unshift({ lineno: 13, filename: "/Users/pavel/Sites/postbird/views/users_tab.jade" });
buf.push("\n      <td>" + (jade.escape(null == (jade_interp = user.memberof) ? "" : jade_interp)));
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</td>");
jade_debug.shift();
jade_debug.unshift({ lineno: 14, filename: "/Users/pavel/Sites/postbird/views/users_tab.jade" });
buf.push("\n      <td>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 15, filename: "/Users/pavel/Sites/postbird/views/users_tab.jade" });
buf.push("<a" + (jade.attr("exec", "editUser('" + user.rolname + "')", true, false)) + ">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 15, filename: jade_debug[0].filename });
buf.push("Edit");
jade_debug.shift();
jade_debug.shift();
buf.push("</a>");
jade_debug.shift();
jade_debug.unshift({ lineno: 16, filename: "/Users/pavel/Sites/postbird/views/users_tab.jade" });
buf.push(" ");
jade_debug.shift();
jade_debug.unshift({ lineno: 17, filename: "/Users/pavel/Sites/postbird/views/users_tab.jade" });
buf.push("<a" + (jade.attr("exec", "deleteUser('" + user.rolname + "')", true, false)) + ">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 17, filename: jade_debug[0].filename });
buf.push("Delete");
jade_debug.shift();
jade_debug.shift();
buf.push("</a>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n      </td>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n    </tr>");
jade_debug.shift();
jade_debug.shift();
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var user = $$obj[$index];

jade_debug.unshift({ lineno: 9, filename: "/Users/pavel/Sites/postbird/views/users_tab.jade" });
jade_debug.unshift({ lineno: 10, filename: "/Users/pavel/Sites/postbird/views/users_tab.jade" });
buf.push("\n    <tr>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 11, filename: "/Users/pavel/Sites/postbird/views/users_tab.jade" });
buf.push("\n      <td>" + (jade.escape(null == (jade_interp = user.rolname) ? "" : jade_interp)));
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</td>");
jade_debug.shift();
jade_debug.unshift({ lineno: 12, filename: "/Users/pavel/Sites/postbird/views/users_tab.jade" });
buf.push("\n      <td>" + (jade.escape(null == (jade_interp = user.roles.join(', ')) ? "" : jade_interp)));
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</td>");
jade_debug.shift();
jade_debug.unshift({ lineno: 13, filename: "/Users/pavel/Sites/postbird/views/users_tab.jade" });
buf.push("\n      <td>" + (jade.escape(null == (jade_interp = user.memberof) ? "" : jade_interp)));
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.shift();
buf.push("</td>");
jade_debug.shift();
jade_debug.unshift({ lineno: 14, filename: "/Users/pavel/Sites/postbird/views/users_tab.jade" });
buf.push("\n      <td>");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 15, filename: "/Users/pavel/Sites/postbird/views/users_tab.jade" });
buf.push("<a" + (jade.attr("exec", "editUser('" + user.rolname + "')", true, false)) + ">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 15, filename: jade_debug[0].filename });
buf.push("Edit");
jade_debug.shift();
jade_debug.shift();
buf.push("</a>");
jade_debug.shift();
jade_debug.unshift({ lineno: 16, filename: "/Users/pavel/Sites/postbird/views/users_tab.jade" });
buf.push(" ");
jade_debug.shift();
jade_debug.unshift({ lineno: 17, filename: "/Users/pavel/Sites/postbird/views/users_tab.jade" });
buf.push("<a" + (jade.attr("exec", "deleteUser('" + user.rolname + "')", true, false)) + ">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 17, filename: jade_debug[0].filename });
buf.push("Delete");
jade_debug.shift();
jade_debug.shift();
buf.push("</a>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n      </td>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n    </tr>");
jade_debug.shift();
jade_debug.shift();
    }

  }
}).call(this);

jade_debug.shift();
jade_debug.shift();
buf.push("\n  </tbody>");
jade_debug.shift();
jade_debug.shift();
buf.push("\n</table>");
jade_debug.shift();
jade_debug.unshift({ lineno: 19, filename: "/Users/pavel/Sites/postbird/views/users_tab.jade" });
buf.push("\n<button exec=\"newUserDialog\" class=\"createUserBtn\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 19, filename: jade_debug[0].filename });
buf.push("Create new user");
jade_debug.shift();
jade_debug.shift();
buf.push("</button>");
jade_debug.shift();
jade_debug.unshift({ lineno: 20, filename: "/Users/pavel/Sites/postbird/views/users_tab.jade" });
buf.push("\n<button exec=\"newRole\" class=\"createRoleBtn\">");
jade_debug.unshift({ lineno: undefined, filename: jade_debug[0].filename });
jade_debug.unshift({ lineno: 20, filename: jade_debug[0].filename });
buf.push("Create new role");
jade_debug.shift();
jade_debug.shift();
buf.push("</button>");
jade_debug.shift();
jade_debug.shift();}.call(this,"undefined" in locals_for_with?locals_for_with.undefined:typeof undefined!=="undefined"?undefined:undefined,"rows" in locals_for_with?locals_for_with.rows:typeof rows!=="undefined"?rows:undefined));;return buf.join("");
} catch (err) {
  jade.rethrow(err, jade_debug[0].filename, jade_debug[0].lineno, "table.native-view\n  thead\n    tr\n      th Role name\n      th List of roles\n      th Member of\n      th\n  tbody\n    each user in rows\n      tr\n        td= user.rolname\n        td= user.roles.join(', ')\n        td= user.memberof\n        td\n          a(exec=\"editUser('\" + user.rolname + \"')\") Edit\n          = \" \"\n          a(exec=\"deleteUser('\" + user.rolname + \"')\") Delete\n\nbutton.createUserBtn(exec=\"newUserDialog\") Create new user\nbutton.createRoleBtn(exec=\"newRole\") Create new role");
}
};
exports["users_tab"].content = "table.native-view\n  thead\n    tr\n      th Role name\n      th List of roles\n      th Member of\n      th\n  tbody\n    each user in rows\n      tr\n        td= user.rolname\n        td= user.roles.join(', ')\n        td= user.memberof\n        td\n          a(exec=\"editUser('\" + user.rolname + \"')\") Edit\n          = \" \"\n          a(exec=\"deleteUser('\" + user.rolname + \"')\") Delete\n\nbutton.createUserBtn(exec=\"newUserDialog\") Create new user\nbutton.createRoleBtn(exec=\"newRole\") Create new role";
