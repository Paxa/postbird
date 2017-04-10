exports["_loader"] = function template(pug, locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {var pug_debug_sources = {"views\u002F_loader.jade":".app-loader\n  span= message\n  small Please wait\n  if cancel\n    a.cancel-btn Cancel"};
;var locals_for_with = (locals || {});(function (cancel, message) {var pug_indent = [];
;pug_debug_line = 1;pug_debug_filename = "views\u002F_loader.jade";
pug_html = pug_html + "\n\u003Cdiv class=\"app-loader\"\u003E";
;pug_debug_line = 2;pug_debug_filename = "views\u002F_loader.jade";
pug_html = pug_html + "\u003Cspan\u003E";
;pug_debug_line = 2;pug_debug_filename = "views\u002F_loader.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = message) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E";
;pug_debug_line = 3;pug_debug_filename = "views\u002F_loader.jade";
pug_html = pug_html + "\u003Csmall\u003E";
;pug_debug_line = 3;pug_debug_filename = "views\u002F_loader.jade";
pug_html = pug_html + "Please wait\u003C\u002Fsmall\u003E";
;pug_debug_line = 4;pug_debug_filename = "views\u002F_loader.jade";
if (cancel) {
;pug_debug_line = 5;pug_debug_filename = "views\u002F_loader.jade";
pug_html = pug_html + "\u003Ca class=\"cancel-btn\"\u003E";
;pug_debug_line = 5;pug_debug_filename = "views\u002F_loader.jade";
pug_html = pug_html + "Cancel\u003C\u002Fa\u003E";
}
pug_html = pug_html + "\n\u003C\u002Fdiv\u003E";}.call(this,"cancel" in locals_for_with?locals_for_with.cancel:typeof cancel!=="undefined"?cancel:undefined,"message" in locals_for_with?locals_for_with.message:typeof message!=="undefined"?message:undefined));} catch (err) {pug.rethrow(err, pug_debug_filename, pug_debug_line, pug_debug_sources[pug_debug_filename]);};return pug_html;};
exports["_loader"].content = ".app-loader\n  span= message\n  small Please wait\n  if cancel\n    a.cancel-btn Cancel";
exports["content_tab"] = function template(pug, locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {var pug_debug_sources = {"views\u002Fcontent_tab.jade":".content-filter(filtered=!!state.filtered)\n  form\n    label Search:\n    select(name=\"filter-field\")\n      each column in data.fields\n        if column.name != 'ctid'\n          option(value = column.name selected = state.filterField == column.name)= column.name\n    select(name=\"filter-matcher\")\n      each matcher, key in matchers\n        option(value = key, selected = state.filterMatcher === key)= matcher.label\n    input(type=\"search\" placeholder=\"Search\" name=\"filter-value\" value=state.filterValue)\n    span.cancel(title=\"Cancel Filter\")\n    button Filter\n\n.rescol-wrapper(full-width=true)\n  .rescol-header-wrapper\n  .rescol-content-wrapper\n    table\n      thead\n        tr\n          each column in data.fields\n            if column.name != 'ctid'\n              - var type = column_type_label(types[column.name])\n              - var typeLabel = shorterTypeName(types[column.name].data_type);\n              - var dir = sorting.column == column.name ? sorting.direction : ''\n              th(class= 'format-' + type, title=typeLabel, sortable=column.name, sortable-dir=dir)= column.name\n      tbody\n        each row in data.rows\n          tr(data-ctid = row.ctid)\n            each column in data.fields\n              if column.name != 'ctid'\n                td!= formatCell(row[column.name], types[column.name].real_format, types[column.name].data_type)\n\n\n.summary-and-pages.native-footer-bar\n  ul\n    \u002F\u002Fli\n    \u002F\u002F  a Remove\n    \u002F\u002Fli\n    \u002F\u002F  a Duplicate\n    li.info\n\n    li.pages.prev\n      a(exec=\"prevPage\") Prev\n    li.pages.next\n      a(exec=\"nextPage\") Next\n    li.reload\n      a(exec=\"reloadData\") Reload\n    if tableType == 'BASE TABLE'\n      li\n        a(exec=\"addRow\") Add New Row\n"};
;var locals_for_with = (locals || {});(function (column_type_label, data, formatCell, matchers, shorterTypeName, sorting, state, tableType, types) {var pug_indent = [];
;pug_debug_line = 1;pug_debug_filename = "views\u002Fcontent_tab.jade";
pug_html = pug_html + "\n\u003Cdiv" + (" class=\"content-filter\""+pug.attr("filtered", !!state.filtered, true, false)) + "\u003E";
;pug_debug_line = 2;pug_debug_filename = "views\u002Fcontent_tab.jade";
pug_html = pug_html + "\n  \u003Cform\u003E";
;pug_debug_line = 3;pug_debug_filename = "views\u002Fcontent_tab.jade";
pug_html = pug_html + "\n    \u003Clabel\u003E";
;pug_debug_line = 3;pug_debug_filename = "views\u002Fcontent_tab.jade";
pug_html = pug_html + "Search:\u003C\u002Flabel\u003E";
;pug_debug_line = 4;pug_debug_filename = "views\u002Fcontent_tab.jade";
pug_html = pug_html + "\n    \u003Cselect name=\"filter-field\"\u003E";
;pug_debug_line = 5;pug_debug_filename = "views\u002Fcontent_tab.jade";
// iterate data.fields
;(function(){
  var $$obj = data.fields;
  if ('number' == typeof $$obj.length) {
      for (var pug_index0 = 0, $$l = $$obj.length; pug_index0 < $$l; pug_index0++) {
        var column = $$obj[pug_index0];
;pug_debug_line = 6;pug_debug_filename = "views\u002Fcontent_tab.jade";
if (column.name != 'ctid') {
;pug_debug_line = 7;pug_debug_filename = "views\u002Fcontent_tab.jade";
pug_html = pug_html + "\n      \u003Coption" + (pug.attr("value", column.name, true, false)+pug.attr("selected", state.filterField == column.name, true, false)) + "\u003E";
;pug_debug_line = 7;pug_debug_filename = "views\u002Fcontent_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = column.name) ? "" : pug_interp)) + "\u003C\u002Foption\u003E";
}
      }
  } else {
    var $$l = 0;
    for (var pug_index0 in $$obj) {
      $$l++;
      var column = $$obj[pug_index0];
;pug_debug_line = 6;pug_debug_filename = "views\u002Fcontent_tab.jade";
if (column.name != 'ctid') {
;pug_debug_line = 7;pug_debug_filename = "views\u002Fcontent_tab.jade";
pug_html = pug_html + "\n      \u003Coption" + (pug.attr("value", column.name, true, false)+pug.attr("selected", state.filterField == column.name, true, false)) + "\u003E";
;pug_debug_line = 7;pug_debug_filename = "views\u002Fcontent_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = column.name) ? "" : pug_interp)) + "\u003C\u002Foption\u003E";
}
    }
  }
}).call(this);

pug_html = pug_html + "\n    \u003C\u002Fselect\u003E";
;pug_debug_line = 8;pug_debug_filename = "views\u002Fcontent_tab.jade";
pug_html = pug_html + "\n    \u003Cselect name=\"filter-matcher\"\u003E";
;pug_debug_line = 9;pug_debug_filename = "views\u002Fcontent_tab.jade";
// iterate matchers
;(function(){
  var $$obj = matchers;
  if ('number' == typeof $$obj.length) {
      for (var key = 0, $$l = $$obj.length; key < $$l; key++) {
        var matcher = $$obj[key];
;pug_debug_line = 10;pug_debug_filename = "views\u002Fcontent_tab.jade";
pug_html = pug_html + "\n      \u003Coption" + (pug.attr("value", key, true, false)+pug.attr("selected", state.filterMatcher === key, true, false)) + "\u003E";
;pug_debug_line = 10;pug_debug_filename = "views\u002Fcontent_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = matcher.label) ? "" : pug_interp)) + "\u003C\u002Foption\u003E";
      }
  } else {
    var $$l = 0;
    for (var key in $$obj) {
      $$l++;
      var matcher = $$obj[key];
;pug_debug_line = 10;pug_debug_filename = "views\u002Fcontent_tab.jade";
pug_html = pug_html + "\n      \u003Coption" + (pug.attr("value", key, true, false)+pug.attr("selected", state.filterMatcher === key, true, false)) + "\u003E";
;pug_debug_line = 10;pug_debug_filename = "views\u002Fcontent_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = matcher.label) ? "" : pug_interp)) + "\u003C\u002Foption\u003E";
    }
  }
}).call(this);

pug_html = pug_html + "\n    \u003C\u002Fselect\u003E";
;pug_debug_line = 11;pug_debug_filename = "views\u002Fcontent_tab.jade";
pug_html = pug_html + "\n    \u003Cinput" + (" type=\"search\" placeholder=\"Search\" name=\"filter-value\""+pug.attr("value", state.filterValue, true, false)) + "\u002F\u003E";
;pug_debug_line = 12;pug_debug_filename = "views\u002Fcontent_tab.jade";
pug_html = pug_html + "\u003Cspan class=\"cancel\" title=\"Cancel Filter\"\u003E\u003C\u002Fspan\u003E";
;pug_debug_line = 13;pug_debug_filename = "views\u002Fcontent_tab.jade";
pug_html = pug_html + "\n    \u003Cbutton\u003E";
;pug_debug_line = 13;pug_debug_filename = "views\u002Fcontent_tab.jade";
pug_html = pug_html + "Filter\u003C\u002Fbutton\u003E\n  \u003C\u002Fform\u003E\n\u003C\u002Fdiv\u003E";
;pug_debug_line = 15;pug_debug_filename = "views\u002Fcontent_tab.jade";
pug_html = pug_html + "\n\u003Cdiv class=\"rescol-wrapper\" full-width=\"full-width\"\u003E";
;pug_debug_line = 16;pug_debug_filename = "views\u002Fcontent_tab.jade";
pug_html = pug_html + "\n  \u003Cdiv class=\"rescol-header-wrapper\"\u003E\u003C\u002Fdiv\u003E";
;pug_debug_line = 17;pug_debug_filename = "views\u002Fcontent_tab.jade";
pug_html = pug_html + "\n  \u003Cdiv class=\"rescol-content-wrapper\"\u003E";
;pug_debug_line = 18;pug_debug_filename = "views\u002Fcontent_tab.jade";
pug_html = pug_html + "\n    \u003Ctable\u003E";
;pug_debug_line = 19;pug_debug_filename = "views\u002Fcontent_tab.jade";
pug_html = pug_html + "\n      \u003Cthead\u003E";
;pug_debug_line = 20;pug_debug_filename = "views\u002Fcontent_tab.jade";
pug_html = pug_html + "\n        \u003Ctr\u003E";
;pug_debug_line = 21;pug_debug_filename = "views\u002Fcontent_tab.jade";
// iterate data.fields
;(function(){
  var $$obj = data.fields;
  if ('number' == typeof $$obj.length) {
      for (var pug_index2 = 0, $$l = $$obj.length; pug_index2 < $$l; pug_index2++) {
        var column = $$obj[pug_index2];
;pug_debug_line = 22;pug_debug_filename = "views\u002Fcontent_tab.jade";
if (column.name != 'ctid') {
;pug_debug_line = 23;pug_debug_filename = "views\u002Fcontent_tab.jade";
var type = column_type_label(types[column.name])
;pug_debug_line = 24;pug_debug_filename = "views\u002Fcontent_tab.jade";
var typeLabel = shorterTypeName(types[column.name].data_type);
;pug_debug_line = 25;pug_debug_filename = "views\u002Fcontent_tab.jade";
var dir = sorting.column == column.name ? sorting.direction : ''
;pug_debug_line = 26;pug_debug_filename = "views\u002Fcontent_tab.jade";
pug_html = pug_html + "\n          \u003Cth" + (pug.attr("class", pug.classes(['format-' + type], [true]), false, false)+pug.attr("title", typeLabel, true, false)+pug.attr("sortable", column.name, true, false)+pug.attr("sortable-dir", dir, true, false)) + "\u003E";
;pug_debug_line = 26;pug_debug_filename = "views\u002Fcontent_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = column.name) ? "" : pug_interp)) + "\u003C\u002Fth\u003E";
}
      }
  } else {
    var $$l = 0;
    for (var pug_index2 in $$obj) {
      $$l++;
      var column = $$obj[pug_index2];
;pug_debug_line = 22;pug_debug_filename = "views\u002Fcontent_tab.jade";
if (column.name != 'ctid') {
;pug_debug_line = 23;pug_debug_filename = "views\u002Fcontent_tab.jade";
var type = column_type_label(types[column.name])
;pug_debug_line = 24;pug_debug_filename = "views\u002Fcontent_tab.jade";
var typeLabel = shorterTypeName(types[column.name].data_type);
;pug_debug_line = 25;pug_debug_filename = "views\u002Fcontent_tab.jade";
var dir = sorting.column == column.name ? sorting.direction : ''
;pug_debug_line = 26;pug_debug_filename = "views\u002Fcontent_tab.jade";
pug_html = pug_html + "\n          \u003Cth" + (pug.attr("class", pug.classes(['format-' + type], [true]), false, false)+pug.attr("title", typeLabel, true, false)+pug.attr("sortable", column.name, true, false)+pug.attr("sortable-dir", dir, true, false)) + "\u003E";
;pug_debug_line = 26;pug_debug_filename = "views\u002Fcontent_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = column.name) ? "" : pug_interp)) + "\u003C\u002Fth\u003E";
}
    }
  }
}).call(this);

pug_html = pug_html + "\n        \u003C\u002Ftr\u003E\n      \u003C\u002Fthead\u003E";
;pug_debug_line = 27;pug_debug_filename = "views\u002Fcontent_tab.jade";
pug_html = pug_html + "\n      \u003Ctbody\u003E";
;pug_debug_line = 28;pug_debug_filename = "views\u002Fcontent_tab.jade";
// iterate data.rows
;(function(){
  var $$obj = data.rows;
  if ('number' == typeof $$obj.length) {
      for (var pug_index3 = 0, $$l = $$obj.length; pug_index3 < $$l; pug_index3++) {
        var row = $$obj[pug_index3];
;pug_debug_line = 29;pug_debug_filename = "views\u002Fcontent_tab.jade";
pug_html = pug_html + "\n        \u003Ctr" + (pug.attr("data-ctid", row.ctid, true, false)) + "\u003E";
;pug_debug_line = 30;pug_debug_filename = "views\u002Fcontent_tab.jade";
// iterate data.fields
;(function(){
  var $$obj = data.fields;
  if ('number' == typeof $$obj.length) {
      for (var pug_index4 = 0, $$l = $$obj.length; pug_index4 < $$l; pug_index4++) {
        var column = $$obj[pug_index4];
;pug_debug_line = 31;pug_debug_filename = "views\u002Fcontent_tab.jade";
if (column.name != 'ctid') {
;pug_debug_line = 32;pug_debug_filename = "views\u002Fcontent_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 32;pug_debug_filename = "views\u002Fcontent_tab.jade";
pug_html = pug_html + (null == (pug_interp = formatCell(row[column.name], types[column.name].real_format, types[column.name].data_type)) ? "" : pug_interp) + "\u003C\u002Ftd\u003E";
}
      }
  } else {
    var $$l = 0;
    for (var pug_index4 in $$obj) {
      $$l++;
      var column = $$obj[pug_index4];
;pug_debug_line = 31;pug_debug_filename = "views\u002Fcontent_tab.jade";
if (column.name != 'ctid') {
;pug_debug_line = 32;pug_debug_filename = "views\u002Fcontent_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 32;pug_debug_filename = "views\u002Fcontent_tab.jade";
pug_html = pug_html + (null == (pug_interp = formatCell(row[column.name], types[column.name].real_format, types[column.name].data_type)) ? "" : pug_interp) + "\u003C\u002Ftd\u003E";
}
    }
  }
}).call(this);

pug_html = pug_html + "\n        \u003C\u002Ftr\u003E";
      }
  } else {
    var $$l = 0;
    for (var pug_index3 in $$obj) {
      $$l++;
      var row = $$obj[pug_index3];
;pug_debug_line = 29;pug_debug_filename = "views\u002Fcontent_tab.jade";
pug_html = pug_html + "\n        \u003Ctr" + (pug.attr("data-ctid", row.ctid, true, false)) + "\u003E";
;pug_debug_line = 30;pug_debug_filename = "views\u002Fcontent_tab.jade";
// iterate data.fields
;(function(){
  var $$obj = data.fields;
  if ('number' == typeof $$obj.length) {
      for (var pug_index5 = 0, $$l = $$obj.length; pug_index5 < $$l; pug_index5++) {
        var column = $$obj[pug_index5];
;pug_debug_line = 31;pug_debug_filename = "views\u002Fcontent_tab.jade";
if (column.name != 'ctid') {
;pug_debug_line = 32;pug_debug_filename = "views\u002Fcontent_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 32;pug_debug_filename = "views\u002Fcontent_tab.jade";
pug_html = pug_html + (null == (pug_interp = formatCell(row[column.name], types[column.name].real_format, types[column.name].data_type)) ? "" : pug_interp) + "\u003C\u002Ftd\u003E";
}
      }
  } else {
    var $$l = 0;
    for (var pug_index5 in $$obj) {
      $$l++;
      var column = $$obj[pug_index5];
;pug_debug_line = 31;pug_debug_filename = "views\u002Fcontent_tab.jade";
if (column.name != 'ctid') {
;pug_debug_line = 32;pug_debug_filename = "views\u002Fcontent_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 32;pug_debug_filename = "views\u002Fcontent_tab.jade";
pug_html = pug_html + (null == (pug_interp = formatCell(row[column.name], types[column.name].real_format, types[column.name].data_type)) ? "" : pug_interp) + "\u003C\u002Ftd\u003E";
}
    }
  }
}).call(this);

pug_html = pug_html + "\n        \u003C\u002Ftr\u003E";
    }
  }
}).call(this);

pug_html = pug_html + "\n      \u003C\u002Ftbody\u003E\n    \u003C\u002Ftable\u003E\n  \u003C\u002Fdiv\u003E\n\u003C\u002Fdiv\u003E";
;pug_debug_line = 35;pug_debug_filename = "views\u002Fcontent_tab.jade";
pug_html = pug_html + "\n\u003Cdiv class=\"summary-and-pages native-footer-bar\"\u003E";
;pug_debug_line = 36;pug_debug_filename = "views\u002Fcontent_tab.jade";
pug_html = pug_html + "\n  \u003Cul\u003E";
;pug_debug_line = 37;pug_debug_filename = "views\u002Fcontent_tab.jade";
pug_html = pug_html + "\n    \u003C!--li--\u003E";
;pug_debug_line = 38;pug_debug_filename = "views\u002Fcontent_tab.jade";
pug_html = pug_html + "\n    \u003C!--  a Remove--\u003E";
;pug_debug_line = 39;pug_debug_filename = "views\u002Fcontent_tab.jade";
pug_html = pug_html + "\n    \u003C!--li--\u003E";
;pug_debug_line = 40;pug_debug_filename = "views\u002Fcontent_tab.jade";
pug_html = pug_html + "\n    \u003C!--  a Duplicate--\u003E";
;pug_debug_line = 41;pug_debug_filename = "views\u002Fcontent_tab.jade";
pug_html = pug_html + "\n    \u003Cli class=\"info\"\u003E\u003C\u002Fli\u003E";
;pug_debug_line = 43;pug_debug_filename = "views\u002Fcontent_tab.jade";
pug_html = pug_html + "\n    \u003Cli class=\"pages prev\"\u003E";
;pug_debug_line = 44;pug_debug_filename = "views\u002Fcontent_tab.jade";
pug_html = pug_html + "\u003Ca exec=\"prevPage\"\u003E";
;pug_debug_line = 44;pug_debug_filename = "views\u002Fcontent_tab.jade";
pug_html = pug_html + "Prev\u003C\u002Fa\u003E\u003C\u002Fli\u003E";
;pug_debug_line = 45;pug_debug_filename = "views\u002Fcontent_tab.jade";
pug_html = pug_html + "\n    \u003Cli class=\"pages next\"\u003E";
;pug_debug_line = 46;pug_debug_filename = "views\u002Fcontent_tab.jade";
pug_html = pug_html + "\u003Ca exec=\"nextPage\"\u003E";
;pug_debug_line = 46;pug_debug_filename = "views\u002Fcontent_tab.jade";
pug_html = pug_html + "Next\u003C\u002Fa\u003E\u003C\u002Fli\u003E";
;pug_debug_line = 47;pug_debug_filename = "views\u002Fcontent_tab.jade";
pug_html = pug_html + "\n    \u003Cli class=\"reload\"\u003E";
;pug_debug_line = 48;pug_debug_filename = "views\u002Fcontent_tab.jade";
pug_html = pug_html + "\u003Ca exec=\"reloadData\"\u003E";
;pug_debug_line = 48;pug_debug_filename = "views\u002Fcontent_tab.jade";
pug_html = pug_html + "Reload\u003C\u002Fa\u003E\u003C\u002Fli\u003E";
;pug_debug_line = 49;pug_debug_filename = "views\u002Fcontent_tab.jade";
if (tableType == 'BASE TABLE') {
;pug_debug_line = 50;pug_debug_filename = "views\u002Fcontent_tab.jade";
pug_html = pug_html + "\n    \u003Cli\u003E";
;pug_debug_line = 51;pug_debug_filename = "views\u002Fcontent_tab.jade";
pug_html = pug_html + "\u003Ca exec=\"addRow\"\u003E";
;pug_debug_line = 51;pug_debug_filename = "views\u002Fcontent_tab.jade";
pug_html = pug_html + "Add New Row\u003C\u002Fa\u003E\u003C\u002Fli\u003E";
}
pug_html = pug_html + "\n  \u003C\u002Ful\u003E\n\u003C\u002Fdiv\u003E";}.call(this,"column_type_label" in locals_for_with?locals_for_with.column_type_label:typeof column_type_label!=="undefined"?column_type_label:undefined,"data" in locals_for_with?locals_for_with.data:typeof data!=="undefined"?data:undefined,"formatCell" in locals_for_with?locals_for_with.formatCell:typeof formatCell!=="undefined"?formatCell:undefined,"matchers" in locals_for_with?locals_for_with.matchers:typeof matchers!=="undefined"?matchers:undefined,"shorterTypeName" in locals_for_with?locals_for_with.shorterTypeName:typeof shorterTypeName!=="undefined"?shorterTypeName:undefined,"sorting" in locals_for_with?locals_for_with.sorting:typeof sorting!=="undefined"?sorting:undefined,"state" in locals_for_with?locals_for_with.state:typeof state!=="undefined"?state:undefined,"tableType" in locals_for_with?locals_for_with.tableType:typeof tableType!=="undefined"?tableType:undefined,"types" in locals_for_with?locals_for_with.types:typeof types!=="undefined"?types:undefined));} catch (err) {pug.rethrow(err, pug_debug_filename, pug_debug_line, pug_debug_sources[pug_debug_filename]);};return pug_html;};
exports["content_tab"].content = ".content-filter(filtered=!!state.filtered)\n  form\n    label Search:\n    select(name=\"filter-field\")\n      each column in data.fields\n        if column.name != 'ctid'\n          option(value = column.name selected = state.filterField == column.name)= column.name\n    select(name=\"filter-matcher\")\n      each matcher, key in matchers\n        option(value = key, selected = state.filterMatcher === key)= matcher.label\n    input(type=\"search\" placeholder=\"Search\" name=\"filter-value\" value=state.filterValue)\n    span.cancel(title=\"Cancel Filter\")\n    button Filter\n\n.rescol-wrapper(full-width=true)\n  .rescol-header-wrapper\n  .rescol-content-wrapper\n    table\n      thead\n        tr\n          each column in data.fields\n            if column.name != 'ctid'\n              - var type = column_type_label(types[column.name])\n              - var typeLabel = shorterTypeName(types[column.name].data_type);\n              - var dir = sorting.column == column.name ? sorting.direction : ''\n              th(class= 'format-' + type, title=typeLabel, sortable=column.name, sortable-dir=dir)= column.name\n      tbody\n        each row in data.rows\n          tr(data-ctid = row.ctid)\n            each column in data.fields\n              if column.name != 'ctid'\n                td!= formatCell(row[column.name], types[column.name].real_format, types[column.name].data_type)\n\n\n.summary-and-pages.native-footer-bar\n  ul\n    //li\n    //  a Remove\n    //li\n    //  a Duplicate\n    li.info\n\n    li.pages.prev\n      a(exec=\"prevPage\") Prev\n    li.pages.next\n      a(exec=\"nextPage\") Next\n    li.reload\n      a(exec=\"reloadData\") Reload\n    if tableType == 'BASE TABLE'\n      li\n        a(exec=\"addRow\") Add New Row\n";
exports["db_rows_table"] = function template(pug, locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {var pug_debug_sources = {"views\u002Fdb_rows_table.jade":".rescol-wrapper.with-borders\n  .rescol-header-wrapper\n  .rescol-content-wrapper\n    if data.fields\n      table\n        thead\n          tr\n            each column in data.fields\n              - var type = column_type_label(column)\n              th(class= 'format-' + type, title= type)= column.name\n        tbody\n          each row in data.rows\n            tr\n              each column in data.fields\n                td!= formatCell(row[column.name], column.udt_name, column.data_type)\n    else\n      table\n        tbody\n          tr\n            td= data.command\n            td OK\n"};
;var locals_for_with = (locals || {});(function (column_type_label, data, formatCell) {var pug_indent = [];
;pug_debug_line = 1;pug_debug_filename = "views\u002Fdb_rows_table.jade";
pug_html = pug_html + "\n\u003Cdiv class=\"rescol-wrapper with-borders\"\u003E";
;pug_debug_line = 2;pug_debug_filename = "views\u002Fdb_rows_table.jade";
pug_html = pug_html + "\n  \u003Cdiv class=\"rescol-header-wrapper\"\u003E\u003C\u002Fdiv\u003E";
;pug_debug_line = 3;pug_debug_filename = "views\u002Fdb_rows_table.jade";
pug_html = pug_html + "\n  \u003Cdiv class=\"rescol-content-wrapper\"\u003E";
;pug_debug_line = 4;pug_debug_filename = "views\u002Fdb_rows_table.jade";
if (data.fields) {
;pug_debug_line = 5;pug_debug_filename = "views\u002Fdb_rows_table.jade";
pug_html = pug_html + "\n    \u003Ctable\u003E";
;pug_debug_line = 6;pug_debug_filename = "views\u002Fdb_rows_table.jade";
pug_html = pug_html + "\n      \u003Cthead\u003E";
;pug_debug_line = 7;pug_debug_filename = "views\u002Fdb_rows_table.jade";
pug_html = pug_html + "\n        \u003Ctr\u003E";
;pug_debug_line = 8;pug_debug_filename = "views\u002Fdb_rows_table.jade";
// iterate data.fields
;(function(){
  var $$obj = data.fields;
  if ('number' == typeof $$obj.length) {
      for (var pug_index0 = 0, $$l = $$obj.length; pug_index0 < $$l; pug_index0++) {
        var column = $$obj[pug_index0];
;pug_debug_line = 9;pug_debug_filename = "views\u002Fdb_rows_table.jade";
var type = column_type_label(column)
;pug_debug_line = 10;pug_debug_filename = "views\u002Fdb_rows_table.jade";
pug_html = pug_html + "\n          \u003Cth" + (pug.attr("class", pug.classes(['format-' + type], [true]), false, false)+pug.attr("title", type, true, false)) + "\u003E";
;pug_debug_line = 10;pug_debug_filename = "views\u002Fdb_rows_table.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = column.name) ? "" : pug_interp)) + "\u003C\u002Fth\u003E";
      }
  } else {
    var $$l = 0;
    for (var pug_index0 in $$obj) {
      $$l++;
      var column = $$obj[pug_index0];
;pug_debug_line = 9;pug_debug_filename = "views\u002Fdb_rows_table.jade";
var type = column_type_label(column)
;pug_debug_line = 10;pug_debug_filename = "views\u002Fdb_rows_table.jade";
pug_html = pug_html + "\n          \u003Cth" + (pug.attr("class", pug.classes(['format-' + type], [true]), false, false)+pug.attr("title", type, true, false)) + "\u003E";
;pug_debug_line = 10;pug_debug_filename = "views\u002Fdb_rows_table.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = column.name) ? "" : pug_interp)) + "\u003C\u002Fth\u003E";
    }
  }
}).call(this);

pug_html = pug_html + "\n        \u003C\u002Ftr\u003E\n      \u003C\u002Fthead\u003E";
;pug_debug_line = 11;pug_debug_filename = "views\u002Fdb_rows_table.jade";
pug_html = pug_html + "\n      \u003Ctbody\u003E";
;pug_debug_line = 12;pug_debug_filename = "views\u002Fdb_rows_table.jade";
// iterate data.rows
;(function(){
  var $$obj = data.rows;
  if ('number' == typeof $$obj.length) {
      for (var pug_index1 = 0, $$l = $$obj.length; pug_index1 < $$l; pug_index1++) {
        var row = $$obj[pug_index1];
;pug_debug_line = 13;pug_debug_filename = "views\u002Fdb_rows_table.jade";
pug_html = pug_html + "\n        \u003Ctr\u003E";
;pug_debug_line = 14;pug_debug_filename = "views\u002Fdb_rows_table.jade";
// iterate data.fields
;(function(){
  var $$obj = data.fields;
  if ('number' == typeof $$obj.length) {
      for (var pug_index2 = 0, $$l = $$obj.length; pug_index2 < $$l; pug_index2++) {
        var column = $$obj[pug_index2];
;pug_debug_line = 15;pug_debug_filename = "views\u002Fdb_rows_table.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 15;pug_debug_filename = "views\u002Fdb_rows_table.jade";
pug_html = pug_html + (null == (pug_interp = formatCell(row[column.name], column.udt_name, column.data_type)) ? "" : pug_interp) + "\u003C\u002Ftd\u003E";
      }
  } else {
    var $$l = 0;
    for (var pug_index2 in $$obj) {
      $$l++;
      var column = $$obj[pug_index2];
;pug_debug_line = 15;pug_debug_filename = "views\u002Fdb_rows_table.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 15;pug_debug_filename = "views\u002Fdb_rows_table.jade";
pug_html = pug_html + (null == (pug_interp = formatCell(row[column.name], column.udt_name, column.data_type)) ? "" : pug_interp) + "\u003C\u002Ftd\u003E";
    }
  }
}).call(this);

pug_html = pug_html + "\n        \u003C\u002Ftr\u003E";
      }
  } else {
    var $$l = 0;
    for (var pug_index1 in $$obj) {
      $$l++;
      var row = $$obj[pug_index1];
;pug_debug_line = 13;pug_debug_filename = "views\u002Fdb_rows_table.jade";
pug_html = pug_html + "\n        \u003Ctr\u003E";
;pug_debug_line = 14;pug_debug_filename = "views\u002Fdb_rows_table.jade";
// iterate data.fields
;(function(){
  var $$obj = data.fields;
  if ('number' == typeof $$obj.length) {
      for (var pug_index3 = 0, $$l = $$obj.length; pug_index3 < $$l; pug_index3++) {
        var column = $$obj[pug_index3];
;pug_debug_line = 15;pug_debug_filename = "views\u002Fdb_rows_table.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 15;pug_debug_filename = "views\u002Fdb_rows_table.jade";
pug_html = pug_html + (null == (pug_interp = formatCell(row[column.name], column.udt_name, column.data_type)) ? "" : pug_interp) + "\u003C\u002Ftd\u003E";
      }
  } else {
    var $$l = 0;
    for (var pug_index3 in $$obj) {
      $$l++;
      var column = $$obj[pug_index3];
;pug_debug_line = 15;pug_debug_filename = "views\u002Fdb_rows_table.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 15;pug_debug_filename = "views\u002Fdb_rows_table.jade";
pug_html = pug_html + (null == (pug_interp = formatCell(row[column.name], column.udt_name, column.data_type)) ? "" : pug_interp) + "\u003C\u002Ftd\u003E";
    }
  }
}).call(this);

pug_html = pug_html + "\n        \u003C\u002Ftr\u003E";
    }
  }
}).call(this);

pug_html = pug_html + "\n      \u003C\u002Ftbody\u003E\n    \u003C\u002Ftable\u003E";
}
else {
;pug_debug_line = 17;pug_debug_filename = "views\u002Fdb_rows_table.jade";
pug_html = pug_html + "\n    \u003Ctable\u003E";
;pug_debug_line = 18;pug_debug_filename = "views\u002Fdb_rows_table.jade";
pug_html = pug_html + "\n      \u003Ctbody\u003E";
;pug_debug_line = 19;pug_debug_filename = "views\u002Fdb_rows_table.jade";
pug_html = pug_html + "\n        \u003Ctr\u003E";
;pug_debug_line = 20;pug_debug_filename = "views\u002Fdb_rows_table.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 20;pug_debug_filename = "views\u002Fdb_rows_table.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = data.command) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 21;pug_debug_filename = "views\u002Fdb_rows_table.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 21;pug_debug_filename = "views\u002Fdb_rows_table.jade";
pug_html = pug_html + "OK\u003C\u002Ftd\u003E\n        \u003C\u002Ftr\u003E\n      \u003C\u002Ftbody\u003E\n    \u003C\u002Ftable\u003E";
}
pug_html = pug_html + "\n  \u003C\u002Fdiv\u003E\n\u003C\u002Fdiv\u003E";}.call(this,"column_type_label" in locals_for_with?locals_for_with.column_type_label:typeof column_type_label!=="undefined"?column_type_label:undefined,"data" in locals_for_with?locals_for_with.data:typeof data!=="undefined"?data:undefined,"formatCell" in locals_for_with?locals_for_with.formatCell:typeof formatCell!=="undefined"?formatCell:undefined));} catch (err) {pug.rethrow(err, pug_debug_filename, pug_debug_line, pug_debug_sources[pug_debug_filename]);};return pug_html;};
exports["db_rows_table"].content = ".rescol-wrapper.with-borders\n  .rescol-header-wrapper\n  .rescol-content-wrapper\n    if data.fields\n      table\n        thead\n          tr\n            each column in data.fields\n              - var type = column_type_label(column)\n              th(class= 'format-' + type, title= type)= column.name\n        tbody\n          each row in data.rows\n            tr\n              each column in data.fields\n                td!= formatCell(row[column.name], column.udt_name, column.data_type)\n    else\n      table\n        tbody\n          tr\n            td= data.command\n            td OK\n";
exports["dialogs/column_form"] = function template(pug, locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {var pug_debug_sources = {"views\u002Fdialogs\u002Fcolumn_form.jade":"- data = data || {}\n\nform\n  p\n    label Name\n    input(name=\"name\", value = data.column_name)\n\n  p\n    label Type\n    select(name=\"type\")\n      option\n      each types, group in groupedTypes\n        optgroup(label = group)\n          each type in types\n            if type\n              option(value = type.name, title = type.description, selected = (data.data_type == type.name))= type.name\n  p\n    = \"See \"\n    a(href=\"http:\u002F\u002Fwww.postgresql.org\u002Fdocs\u002F9.6\u002Fstatic\u002Fdatatype.html\", target=\"_blank\") documentation for datatypes\n\n    p\n    label Default value\n    input(name=\"default_value\", value = data.column_default)\n\n  p\n    label Max length\n    input(name=\"max_length\", value = data.character_maximum_length)\n\n  p\n    label\n      input(type=\"hidden\", name=\"allow_null\" value=\"0\")\n      input(type=\"checkbox\" name=\"allow_null\" value=\"1\", checked = (data.is_nullable == 'YES'))\n      = \"Allow null\"\n\n  input.pseudo-hidden(type=\"submit\")\n  p.buttons\n    if action == \"edit\"\n        button.ok Update column\n    else\n        button.ok Add column\n    button.cancel cancel\n"};
;var locals_for_with = (locals || {});(function (action, data, groupedTypes) {var pug_indent = [];
;pug_debug_line = 1;pug_debug_filename = "views\u002Fdialogs\u002Fcolumn_form.jade";
data = data || {}
;pug_debug_line = 3;pug_debug_filename = "views\u002Fdialogs\u002Fcolumn_form.jade";
pug_html = pug_html + "\n\u003Cform\u003E";
;pug_debug_line = 4;pug_debug_filename = "views\u002Fdialogs\u002Fcolumn_form.jade";
pug_html = pug_html + "\n  \u003Cp\u003E";
;pug_debug_line = 5;pug_debug_filename = "views\u002Fdialogs\u002Fcolumn_form.jade";
pug_html = pug_html + "\n    \u003Clabel\u003E";
;pug_debug_line = 5;pug_debug_filename = "views\u002Fdialogs\u002Fcolumn_form.jade";
pug_html = pug_html + "Name\u003C\u002Flabel\u003E";
;pug_debug_line = 6;pug_debug_filename = "views\u002Fdialogs\u002Fcolumn_form.jade";
pug_html = pug_html + "\n    \u003Cinput" + (" name=\"name\""+pug.attr("value", data.column_name, true, false)) + "\u002F\u003E\n  \u003C\u002Fp\u003E";
;pug_debug_line = 8;pug_debug_filename = "views\u002Fdialogs\u002Fcolumn_form.jade";
pug_html = pug_html + "\n  \u003Cp\u003E";
;pug_debug_line = 9;pug_debug_filename = "views\u002Fdialogs\u002Fcolumn_form.jade";
pug_html = pug_html + "\n    \u003Clabel\u003E";
;pug_debug_line = 9;pug_debug_filename = "views\u002Fdialogs\u002Fcolumn_form.jade";
pug_html = pug_html + "Type\u003C\u002Flabel\u003E";
;pug_debug_line = 10;pug_debug_filename = "views\u002Fdialogs\u002Fcolumn_form.jade";
pug_html = pug_html + "\n    \u003Cselect name=\"type\"\u003E";
;pug_debug_line = 11;pug_debug_filename = "views\u002Fdialogs\u002Fcolumn_form.jade";
pug_html = pug_html + "\n      \u003Coption\u003E\u003C\u002Foption\u003E";
;pug_debug_line = 12;pug_debug_filename = "views\u002Fdialogs\u002Fcolumn_form.jade";
// iterate groupedTypes
;(function(){
  var $$obj = groupedTypes;
  if ('number' == typeof $$obj.length) {
      for (var group = 0, $$l = $$obj.length; group < $$l; group++) {
        var types = $$obj[group];
;pug_debug_line = 13;pug_debug_filename = "views\u002Fdialogs\u002Fcolumn_form.jade";
pug_html = pug_html + "\n      \u003Coptgroup" + (pug.attr("label", group, true, false)) + "\u003E";
;pug_debug_line = 14;pug_debug_filename = "views\u002Fdialogs\u002Fcolumn_form.jade";
// iterate types
;(function(){
  var $$obj = types;
  if ('number' == typeof $$obj.length) {
      for (var pug_index1 = 0, $$l = $$obj.length; pug_index1 < $$l; pug_index1++) {
        var type = $$obj[pug_index1];
;pug_debug_line = 15;pug_debug_filename = "views\u002Fdialogs\u002Fcolumn_form.jade";
if (type) {
;pug_debug_line = 16;pug_debug_filename = "views\u002Fdialogs\u002Fcolumn_form.jade";
pug_html = pug_html + "\n        \u003Coption" + (pug.attr("value", type.name, true, false)+pug.attr("title", type.description, true, false)+pug.attr("selected", (data.data_type == type.name), true, false)) + "\u003E";
;pug_debug_line = 16;pug_debug_filename = "views\u002Fdialogs\u002Fcolumn_form.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = type.name) ? "" : pug_interp)) + "\u003C\u002Foption\u003E";
}
      }
  } else {
    var $$l = 0;
    for (var pug_index1 in $$obj) {
      $$l++;
      var type = $$obj[pug_index1];
;pug_debug_line = 15;pug_debug_filename = "views\u002Fdialogs\u002Fcolumn_form.jade";
if (type) {
;pug_debug_line = 16;pug_debug_filename = "views\u002Fdialogs\u002Fcolumn_form.jade";
pug_html = pug_html + "\n        \u003Coption" + (pug.attr("value", type.name, true, false)+pug.attr("title", type.description, true, false)+pug.attr("selected", (data.data_type == type.name), true, false)) + "\u003E";
;pug_debug_line = 16;pug_debug_filename = "views\u002Fdialogs\u002Fcolumn_form.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = type.name) ? "" : pug_interp)) + "\u003C\u002Foption\u003E";
}
    }
  }
}).call(this);

pug_html = pug_html + "\n      \u003C\u002Foptgroup\u003E";
      }
  } else {
    var $$l = 0;
    for (var group in $$obj) {
      $$l++;
      var types = $$obj[group];
;pug_debug_line = 13;pug_debug_filename = "views\u002Fdialogs\u002Fcolumn_form.jade";
pug_html = pug_html + "\n      \u003Coptgroup" + (pug.attr("label", group, true, false)) + "\u003E";
;pug_debug_line = 14;pug_debug_filename = "views\u002Fdialogs\u002Fcolumn_form.jade";
// iterate types
;(function(){
  var $$obj = types;
  if ('number' == typeof $$obj.length) {
      for (var pug_index2 = 0, $$l = $$obj.length; pug_index2 < $$l; pug_index2++) {
        var type = $$obj[pug_index2];
;pug_debug_line = 15;pug_debug_filename = "views\u002Fdialogs\u002Fcolumn_form.jade";
if (type) {
;pug_debug_line = 16;pug_debug_filename = "views\u002Fdialogs\u002Fcolumn_form.jade";
pug_html = pug_html + "\n        \u003Coption" + (pug.attr("value", type.name, true, false)+pug.attr("title", type.description, true, false)+pug.attr("selected", (data.data_type == type.name), true, false)) + "\u003E";
;pug_debug_line = 16;pug_debug_filename = "views\u002Fdialogs\u002Fcolumn_form.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = type.name) ? "" : pug_interp)) + "\u003C\u002Foption\u003E";
}
      }
  } else {
    var $$l = 0;
    for (var pug_index2 in $$obj) {
      $$l++;
      var type = $$obj[pug_index2];
;pug_debug_line = 15;pug_debug_filename = "views\u002Fdialogs\u002Fcolumn_form.jade";
if (type) {
;pug_debug_line = 16;pug_debug_filename = "views\u002Fdialogs\u002Fcolumn_form.jade";
pug_html = pug_html + "\n        \u003Coption" + (pug.attr("value", type.name, true, false)+pug.attr("title", type.description, true, false)+pug.attr("selected", (data.data_type == type.name), true, false)) + "\u003E";
;pug_debug_line = 16;pug_debug_filename = "views\u002Fdialogs\u002Fcolumn_form.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = type.name) ? "" : pug_interp)) + "\u003C\u002Foption\u003E";
}
    }
  }
}).call(this);

pug_html = pug_html + "\n      \u003C\u002Foptgroup\u003E";
    }
  }
}).call(this);

pug_html = pug_html + "\n    \u003C\u002Fselect\u003E\n  \u003C\u002Fp\u003E";
;pug_debug_line = 17;pug_debug_filename = "views\u002Fdialogs\u002Fcolumn_form.jade";
pug_html = pug_html + "\n  \u003Cp\u003E";
;pug_debug_line = 18;pug_debug_filename = "views\u002Fdialogs\u002Fcolumn_form.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = "See ") ? "" : pug_interp));
;pug_debug_line = 19;pug_debug_filename = "views\u002Fdialogs\u002Fcolumn_form.jade";
pug_html = pug_html + "\u003Ca href=\"http:\u002F\u002Fwww.postgresql.org\u002Fdocs\u002F9.6\u002Fstatic\u002Fdatatype.html\" target=\"_blank\"\u003E";
;pug_debug_line = 19;pug_debug_filename = "views\u002Fdialogs\u002Fcolumn_form.jade";
pug_html = pug_html + "documentation for datatypes\u003C\u002Fa\u003E";
;pug_debug_line = 21;pug_debug_filename = "views\u002Fdialogs\u002Fcolumn_form.jade";
pug_html = pug_html + "\n    \u003Cp\u003E\u003C\u002Fp\u003E";
;pug_debug_line = 22;pug_debug_filename = "views\u002Fdialogs\u002Fcolumn_form.jade";
pug_html = pug_html + "\n    \u003Clabel\u003E";
;pug_debug_line = 22;pug_debug_filename = "views\u002Fdialogs\u002Fcolumn_form.jade";
pug_html = pug_html + "Default value\u003C\u002Flabel\u003E";
;pug_debug_line = 23;pug_debug_filename = "views\u002Fdialogs\u002Fcolumn_form.jade";
pug_html = pug_html + "\n    \u003Cinput" + (" name=\"default_value\""+pug.attr("value", data.column_default, true, false)) + "\u002F\u003E\n  \u003C\u002Fp\u003E";
;pug_debug_line = 25;pug_debug_filename = "views\u002Fdialogs\u002Fcolumn_form.jade";
pug_html = pug_html + "\n  \u003Cp\u003E";
;pug_debug_line = 26;pug_debug_filename = "views\u002Fdialogs\u002Fcolumn_form.jade";
pug_html = pug_html + "\n    \u003Clabel\u003E";
;pug_debug_line = 26;pug_debug_filename = "views\u002Fdialogs\u002Fcolumn_form.jade";
pug_html = pug_html + "Max length\u003C\u002Flabel\u003E";
;pug_debug_line = 27;pug_debug_filename = "views\u002Fdialogs\u002Fcolumn_form.jade";
pug_html = pug_html + "\n    \u003Cinput" + (" name=\"max_length\""+pug.attr("value", data.character_maximum_length, true, false)) + "\u002F\u003E\n  \u003C\u002Fp\u003E";
;pug_debug_line = 29;pug_debug_filename = "views\u002Fdialogs\u002Fcolumn_form.jade";
pug_html = pug_html + "\n  \u003Cp\u003E";
;pug_debug_line = 30;pug_debug_filename = "views\u002Fdialogs\u002Fcolumn_form.jade";
pug_html = pug_html + "\n    \u003Clabel\u003E";
;pug_debug_line = 31;pug_debug_filename = "views\u002Fdialogs\u002Fcolumn_form.jade";
pug_html = pug_html + "\n      \u003Cinput type=\"hidden\" name=\"allow_null\" value=\"0\"\u002F\u003E";
;pug_debug_line = 32;pug_debug_filename = "views\u002Fdialogs\u002Fcolumn_form.jade";
pug_html = pug_html + "\n      \u003Cinput" + (" type=\"checkbox\" name=\"allow_null\" value=\"1\""+pug.attr("checked", (data.is_nullable == 'YES'), true, false)) + "\u002F\u003E";
;pug_debug_line = 33;pug_debug_filename = "views\u002Fdialogs\u002Fcolumn_form.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = "Allow null") ? "" : pug_interp)) + "\n    \u003C\u002Flabel\u003E\n  \u003C\u002Fp\u003E";
;pug_debug_line = 35;pug_debug_filename = "views\u002Fdialogs\u002Fcolumn_form.jade";
pug_html = pug_html + "\n  \u003Cinput class=\"pseudo-hidden\" type=\"submit\"\u002F\u003E";
;pug_debug_line = 36;pug_debug_filename = "views\u002Fdialogs\u002Fcolumn_form.jade";
pug_html = pug_html + "\n  \u003Cp class=\"buttons\"\u003E";
;pug_debug_line = 37;pug_debug_filename = "views\u002Fdialogs\u002Fcolumn_form.jade";
if (action == "edit") {
;pug_debug_line = 38;pug_debug_filename = "views\u002Fdialogs\u002Fcolumn_form.jade";
pug_html = pug_html + "\n    \u003Cbutton class=\"ok\"\u003E";
;pug_debug_line = 38;pug_debug_filename = "views\u002Fdialogs\u002Fcolumn_form.jade";
pug_html = pug_html + "Update column\u003C\u002Fbutton\u003E";
}
else {
;pug_debug_line = 40;pug_debug_filename = "views\u002Fdialogs\u002Fcolumn_form.jade";
pug_html = pug_html + "\n    \u003Cbutton class=\"ok\"\u003E";
;pug_debug_line = 40;pug_debug_filename = "views\u002Fdialogs\u002Fcolumn_form.jade";
pug_html = pug_html + "Add column\u003C\u002Fbutton\u003E";
}
;pug_debug_line = 41;pug_debug_filename = "views\u002Fdialogs\u002Fcolumn_form.jade";
pug_html = pug_html + "\n    \u003Cbutton class=\"cancel\"\u003E";
;pug_debug_line = 41;pug_debug_filename = "views\u002Fdialogs\u002Fcolumn_form.jade";
pug_html = pug_html + "cancel\u003C\u002Fbutton\u003E\n  \u003C\u002Fp\u003E\n\u003C\u002Fform\u003E";}.call(this,"action" in locals_for_with?locals_for_with.action:typeof action!=="undefined"?action:undefined,"data" in locals_for_with?locals_for_with.data:typeof data!=="undefined"?data:undefined,"groupedTypes" in locals_for_with?locals_for_with.groupedTypes:typeof groupedTypes!=="undefined"?groupedTypes:undefined));} catch (err) {pug.rethrow(err, pug_debug_filename, pug_debug_line, pug_debug_sources[pug_debug_filename]);};return pug_html;};
exports["dialogs/column_form"].content = "- data = data || {}\n\nform\n  p\n    label Name\n    input(name=\"name\", value = data.column_name)\n\n  p\n    label Type\n    select(name=\"type\")\n      option\n      each types, group in groupedTypes\n        optgroup(label = group)\n          each type in types\n            if type\n              option(value = type.name, title = type.description, selected = (data.data_type == type.name))= type.name\n  p\n    = \"See \"\n    a(href=\"http://www.postgresql.org/docs/9.6/static/datatype.html\", target=\"_blank\") documentation for datatypes\n\n    p\n    label Default value\n    input(name=\"default_value\", value = data.column_default)\n\n  p\n    label Max length\n    input(name=\"max_length\", value = data.character_maximum_length)\n\n  p\n    label\n      input(type=\"hidden\", name=\"allow_null\" value=\"0\")\n      input(type=\"checkbox\" name=\"allow_null\" value=\"1\", checked = (data.is_nullable == 'YES'))\n      = \"Allow null\"\n\n  input.pseudo-hidden(type=\"submit\")\n  p.buttons\n    if action == \"edit\"\n        button.ok Update column\n    else\n        button.ok Add column\n    button.cancel cancel\n";
exports["dialogs/def_procedure"] = function template(pug, locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {var pug_debug_sources = {"views\u002Fdialogs\u002Fdef_procedure.jade":"code.general.sql= source\n\np.buttons.close-btn\n  button.cancel Close"};
;var locals_for_with = (locals || {});(function (source) {var pug_indent = [];
;pug_debug_line = 1;pug_debug_filename = "views\u002Fdialogs\u002Fdef_procedure.jade";
pug_html = pug_html + "\u003Ccode class=\"general sql\"\u003E";
;pug_debug_line = 1;pug_debug_filename = "views\u002Fdialogs\u002Fdef_procedure.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = source) ? "" : pug_interp)) + "\u003C\u002Fcode\u003E";
;pug_debug_line = 3;pug_debug_filename = "views\u002Fdialogs\u002Fdef_procedure.jade";
pug_html = pug_html + "\n\u003Cp class=\"buttons close-btn\"\u003E";
;pug_debug_line = 4;pug_debug_filename = "views\u002Fdialogs\u002Fdef_procedure.jade";
pug_html = pug_html + "\n  \u003Cbutton class=\"cancel\"\u003E";
;pug_debug_line = 4;pug_debug_filename = "views\u002Fdialogs\u002Fdef_procedure.jade";
pug_html = pug_html + "Close\u003C\u002Fbutton\u003E\n\u003C\u002Fp\u003E";}.call(this,"source" in locals_for_with?locals_for_with.source:typeof source!=="undefined"?source:undefined));} catch (err) {pug.rethrow(err, pug_debug_filename, pug_debug_line, pug_debug_sources[pug_debug_filename]);};return pug_html;};
exports["dialogs/def_procedure"].content = "code.general.sql= source\n\np.buttons.close-btn\n  button.cancel Close";
exports["dialogs/edit_procedure"] = function template(pug, locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {var pug_debug_sources = {"views\u002Fdialogs\u002Fedit_procedure.jade":"textarea.editor= proc.source\n\np.buttons.close-btn\n  button.cancel Close"};
;var locals_for_with = (locals || {});(function (proc) {var pug_indent = [];
;pug_debug_line = 1;pug_debug_filename = "views\u002Fdialogs\u002Fedit_procedure.jade";
pug_html = pug_html + "\n\u003Ctextarea class=\"editor\"\u003E";
;pug_debug_line = 1;pug_debug_filename = "views\u002Fdialogs\u002Fedit_procedure.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = proc.source) ? "" : pug_interp)) + "\u003C\u002Ftextarea\u003E";
;pug_debug_line = 3;pug_debug_filename = "views\u002Fdialogs\u002Fedit_procedure.jade";
pug_html = pug_html + "\n\u003Cp class=\"buttons close-btn\"\u003E";
;pug_debug_line = 4;pug_debug_filename = "views\u002Fdialogs\u002Fedit_procedure.jade";
pug_html = pug_html + "\n  \u003Cbutton class=\"cancel\"\u003E";
;pug_debug_line = 4;pug_debug_filename = "views\u002Fdialogs\u002Fedit_procedure.jade";
pug_html = pug_html + "Close\u003C\u002Fbutton\u003E\n\u003C\u002Fp\u003E";}.call(this,"proc" in locals_for_with?locals_for_with.proc:typeof proc!=="undefined"?proc:undefined));} catch (err) {pug.rethrow(err, pug_debug_filename, pug_debug_line, pug_debug_sources[pug_debug_filename]);};return pug_html;};
exports["dialogs/edit_procedure"].content = "textarea.editor= proc.source\n\np.buttons.close-btn\n  button.cancel Close";
exports["dialogs/export_file"] = function template(pug, locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {var pug_debug_sources = {"views\u002Fdialogs\u002Fexport_file.jade":"header\n  = \"Exporting database '\"\n  b= database\n  = \"'\"\n\nform\n  p.save-to-file\n    = \"Save to file:\"\n    input(type=\"text\" name=\"export_to_file\" readonly placeholder=\"click to select file...\")\n  p\n    label\n      = \"Export structure\"\n      input(type=\"checkbox\" name=\"export_structure\" checked)\n  p\n    label\n      = \"Export data\"\n      input(type=\"checkbox\" name=\"export_data\" checked)\n\n  p\n    label\n      = \"Objects ownership\"\n      input(type=\"checkbox\" name=\"objects_ownership\")\n\n  code.result\n\n  p.buttons\n    button.ok Start\n    button.cancel Cancel\n  p.buttons.close-btn.is-hidden\n    button.cancel Close"};
;var locals_for_with = (locals || {});(function (database) {var pug_indent = [];
;pug_debug_line = 1;pug_debug_filename = "views\u002Fdialogs\u002Fexport_file.jade";
pug_html = pug_html + "\n\u003Cheader\u003E";
;pug_debug_line = 2;pug_debug_filename = "views\u002Fdialogs\u002Fexport_file.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = "Exporting database '") ? "" : pug_interp));
;pug_debug_line = 3;pug_debug_filename = "views\u002Fdialogs\u002Fexport_file.jade";
pug_html = pug_html + "\u003Cb\u003E";
;pug_debug_line = 3;pug_debug_filename = "views\u002Fdialogs\u002Fexport_file.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = database) ? "" : pug_interp)) + "\u003C\u002Fb\u003E";
;pug_debug_line = 4;pug_debug_filename = "views\u002Fdialogs\u002Fexport_file.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = "'") ? "" : pug_interp)) + "\n\u003C\u002Fheader\u003E";
;pug_debug_line = 6;pug_debug_filename = "views\u002Fdialogs\u002Fexport_file.jade";
pug_html = pug_html + "\n\u003Cform\u003E";
;pug_debug_line = 7;pug_debug_filename = "views\u002Fdialogs\u002Fexport_file.jade";
pug_html = pug_html + "\n  \u003Cp class=\"save-to-file\"\u003E";
;pug_debug_line = 8;pug_debug_filename = "views\u002Fdialogs\u002Fexport_file.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = "Save to file:") ? "" : pug_interp));
;pug_debug_line = 9;pug_debug_filename = "views\u002Fdialogs\u002Fexport_file.jade";
pug_html = pug_html + "\n    \u003Cinput type=\"text\" name=\"export_to_file\" readonly=\"readonly\" placeholder=\"click to select file...\"\u002F\u003E\n  \u003C\u002Fp\u003E";
;pug_debug_line = 10;pug_debug_filename = "views\u002Fdialogs\u002Fexport_file.jade";
pug_html = pug_html + "\n  \u003Cp\u003E";
;pug_debug_line = 11;pug_debug_filename = "views\u002Fdialogs\u002Fexport_file.jade";
pug_html = pug_html + "\n    \u003Clabel\u003E";
;pug_debug_line = 12;pug_debug_filename = "views\u002Fdialogs\u002Fexport_file.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = "Export structure") ? "" : pug_interp));
;pug_debug_line = 13;pug_debug_filename = "views\u002Fdialogs\u002Fexport_file.jade";
pug_html = pug_html + "\n      \u003Cinput type=\"checkbox\" name=\"export_structure\" checked=\"checked\"\u002F\u003E\n    \u003C\u002Flabel\u003E\n  \u003C\u002Fp\u003E";
;pug_debug_line = 14;pug_debug_filename = "views\u002Fdialogs\u002Fexport_file.jade";
pug_html = pug_html + "\n  \u003Cp\u003E";
;pug_debug_line = 15;pug_debug_filename = "views\u002Fdialogs\u002Fexport_file.jade";
pug_html = pug_html + "\n    \u003Clabel\u003E";
;pug_debug_line = 16;pug_debug_filename = "views\u002Fdialogs\u002Fexport_file.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = "Export data") ? "" : pug_interp));
;pug_debug_line = 17;pug_debug_filename = "views\u002Fdialogs\u002Fexport_file.jade";
pug_html = pug_html + "\n      \u003Cinput type=\"checkbox\" name=\"export_data\" checked=\"checked\"\u002F\u003E\n    \u003C\u002Flabel\u003E\n  \u003C\u002Fp\u003E";
;pug_debug_line = 19;pug_debug_filename = "views\u002Fdialogs\u002Fexport_file.jade";
pug_html = pug_html + "\n  \u003Cp\u003E";
;pug_debug_line = 20;pug_debug_filename = "views\u002Fdialogs\u002Fexport_file.jade";
pug_html = pug_html + "\n    \u003Clabel\u003E";
;pug_debug_line = 21;pug_debug_filename = "views\u002Fdialogs\u002Fexport_file.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = "Objects ownership") ? "" : pug_interp));
;pug_debug_line = 22;pug_debug_filename = "views\u002Fdialogs\u002Fexport_file.jade";
pug_html = pug_html + "\n      \u003Cinput type=\"checkbox\" name=\"objects_ownership\"\u002F\u003E\n    \u003C\u002Flabel\u003E\n  \u003C\u002Fp\u003E";
;pug_debug_line = 24;pug_debug_filename = "views\u002Fdialogs\u002Fexport_file.jade";
pug_html = pug_html + "\u003Ccode class=\"result\"\u003E\u003C\u002Fcode\u003E";
;pug_debug_line = 26;pug_debug_filename = "views\u002Fdialogs\u002Fexport_file.jade";
pug_html = pug_html + "\n  \u003Cp class=\"buttons\"\u003E";
;pug_debug_line = 27;pug_debug_filename = "views\u002Fdialogs\u002Fexport_file.jade";
pug_html = pug_html + "\n    \u003Cbutton class=\"ok\"\u003E";
;pug_debug_line = 27;pug_debug_filename = "views\u002Fdialogs\u002Fexport_file.jade";
pug_html = pug_html + "Start\u003C\u002Fbutton\u003E";
;pug_debug_line = 28;pug_debug_filename = "views\u002Fdialogs\u002Fexport_file.jade";
pug_html = pug_html + "\n    \u003Cbutton class=\"cancel\"\u003E";
;pug_debug_line = 28;pug_debug_filename = "views\u002Fdialogs\u002Fexport_file.jade";
pug_html = pug_html + "Cancel\u003C\u002Fbutton\u003E\n  \u003C\u002Fp\u003E";
;pug_debug_line = 29;pug_debug_filename = "views\u002Fdialogs\u002Fexport_file.jade";
pug_html = pug_html + "\n  \u003Cp class=\"buttons close-btn is-hidden\"\u003E";
;pug_debug_line = 30;pug_debug_filename = "views\u002Fdialogs\u002Fexport_file.jade";
pug_html = pug_html + "\n    \u003Cbutton class=\"cancel\"\u003E";
;pug_debug_line = 30;pug_debug_filename = "views\u002Fdialogs\u002Fexport_file.jade";
pug_html = pug_html + "Close\u003C\u002Fbutton\u003E\n  \u003C\u002Fp\u003E\n\u003C\u002Fform\u003E";}.call(this,"database" in locals_for_with?locals_for_with.database:typeof database!=="undefined"?database:undefined));} catch (err) {pug.rethrow(err, pug_debug_filename, pug_debug_line, pug_debug_sources[pug_debug_filename]);};return pug_html;};
exports["dialogs/export_file"].content = "header\n  = \"Exporting database '\"\n  b= database\n  = \"'\"\n\nform\n  p.save-to-file\n    = \"Save to file:\"\n    input(type=\"text\" name=\"export_to_file\" readonly placeholder=\"click to select file...\")\n  p\n    label\n      = \"Export structure\"\n      input(type=\"checkbox\" name=\"export_structure\" checked)\n  p\n    label\n      = \"Export data\"\n      input(type=\"checkbox\" name=\"export_data\" checked)\n\n  p\n    label\n      = \"Objects ownership\"\n      input(type=\"checkbox\" name=\"objects_ownership\")\n\n  code.result\n\n  p.buttons\n    button.ok Start\n    button.cancel Cancel\n  p.buttons.close-btn.is-hidden\n    button.cancel Close";
exports["dialogs/import_file"] = function template(pug, locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {var pug_debug_sources = {"views\u002Fdialogs\u002Fimport_file.jade":"header\n  = \"Importing file:\"\n  code\n    = filename\n\nform\n  p\n    label Database\n    select(name=\"database\")\n      each database in databases\n        option( value = database, selected = (database == currentDb) )= database\n\n      option(disabled = true) -----\n      option(value = '**create-db**') Create database\n\n  p.new-database-input.is-hidden\n    label New database\n    input(name=\"new_database_name\")\n\n  input.pseudo-hidden(type=\"submit\")\n\n  code.result\n\n  p.buttons\n    button.ok Import file\n    button.cancel cancel\n  p.buttons.close-btn.is-hidden\n    button.cancel Close"};
;var locals_for_with = (locals || {});(function (currentDb, databases, filename) {var pug_indent = [];
;pug_debug_line = 1;pug_debug_filename = "views\u002Fdialogs\u002Fimport_file.jade";
pug_html = pug_html + "\n\u003Cheader\u003E";
;pug_debug_line = 2;pug_debug_filename = "views\u002Fdialogs\u002Fimport_file.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = "Importing file:") ? "" : pug_interp));
;pug_debug_line = 3;pug_debug_filename = "views\u002Fdialogs\u002Fimport_file.jade";
pug_html = pug_html + "\u003Ccode\u003E";
;pug_debug_line = 4;pug_debug_filename = "views\u002Fdialogs\u002Fimport_file.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = filename) ? "" : pug_interp)) + "\u003C\u002Fcode\u003E\n\u003C\u002Fheader\u003E";
;pug_debug_line = 6;pug_debug_filename = "views\u002Fdialogs\u002Fimport_file.jade";
pug_html = pug_html + "\n\u003Cform\u003E";
;pug_debug_line = 7;pug_debug_filename = "views\u002Fdialogs\u002Fimport_file.jade";
pug_html = pug_html + "\n  \u003Cp\u003E";
;pug_debug_line = 8;pug_debug_filename = "views\u002Fdialogs\u002Fimport_file.jade";
pug_html = pug_html + "\n    \u003Clabel\u003E";
;pug_debug_line = 8;pug_debug_filename = "views\u002Fdialogs\u002Fimport_file.jade";
pug_html = pug_html + "Database\u003C\u002Flabel\u003E";
;pug_debug_line = 9;pug_debug_filename = "views\u002Fdialogs\u002Fimport_file.jade";
pug_html = pug_html + "\n    \u003Cselect name=\"database\"\u003E";
;pug_debug_line = 10;pug_debug_filename = "views\u002Fdialogs\u002Fimport_file.jade";
// iterate databases
;(function(){
  var $$obj = databases;
  if ('number' == typeof $$obj.length) {
      for (var pug_index0 = 0, $$l = $$obj.length; pug_index0 < $$l; pug_index0++) {
        var database = $$obj[pug_index0];
;pug_debug_line = 11;pug_debug_filename = "views\u002Fdialogs\u002Fimport_file.jade";
pug_html = pug_html + "\n      \u003Coption" + (pug.attr("value", database, true, false)+pug.attr("selected", (database == currentDb), true, false)) + "\u003E";
;pug_debug_line = 11;pug_debug_filename = "views\u002Fdialogs\u002Fimport_file.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = database) ? "" : pug_interp)) + "\u003C\u002Foption\u003E";
      }
  } else {
    var $$l = 0;
    for (var pug_index0 in $$obj) {
      $$l++;
      var database = $$obj[pug_index0];
;pug_debug_line = 11;pug_debug_filename = "views\u002Fdialogs\u002Fimport_file.jade";
pug_html = pug_html + "\n      \u003Coption" + (pug.attr("value", database, true, false)+pug.attr("selected", (database == currentDb), true, false)) + "\u003E";
;pug_debug_line = 11;pug_debug_filename = "views\u002Fdialogs\u002Fimport_file.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = database) ? "" : pug_interp)) + "\u003C\u002Foption\u003E";
    }
  }
}).call(this);

;pug_debug_line = 13;pug_debug_filename = "views\u002Fdialogs\u002Fimport_file.jade";
pug_html = pug_html + "\n      \u003Coption disabled=\"disabled\"\u003E";
;pug_debug_line = 13;pug_debug_filename = "views\u002Fdialogs\u002Fimport_file.jade";
pug_html = pug_html + "-----\u003C\u002Foption\u003E";
;pug_debug_line = 14;pug_debug_filename = "views\u002Fdialogs\u002Fimport_file.jade";
pug_html = pug_html + "\n      \u003Coption value=\"**create-db**\"\u003E";
;pug_debug_line = 14;pug_debug_filename = "views\u002Fdialogs\u002Fimport_file.jade";
pug_html = pug_html + "Create database\u003C\u002Foption\u003E\n    \u003C\u002Fselect\u003E\n  \u003C\u002Fp\u003E";
;pug_debug_line = 16;pug_debug_filename = "views\u002Fdialogs\u002Fimport_file.jade";
pug_html = pug_html + "\n  \u003Cp class=\"new-database-input is-hidden\"\u003E";
;pug_debug_line = 17;pug_debug_filename = "views\u002Fdialogs\u002Fimport_file.jade";
pug_html = pug_html + "\n    \u003Clabel\u003E";
;pug_debug_line = 17;pug_debug_filename = "views\u002Fdialogs\u002Fimport_file.jade";
pug_html = pug_html + "New database\u003C\u002Flabel\u003E";
;pug_debug_line = 18;pug_debug_filename = "views\u002Fdialogs\u002Fimport_file.jade";
pug_html = pug_html + "\n    \u003Cinput name=\"new_database_name\"\u002F\u003E\n  \u003C\u002Fp\u003E";
;pug_debug_line = 20;pug_debug_filename = "views\u002Fdialogs\u002Fimport_file.jade";
pug_html = pug_html + "\n  \u003Cinput class=\"pseudo-hidden\" type=\"submit\"\u002F\u003E";
;pug_debug_line = 22;pug_debug_filename = "views\u002Fdialogs\u002Fimport_file.jade";
pug_html = pug_html + "\u003Ccode class=\"result\"\u003E\u003C\u002Fcode\u003E";
;pug_debug_line = 24;pug_debug_filename = "views\u002Fdialogs\u002Fimport_file.jade";
pug_html = pug_html + "\n  \u003Cp class=\"buttons\"\u003E";
;pug_debug_line = 25;pug_debug_filename = "views\u002Fdialogs\u002Fimport_file.jade";
pug_html = pug_html + "\n    \u003Cbutton class=\"ok\"\u003E";
;pug_debug_line = 25;pug_debug_filename = "views\u002Fdialogs\u002Fimport_file.jade";
pug_html = pug_html + "Import file\u003C\u002Fbutton\u003E";
;pug_debug_line = 26;pug_debug_filename = "views\u002Fdialogs\u002Fimport_file.jade";
pug_html = pug_html + "\n    \u003Cbutton class=\"cancel\"\u003E";
;pug_debug_line = 26;pug_debug_filename = "views\u002Fdialogs\u002Fimport_file.jade";
pug_html = pug_html + "cancel\u003C\u002Fbutton\u003E\n  \u003C\u002Fp\u003E";
;pug_debug_line = 27;pug_debug_filename = "views\u002Fdialogs\u002Fimport_file.jade";
pug_html = pug_html + "\n  \u003Cp class=\"buttons close-btn is-hidden\"\u003E";
;pug_debug_line = 28;pug_debug_filename = "views\u002Fdialogs\u002Fimport_file.jade";
pug_html = pug_html + "\n    \u003Cbutton class=\"cancel\"\u003E";
;pug_debug_line = 28;pug_debug_filename = "views\u002Fdialogs\u002Fimport_file.jade";
pug_html = pug_html + "Close\u003C\u002Fbutton\u003E\n  \u003C\u002Fp\u003E\n\u003C\u002Fform\u003E";}.call(this,"currentDb" in locals_for_with?locals_for_with.currentDb:typeof currentDb!=="undefined"?currentDb:undefined,"databases" in locals_for_with?locals_for_with.databases:typeof databases!=="undefined"?databases:undefined,"filename" in locals_for_with?locals_for_with.filename:typeof filename!=="undefined"?filename:undefined));} catch (err) {pug.rethrow(err, pug_debug_filename, pug_debug_line, pug_debug_sources[pug_debug_filename]);};return pug_html;};
exports["dialogs/import_file"].content = "header\n  = \"Importing file:\"\n  code\n    = filename\n\nform\n  p\n    label Database\n    select(name=\"database\")\n      each database in databases\n        option( value = database, selected = (database == currentDb) )= database\n\n      option(disabled = true) -----\n      option(value = '**create-db**') Create database\n\n  p.new-database-input.is-hidden\n    label New database\n    input(name=\"new_database_name\")\n\n  input.pseudo-hidden(type=\"submit\")\n\n  code.result\n\n  p.buttons\n    button.ok Import file\n    button.cancel cancel\n  p.buttons.close-btn.is-hidden\n    button.cancel Close";
exports["dialogs/index_form"] = function template(pug, locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {var pug_debug_sources = {"views\u002Fdialogs\u002Findex_form.jade":"\nform\n  p\n    label(for=\"index_name_field\") Name\n    input#index_name_field(name=\"name\", placeholder=\"optional\")\n\n  p\n    label Columns\n    ul.columns-names\n      each column in columns\n        li\n          label\n            input(type=\"checkbox\", name=\"columns[\" + column.column_name + \"]\", value= column.column_name)\n            = column.column_name\n  p\n    label(for=\"index_uniq_field\") Uniq\n    input#index_uniq_field(type=\"checkbox\", name=\"uniq\", value=\"1\")\n\n  p\n    label(for=\"index_method_field\") Method\n    select#index_method_field(name=\"method\")\n      option(value=\"btree\") btree\n      option(value=\"hash\") hash\n      option(value=\"gist\") gist\n      option(value=\"gin\") gin\n\n  input.pseudo-hidden(type=\"submit\")\n  p.buttons\n    button.ok Add index\n    button.cancel cancel\n"};
;var locals_for_with = (locals || {});(function (columns) {var pug_indent = [];
;pug_debug_line = 2;pug_debug_filename = "views\u002Fdialogs\u002Findex_form.jade";
pug_html = pug_html + "\n\u003Cform\u003E";
;pug_debug_line = 3;pug_debug_filename = "views\u002Fdialogs\u002Findex_form.jade";
pug_html = pug_html + "\n  \u003Cp\u003E";
;pug_debug_line = 4;pug_debug_filename = "views\u002Fdialogs\u002Findex_form.jade";
pug_html = pug_html + "\n    \u003Clabel for=\"index_name_field\"\u003E";
;pug_debug_line = 4;pug_debug_filename = "views\u002Fdialogs\u002Findex_form.jade";
pug_html = pug_html + "Name\u003C\u002Flabel\u003E";
;pug_debug_line = 5;pug_debug_filename = "views\u002Fdialogs\u002Findex_form.jade";
pug_html = pug_html + "\n    \u003Cinput id=\"index_name_field\" name=\"name\" placeholder=\"optional\"\u002F\u003E\n  \u003C\u002Fp\u003E";
;pug_debug_line = 7;pug_debug_filename = "views\u002Fdialogs\u002Findex_form.jade";
pug_html = pug_html + "\n  \u003Cp\u003E";
;pug_debug_line = 8;pug_debug_filename = "views\u002Fdialogs\u002Findex_form.jade";
pug_html = pug_html + "\n    \u003Clabel\u003E";
;pug_debug_line = 8;pug_debug_filename = "views\u002Fdialogs\u002Findex_form.jade";
pug_html = pug_html + "Columns\u003C\u002Flabel\u003E";
;pug_debug_line = 9;pug_debug_filename = "views\u002Fdialogs\u002Findex_form.jade";
pug_html = pug_html + "\n    \u003Cul class=\"columns-names\"\u003E";
;pug_debug_line = 10;pug_debug_filename = "views\u002Fdialogs\u002Findex_form.jade";
// iterate columns
;(function(){
  var $$obj = columns;
  if ('number' == typeof $$obj.length) {
      for (var pug_index0 = 0, $$l = $$obj.length; pug_index0 < $$l; pug_index0++) {
        var column = $$obj[pug_index0];
;pug_debug_line = 11;pug_debug_filename = "views\u002Fdialogs\u002Findex_form.jade";
pug_html = pug_html + "\n      \u003Cli\u003E";
;pug_debug_line = 12;pug_debug_filename = "views\u002Fdialogs\u002Findex_form.jade";
pug_html = pug_html + "\n        \u003Clabel\u003E";
;pug_debug_line = 13;pug_debug_filename = "views\u002Fdialogs\u002Findex_form.jade";
pug_html = pug_html + "\n          \u003Cinput" + (" type=\"checkbox\""+pug.attr("name", "columns[" + column.column_name + "]", true, false)+pug.attr("value", column.column_name, true, false)) + "\u002F\u003E";
;pug_debug_line = 14;pug_debug_filename = "views\u002Fdialogs\u002Findex_form.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = column.column_name) ? "" : pug_interp)) + "\n        \u003C\u002Flabel\u003E\n      \u003C\u002Fli\u003E";
      }
  } else {
    var $$l = 0;
    for (var pug_index0 in $$obj) {
      $$l++;
      var column = $$obj[pug_index0];
;pug_debug_line = 11;pug_debug_filename = "views\u002Fdialogs\u002Findex_form.jade";
pug_html = pug_html + "\n      \u003Cli\u003E";
;pug_debug_line = 12;pug_debug_filename = "views\u002Fdialogs\u002Findex_form.jade";
pug_html = pug_html + "\n        \u003Clabel\u003E";
;pug_debug_line = 13;pug_debug_filename = "views\u002Fdialogs\u002Findex_form.jade";
pug_html = pug_html + "\n          \u003Cinput" + (" type=\"checkbox\""+pug.attr("name", "columns[" + column.column_name + "]", true, false)+pug.attr("value", column.column_name, true, false)) + "\u002F\u003E";
;pug_debug_line = 14;pug_debug_filename = "views\u002Fdialogs\u002Findex_form.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = column.column_name) ? "" : pug_interp)) + "\n        \u003C\u002Flabel\u003E\n      \u003C\u002Fli\u003E";
    }
  }
}).call(this);

pug_html = pug_html + "\n    \u003C\u002Ful\u003E\n  \u003C\u002Fp\u003E";
;pug_debug_line = 15;pug_debug_filename = "views\u002Fdialogs\u002Findex_form.jade";
pug_html = pug_html + "\n  \u003Cp\u003E";
;pug_debug_line = 16;pug_debug_filename = "views\u002Fdialogs\u002Findex_form.jade";
pug_html = pug_html + "\n    \u003Clabel for=\"index_uniq_field\"\u003E";
;pug_debug_line = 16;pug_debug_filename = "views\u002Fdialogs\u002Findex_form.jade";
pug_html = pug_html + "Uniq\u003C\u002Flabel\u003E";
;pug_debug_line = 17;pug_debug_filename = "views\u002Fdialogs\u002Findex_form.jade";
pug_html = pug_html + "\n    \u003Cinput id=\"index_uniq_field\" type=\"checkbox\" name=\"uniq\" value=\"1\"\u002F\u003E\n  \u003C\u002Fp\u003E";
;pug_debug_line = 19;pug_debug_filename = "views\u002Fdialogs\u002Findex_form.jade";
pug_html = pug_html + "\n  \u003Cp\u003E";
;pug_debug_line = 20;pug_debug_filename = "views\u002Fdialogs\u002Findex_form.jade";
pug_html = pug_html + "\n    \u003Clabel for=\"index_method_field\"\u003E";
;pug_debug_line = 20;pug_debug_filename = "views\u002Fdialogs\u002Findex_form.jade";
pug_html = pug_html + "Method\u003C\u002Flabel\u003E";
;pug_debug_line = 21;pug_debug_filename = "views\u002Fdialogs\u002Findex_form.jade";
pug_html = pug_html + "\n    \u003Cselect id=\"index_method_field\" name=\"method\"\u003E";
;pug_debug_line = 22;pug_debug_filename = "views\u002Fdialogs\u002Findex_form.jade";
pug_html = pug_html + "\n      \u003Coption value=\"btree\"\u003E";
;pug_debug_line = 22;pug_debug_filename = "views\u002Fdialogs\u002Findex_form.jade";
pug_html = pug_html + "btree\u003C\u002Foption\u003E";
;pug_debug_line = 23;pug_debug_filename = "views\u002Fdialogs\u002Findex_form.jade";
pug_html = pug_html + "\n      \u003Coption value=\"hash\"\u003E";
;pug_debug_line = 23;pug_debug_filename = "views\u002Fdialogs\u002Findex_form.jade";
pug_html = pug_html + "hash\u003C\u002Foption\u003E";
;pug_debug_line = 24;pug_debug_filename = "views\u002Fdialogs\u002Findex_form.jade";
pug_html = pug_html + "\n      \u003Coption value=\"gist\"\u003E";
;pug_debug_line = 24;pug_debug_filename = "views\u002Fdialogs\u002Findex_form.jade";
pug_html = pug_html + "gist\u003C\u002Foption\u003E";
;pug_debug_line = 25;pug_debug_filename = "views\u002Fdialogs\u002Findex_form.jade";
pug_html = pug_html + "\n      \u003Coption value=\"gin\"\u003E";
;pug_debug_line = 25;pug_debug_filename = "views\u002Fdialogs\u002Findex_form.jade";
pug_html = pug_html + "gin\u003C\u002Foption\u003E\n    \u003C\u002Fselect\u003E\n  \u003C\u002Fp\u003E";
;pug_debug_line = 27;pug_debug_filename = "views\u002Fdialogs\u002Findex_form.jade";
pug_html = pug_html + "\n  \u003Cinput class=\"pseudo-hidden\" type=\"submit\"\u002F\u003E";
;pug_debug_line = 28;pug_debug_filename = "views\u002Fdialogs\u002Findex_form.jade";
pug_html = pug_html + "\n  \u003Cp class=\"buttons\"\u003E";
;pug_debug_line = 29;pug_debug_filename = "views\u002Fdialogs\u002Findex_form.jade";
pug_html = pug_html + "\n    \u003Cbutton class=\"ok\"\u003E";
;pug_debug_line = 29;pug_debug_filename = "views\u002Fdialogs\u002Findex_form.jade";
pug_html = pug_html + "Add index\u003C\u002Fbutton\u003E";
;pug_debug_line = 30;pug_debug_filename = "views\u002Fdialogs\u002Findex_form.jade";
pug_html = pug_html + "\n    \u003Cbutton class=\"cancel\"\u003E";
;pug_debug_line = 30;pug_debug_filename = "views\u002Fdialogs\u002Findex_form.jade";
pug_html = pug_html + "cancel\u003C\u002Fbutton\u003E\n  \u003C\u002Fp\u003E\n\u003C\u002Fform\u003E";}.call(this,"columns" in locals_for_with?locals_for_with.columns:typeof columns!=="undefined"?columns:undefined));} catch (err) {pug.rethrow(err, pug_debug_filename, pug_debug_line, pug_debug_sources[pug_debug_filename]);};return pug_html;};
exports["dialogs/index_form"].content = "\nform\n  p\n    label(for=\"index_name_field\") Name\n    input#index_name_field(name=\"name\", placeholder=\"optional\")\n\n  p\n    label Columns\n    ul.columns-names\n      each column in columns\n        li\n          label\n            input(type=\"checkbox\", name=\"columns[\" + column.column_name + \"]\", value= column.column_name)\n            = column.column_name\n  p\n    label(for=\"index_uniq_field\") Uniq\n    input#index_uniq_field(type=\"checkbox\", name=\"uniq\", value=\"1\")\n\n  p\n    label(for=\"index_method_field\") Method\n    select#index_method_field(name=\"method\")\n      option(value=\"btree\") btree\n      option(value=\"hash\") hash\n      option(value=\"gist\") gist\n      option(value=\"gin\") gin\n\n  input.pseudo-hidden(type=\"submit\")\n  p.buttons\n    button.ok Add index\n    button.cancel cancel\n";
exports["dialogs/list_languages"] = function template(pug, locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {var pug_debug_sources = {"views\u002Fdialogs\u002Flist_languages.jade":".rescol-wrapper.with-borders\n  .rescol-header-wrapper\n  .rescol-content-wrapper\n    table\n      thead\n        tr\n          th name\n          th trusted\n      tbody\n        each lang in langs\n          tr\n            td= lang.lanname\n            td= lang.lanpltrusted ? \"Yes\" : \"No\"\n\np\n  = \"You can add and remove languages on extension tab\"\n\np.buttons\n  button.cancel Close\n\n"};
;var locals_for_with = (locals || {});(function (langs) {var pug_indent = [];
;pug_debug_line = 1;pug_debug_filename = "views\u002Fdialogs\u002Flist_languages.jade";
pug_html = pug_html + "\n\u003Cdiv class=\"rescol-wrapper with-borders\"\u003E";
;pug_debug_line = 2;pug_debug_filename = "views\u002Fdialogs\u002Flist_languages.jade";
pug_html = pug_html + "\n  \u003Cdiv class=\"rescol-header-wrapper\"\u003E\u003C\u002Fdiv\u003E";
;pug_debug_line = 3;pug_debug_filename = "views\u002Fdialogs\u002Flist_languages.jade";
pug_html = pug_html + "\n  \u003Cdiv class=\"rescol-content-wrapper\"\u003E";
;pug_debug_line = 4;pug_debug_filename = "views\u002Fdialogs\u002Flist_languages.jade";
pug_html = pug_html + "\n    \u003Ctable\u003E";
;pug_debug_line = 5;pug_debug_filename = "views\u002Fdialogs\u002Flist_languages.jade";
pug_html = pug_html + "\n      \u003Cthead\u003E";
;pug_debug_line = 6;pug_debug_filename = "views\u002Fdialogs\u002Flist_languages.jade";
pug_html = pug_html + "\n        \u003Ctr\u003E";
;pug_debug_line = 7;pug_debug_filename = "views\u002Fdialogs\u002Flist_languages.jade";
pug_html = pug_html + "\n          \u003Cth\u003E";
;pug_debug_line = 7;pug_debug_filename = "views\u002Fdialogs\u002Flist_languages.jade";
pug_html = pug_html + "name\u003C\u002Fth\u003E";
;pug_debug_line = 8;pug_debug_filename = "views\u002Fdialogs\u002Flist_languages.jade";
pug_html = pug_html + "\n          \u003Cth\u003E";
;pug_debug_line = 8;pug_debug_filename = "views\u002Fdialogs\u002Flist_languages.jade";
pug_html = pug_html + "trusted\u003C\u002Fth\u003E\n        \u003C\u002Ftr\u003E\n      \u003C\u002Fthead\u003E";
;pug_debug_line = 9;pug_debug_filename = "views\u002Fdialogs\u002Flist_languages.jade";
pug_html = pug_html + "\n      \u003Ctbody\u003E";
;pug_debug_line = 10;pug_debug_filename = "views\u002Fdialogs\u002Flist_languages.jade";
// iterate langs
;(function(){
  var $$obj = langs;
  if ('number' == typeof $$obj.length) {
      for (var pug_index0 = 0, $$l = $$obj.length; pug_index0 < $$l; pug_index0++) {
        var lang = $$obj[pug_index0];
;pug_debug_line = 11;pug_debug_filename = "views\u002Fdialogs\u002Flist_languages.jade";
pug_html = pug_html + "\n        \u003Ctr\u003E";
;pug_debug_line = 12;pug_debug_filename = "views\u002Fdialogs\u002Flist_languages.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 12;pug_debug_filename = "views\u002Fdialogs\u002Flist_languages.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = lang.lanname) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 13;pug_debug_filename = "views\u002Fdialogs\u002Flist_languages.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 13;pug_debug_filename = "views\u002Fdialogs\u002Flist_languages.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = lang.lanpltrusted ? "Yes" : "No") ? "" : pug_interp)) + "\u003C\u002Ftd\u003E\n        \u003C\u002Ftr\u003E";
      }
  } else {
    var $$l = 0;
    for (var pug_index0 in $$obj) {
      $$l++;
      var lang = $$obj[pug_index0];
;pug_debug_line = 11;pug_debug_filename = "views\u002Fdialogs\u002Flist_languages.jade";
pug_html = pug_html + "\n        \u003Ctr\u003E";
;pug_debug_line = 12;pug_debug_filename = "views\u002Fdialogs\u002Flist_languages.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 12;pug_debug_filename = "views\u002Fdialogs\u002Flist_languages.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = lang.lanname) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 13;pug_debug_filename = "views\u002Fdialogs\u002Flist_languages.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 13;pug_debug_filename = "views\u002Fdialogs\u002Flist_languages.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = lang.lanpltrusted ? "Yes" : "No") ? "" : pug_interp)) + "\u003C\u002Ftd\u003E\n        \u003C\u002Ftr\u003E";
    }
  }
}).call(this);

pug_html = pug_html + "\n      \u003C\u002Ftbody\u003E\n    \u003C\u002Ftable\u003E\n  \u003C\u002Fdiv\u003E\n\u003C\u002Fdiv\u003E";
;pug_debug_line = 15;pug_debug_filename = "views\u002Fdialogs\u002Flist_languages.jade";
pug_html = pug_html + "\n\u003Cp\u003E";
;pug_debug_line = 16;pug_debug_filename = "views\u002Fdialogs\u002Flist_languages.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = "You can add and remove languages on extension tab") ? "" : pug_interp)) + "\n\u003C\u002Fp\u003E";
;pug_debug_line = 18;pug_debug_filename = "views\u002Fdialogs\u002Flist_languages.jade";
pug_html = pug_html + "\n\u003Cp class=\"buttons\"\u003E";
;pug_debug_line = 19;pug_debug_filename = "views\u002Fdialogs\u002Flist_languages.jade";
pug_html = pug_html + "\n  \u003Cbutton class=\"cancel\"\u003E";
;pug_debug_line = 19;pug_debug_filename = "views\u002Fdialogs\u002Flist_languages.jade";
pug_html = pug_html + "Close\u003C\u002Fbutton\u003E\n\u003C\u002Fp\u003E";}.call(this,"langs" in locals_for_with?locals_for_with.langs:typeof langs!=="undefined"?langs:undefined));} catch (err) {pug.rethrow(err, pug_debug_filename, pug_debug_line, pug_debug_sources[pug_debug_filename]);};return pug_html;};
exports["dialogs/list_languages"].content = ".rescol-wrapper.with-borders\n  .rescol-header-wrapper\n  .rescol-content-wrapper\n    table\n      thead\n        tr\n          th name\n          th trusted\n      tbody\n        each lang in langs\n          tr\n            td= lang.lanname\n            td= lang.lanpltrusted ? \"Yes\" : \"No\"\n\np\n  = \"You can add and remove languages on extension tab\"\n\np.buttons\n  button.cancel Close\n\n";
exports["dialogs/new_database"] = function template(pug, locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {var pug_debug_sources = {"views\u002Fdialogs\u002Fnew_database.jade":"form\n  p\n    label Database\n    input(type=\"text\" name=\"dbname\")\n  p\n    label Template\n    select.template(name=\"template\")\n  p\n    label Encoding\n    select.encoding(name=\"encoding\")\n\n    input.pseudo-hidden(type=\"submit\")\n  p.buttons\n    button.ok Create database\n    button.cancel cancel\n"};
var pug_indent = [];
;pug_debug_line = 1;pug_debug_filename = "views\u002Fdialogs\u002Fnew_database.jade";
pug_html = pug_html + "\n\u003Cform\u003E";
;pug_debug_line = 2;pug_debug_filename = "views\u002Fdialogs\u002Fnew_database.jade";
pug_html = pug_html + "\n  \u003Cp\u003E";
;pug_debug_line = 3;pug_debug_filename = "views\u002Fdialogs\u002Fnew_database.jade";
pug_html = pug_html + "\n    \u003Clabel\u003E";
;pug_debug_line = 3;pug_debug_filename = "views\u002Fdialogs\u002Fnew_database.jade";
pug_html = pug_html + "Database\u003C\u002Flabel\u003E";
;pug_debug_line = 4;pug_debug_filename = "views\u002Fdialogs\u002Fnew_database.jade";
pug_html = pug_html + "\n    \u003Cinput type=\"text\" name=\"dbname\"\u002F\u003E\n  \u003C\u002Fp\u003E";
;pug_debug_line = 5;pug_debug_filename = "views\u002Fdialogs\u002Fnew_database.jade";
pug_html = pug_html + "\n  \u003Cp\u003E";
;pug_debug_line = 6;pug_debug_filename = "views\u002Fdialogs\u002Fnew_database.jade";
pug_html = pug_html + "\n    \u003Clabel\u003E";
;pug_debug_line = 6;pug_debug_filename = "views\u002Fdialogs\u002Fnew_database.jade";
pug_html = pug_html + "Template\u003C\u002Flabel\u003E";
;pug_debug_line = 7;pug_debug_filename = "views\u002Fdialogs\u002Fnew_database.jade";
pug_html = pug_html + "\n    \u003Cselect class=\"template\" name=\"template\"\u003E\u003C\u002Fselect\u003E\n  \u003C\u002Fp\u003E";
;pug_debug_line = 8;pug_debug_filename = "views\u002Fdialogs\u002Fnew_database.jade";
pug_html = pug_html + "\n  \u003Cp\u003E";
;pug_debug_line = 9;pug_debug_filename = "views\u002Fdialogs\u002Fnew_database.jade";
pug_html = pug_html + "\n    \u003Clabel\u003E";
;pug_debug_line = 9;pug_debug_filename = "views\u002Fdialogs\u002Fnew_database.jade";
pug_html = pug_html + "Encoding\u003C\u002Flabel\u003E";
;pug_debug_line = 10;pug_debug_filename = "views\u002Fdialogs\u002Fnew_database.jade";
pug_html = pug_html + "\n    \u003Cselect class=\"encoding\" name=\"encoding\"\u003E\u003C\u002Fselect\u003E";
;pug_debug_line = 12;pug_debug_filename = "views\u002Fdialogs\u002Fnew_database.jade";
pug_html = pug_html + "\n    \u003Cinput class=\"pseudo-hidden\" type=\"submit\"\u002F\u003E\n  \u003C\u002Fp\u003E";
;pug_debug_line = 13;pug_debug_filename = "views\u002Fdialogs\u002Fnew_database.jade";
pug_html = pug_html + "\n  \u003Cp class=\"buttons\"\u003E";
;pug_debug_line = 14;pug_debug_filename = "views\u002Fdialogs\u002Fnew_database.jade";
pug_html = pug_html + "\n    \u003Cbutton class=\"ok\"\u003E";
;pug_debug_line = 14;pug_debug_filename = "views\u002Fdialogs\u002Fnew_database.jade";
pug_html = pug_html + "Create database\u003C\u002Fbutton\u003E";
;pug_debug_line = 15;pug_debug_filename = "views\u002Fdialogs\u002Fnew_database.jade";
pug_html = pug_html + "\n    \u003Cbutton class=\"cancel\"\u003E";
;pug_debug_line = 15;pug_debug_filename = "views\u002Fdialogs\u002Fnew_database.jade";
pug_html = pug_html + "cancel\u003C\u002Fbutton\u003E\n  \u003C\u002Fp\u003E\n\u003C\u002Fform\u003E";} catch (err) {pug.rethrow(err, pug_debug_filename, pug_debug_line, pug_debug_sources[pug_debug_filename]);};return pug_html;};
exports["dialogs/new_database"].content = "form\n  p\n    label Database\n    input(type=\"text\" name=\"dbname\")\n  p\n    label Template\n    select.template(name=\"template\")\n  p\n    label Encoding\n    select.encoding(name=\"encoding\")\n\n    input.pseudo-hidden(type=\"submit\")\n  p.buttons\n    button.ok Create database\n    button.cancel cancel\n";
exports["dialogs/new_table"] = function template(pug, locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {var pug_debug_sources = {"views\u002Fdialogs\u002Fnew_table.jade":"form\n  p\n    label Table name\n    input(name=\"name\")\n\n  p\n    label Tablespace\n    select(name=\"tablespace\")\n\n  input.pseudo-hidden(type=\"submit\")\n\n  p.buttons\n    button.ok Create table\n    button.cancel cancel\n"};
var pug_indent = [];
;pug_debug_line = 1;pug_debug_filename = "views\u002Fdialogs\u002Fnew_table.jade";
pug_html = pug_html + "\n\u003Cform\u003E";
;pug_debug_line = 2;pug_debug_filename = "views\u002Fdialogs\u002Fnew_table.jade";
pug_html = pug_html + "\n  \u003Cp\u003E";
;pug_debug_line = 3;pug_debug_filename = "views\u002Fdialogs\u002Fnew_table.jade";
pug_html = pug_html + "\n    \u003Clabel\u003E";
;pug_debug_line = 3;pug_debug_filename = "views\u002Fdialogs\u002Fnew_table.jade";
pug_html = pug_html + "Table name\u003C\u002Flabel\u003E";
;pug_debug_line = 4;pug_debug_filename = "views\u002Fdialogs\u002Fnew_table.jade";
pug_html = pug_html + "\n    \u003Cinput name=\"name\"\u002F\u003E\n  \u003C\u002Fp\u003E";
;pug_debug_line = 6;pug_debug_filename = "views\u002Fdialogs\u002Fnew_table.jade";
pug_html = pug_html + "\n  \u003Cp\u003E";
;pug_debug_line = 7;pug_debug_filename = "views\u002Fdialogs\u002Fnew_table.jade";
pug_html = pug_html + "\n    \u003Clabel\u003E";
;pug_debug_line = 7;pug_debug_filename = "views\u002Fdialogs\u002Fnew_table.jade";
pug_html = pug_html + "Tablespace\u003C\u002Flabel\u003E";
;pug_debug_line = 8;pug_debug_filename = "views\u002Fdialogs\u002Fnew_table.jade";
pug_html = pug_html + "\n    \u003Cselect name=\"tablespace\"\u003E\u003C\u002Fselect\u003E\n  \u003C\u002Fp\u003E";
;pug_debug_line = 10;pug_debug_filename = "views\u002Fdialogs\u002Fnew_table.jade";
pug_html = pug_html + "\n  \u003Cinput class=\"pseudo-hidden\" type=\"submit\"\u002F\u003E";
;pug_debug_line = 12;pug_debug_filename = "views\u002Fdialogs\u002Fnew_table.jade";
pug_html = pug_html + "\n  \u003Cp class=\"buttons\"\u003E";
;pug_debug_line = 13;pug_debug_filename = "views\u002Fdialogs\u002Fnew_table.jade";
pug_html = pug_html + "\n    \u003Cbutton class=\"ok\"\u003E";
;pug_debug_line = 13;pug_debug_filename = "views\u002Fdialogs\u002Fnew_table.jade";
pug_html = pug_html + "Create table\u003C\u002Fbutton\u003E";
;pug_debug_line = 14;pug_debug_filename = "views\u002Fdialogs\u002Fnew_table.jade";
pug_html = pug_html + "\n    \u003Cbutton class=\"cancel\"\u003E";
;pug_debug_line = 14;pug_debug_filename = "views\u002Fdialogs\u002Fnew_table.jade";
pug_html = pug_html + "cancel\u003C\u002Fbutton\u003E\n  \u003C\u002Fp\u003E\n\u003C\u002Fform\u003E";} catch (err) {pug.rethrow(err, pug_debug_filename, pug_debug_line, pug_debug_sources[pug_debug_filename]);};return pug_html;};
exports["dialogs/new_table"].content = "form\n  p\n    label Table name\n    input(name=\"name\")\n\n  p\n    label Tablespace\n    select(name=\"tablespace\")\n\n  input.pseudo-hidden(type=\"submit\")\n\n  p.buttons\n    button.ok Create table\n    button.cancel cancel\n";
exports["dialogs/show_sql"] = function template(pug, locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {var pug_debug_sources = {"views\u002Fdialogs\u002Fshow_sql.jade":"code.result.sql\n  = code\n\np.buttons\n  button.cancel OK"};
;var locals_for_with = (locals || {});(function (code) {var pug_indent = [];
;pug_debug_line = 1;pug_debug_filename = "views\u002Fdialogs\u002Fshow_sql.jade";
pug_html = pug_html + "\u003Ccode class=\"result sql\"\u003E";
;pug_debug_line = 2;pug_debug_filename = "views\u002Fdialogs\u002Fshow_sql.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = code) ? "" : pug_interp)) + "\u003C\u002Fcode\u003E";
;pug_debug_line = 4;pug_debug_filename = "views\u002Fdialogs\u002Fshow_sql.jade";
pug_html = pug_html + "\n\u003Cp class=\"buttons\"\u003E";
;pug_debug_line = 5;pug_debug_filename = "views\u002Fdialogs\u002Fshow_sql.jade";
pug_html = pug_html + "\n  \u003Cbutton class=\"cancel\"\u003E";
;pug_debug_line = 5;pug_debug_filename = "views\u002Fdialogs\u002Fshow_sql.jade";
pug_html = pug_html + "OK\u003C\u002Fbutton\u003E\n\u003C\u002Fp\u003E";}.call(this,"code" in locals_for_with?locals_for_with.code:typeof code!=="undefined"?code:undefined));} catch (err) {pug.rethrow(err, pug_debug_filename, pug_debug_line, pug_debug_sources[pug_debug_filename]);};return pug_html;};
exports["dialogs/show_sql"].content = "code.result.sql\n  = code\n\np.buttons\n  button.cancel OK";
exports["dialogs/user_form"] = function template(pug, locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {var pug_debug_sources = {"views\u002Fdialogs\u002Fuser_form.jade":"form\n  p\n    label Name\n    input(name=\"username\")\n  p\n    label Password\n    input(name=\"password\")\n  \u002F\u002Fp\n  \u002F\u002F  label Password (again)\n  \u002F\u002F  input(name=\"password_again\")\n  p\n    label\n      input(type=\"checkbox\" name=\"admin\" value=\"1\")\n      = \"Admin?\"\n  input.pseudo-hidden(type=\"submit\")\n  p.buttons\n    button.ok Create user\n    button.cancel cancel\n"};
var pug_indent = [];
;pug_debug_line = 1;pug_debug_filename = "views\u002Fdialogs\u002Fuser_form.jade";
pug_html = pug_html + "\n\u003Cform\u003E";
;pug_debug_line = 2;pug_debug_filename = "views\u002Fdialogs\u002Fuser_form.jade";
pug_html = pug_html + "\n  \u003Cp\u003E";
;pug_debug_line = 3;pug_debug_filename = "views\u002Fdialogs\u002Fuser_form.jade";
pug_html = pug_html + "\n    \u003Clabel\u003E";
;pug_debug_line = 3;pug_debug_filename = "views\u002Fdialogs\u002Fuser_form.jade";
pug_html = pug_html + "Name\u003C\u002Flabel\u003E";
;pug_debug_line = 4;pug_debug_filename = "views\u002Fdialogs\u002Fuser_form.jade";
pug_html = pug_html + "\n    \u003Cinput name=\"username\"\u002F\u003E\n  \u003C\u002Fp\u003E";
;pug_debug_line = 5;pug_debug_filename = "views\u002Fdialogs\u002Fuser_form.jade";
pug_html = pug_html + "\n  \u003Cp\u003E";
;pug_debug_line = 6;pug_debug_filename = "views\u002Fdialogs\u002Fuser_form.jade";
pug_html = pug_html + "\n    \u003Clabel\u003E";
;pug_debug_line = 6;pug_debug_filename = "views\u002Fdialogs\u002Fuser_form.jade";
pug_html = pug_html + "Password\u003C\u002Flabel\u003E";
;pug_debug_line = 7;pug_debug_filename = "views\u002Fdialogs\u002Fuser_form.jade";
pug_html = pug_html + "\n    \u003Cinput name=\"password\"\u002F\u003E\n  \u003C\u002Fp\u003E";
;pug_debug_line = 8;pug_debug_filename = "views\u002Fdialogs\u002Fuser_form.jade";
pug_html = pug_html + "\n  \u003C!--p--\u003E";
;pug_debug_line = 9;pug_debug_filename = "views\u002Fdialogs\u002Fuser_form.jade";
pug_html = pug_html + "\n  \u003C!--  label Password (again)--\u003E";
;pug_debug_line = 10;pug_debug_filename = "views\u002Fdialogs\u002Fuser_form.jade";
pug_html = pug_html + "\n  \u003C!--  input(name=\"password_again\")--\u003E";
;pug_debug_line = 11;pug_debug_filename = "views\u002Fdialogs\u002Fuser_form.jade";
pug_html = pug_html + "\n  \u003Cp\u003E";
;pug_debug_line = 12;pug_debug_filename = "views\u002Fdialogs\u002Fuser_form.jade";
pug_html = pug_html + "\n    \u003Clabel\u003E";
;pug_debug_line = 13;pug_debug_filename = "views\u002Fdialogs\u002Fuser_form.jade";
pug_html = pug_html + "\n      \u003Cinput type=\"checkbox\" name=\"admin\" value=\"1\"\u002F\u003E";
;pug_debug_line = 14;pug_debug_filename = "views\u002Fdialogs\u002Fuser_form.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = "Admin?") ? "" : pug_interp)) + "\n    \u003C\u002Flabel\u003E\n  \u003C\u002Fp\u003E";
;pug_debug_line = 15;pug_debug_filename = "views\u002Fdialogs\u002Fuser_form.jade";
pug_html = pug_html + "\n  \u003Cinput class=\"pseudo-hidden\" type=\"submit\"\u002F\u003E";
;pug_debug_line = 16;pug_debug_filename = "views\u002Fdialogs\u002Fuser_form.jade";
pug_html = pug_html + "\n  \u003Cp class=\"buttons\"\u003E";
;pug_debug_line = 17;pug_debug_filename = "views\u002Fdialogs\u002Fuser_form.jade";
pug_html = pug_html + "\n    \u003Cbutton class=\"ok\"\u003E";
;pug_debug_line = 17;pug_debug_filename = "views\u002Fdialogs\u002Fuser_form.jade";
pug_html = pug_html + "Create user\u003C\u002Fbutton\u003E";
;pug_debug_line = 18;pug_debug_filename = "views\u002Fdialogs\u002Fuser_form.jade";
pug_html = pug_html + "\n    \u003Cbutton class=\"cancel\"\u003E";
;pug_debug_line = 18;pug_debug_filename = "views\u002Fdialogs\u002Fuser_form.jade";
pug_html = pug_html + "cancel\u003C\u002Fbutton\u003E\n  \u003C\u002Fp\u003E\n\u003C\u002Fform\u003E";} catch (err) {pug.rethrow(err, pug_debug_filename, pug_debug_line, pug_debug_sources[pug_debug_filename]);};return pug_html;};
exports["dialogs/user_form"].content = "form\n  p\n    label Name\n    input(name=\"username\")\n  p\n    label Password\n    input(name=\"password\")\n  //p\n  //  label Password (again)\n  //  input(name=\"password_again\")\n  p\n    label\n      input(type=\"checkbox\" name=\"admin\" value=\"1\")\n      = \"Admin?\"\n  input.pseudo-hidden(type=\"submit\")\n  p.buttons\n    button.ok Create user\n    button.cancel cancel\n";
exports["extensions_tab"] = function template(pug, locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {var pug_debug_sources = {"views\u002Fextensions_tab.jade":".rescol-wrapper\n  .rescol-header-wrapper\n  .rescol-content-wrapper\n    table\n      thead\n        tr\n          th Name\n          th Default Version\n          th Installed Version\n          th\n      tbody\n        each column in rows\n          tr\n            td= column.name\n            td= column.default_version\n            td\n              if column.installed_version\n                strong= column.installed_version\n                button(exec=\"uninstall('\" + column.name + \"')\") Uninstall\n              else\n                button(exec=\"install('\" + column.name + \"')\") Install\n            td= column.comment"};
;var locals_for_with = (locals || {});(function (rows) {var pug_indent = [];
;pug_debug_line = 1;pug_debug_filename = "views\u002Fextensions_tab.jade";
pug_html = pug_html + "\n\u003Cdiv class=\"rescol-wrapper\"\u003E";
;pug_debug_line = 2;pug_debug_filename = "views\u002Fextensions_tab.jade";
pug_html = pug_html + "\n  \u003Cdiv class=\"rescol-header-wrapper\"\u003E\u003C\u002Fdiv\u003E";
;pug_debug_line = 3;pug_debug_filename = "views\u002Fextensions_tab.jade";
pug_html = pug_html + "\n  \u003Cdiv class=\"rescol-content-wrapper\"\u003E";
;pug_debug_line = 4;pug_debug_filename = "views\u002Fextensions_tab.jade";
pug_html = pug_html + "\n    \u003Ctable\u003E";
;pug_debug_line = 5;pug_debug_filename = "views\u002Fextensions_tab.jade";
pug_html = pug_html + "\n      \u003Cthead\u003E";
;pug_debug_line = 6;pug_debug_filename = "views\u002Fextensions_tab.jade";
pug_html = pug_html + "\n        \u003Ctr\u003E";
;pug_debug_line = 7;pug_debug_filename = "views\u002Fextensions_tab.jade";
pug_html = pug_html + "\n          \u003Cth\u003E";
;pug_debug_line = 7;pug_debug_filename = "views\u002Fextensions_tab.jade";
pug_html = pug_html + "Name\u003C\u002Fth\u003E";
;pug_debug_line = 8;pug_debug_filename = "views\u002Fextensions_tab.jade";
pug_html = pug_html + "\n          \u003Cth\u003E";
;pug_debug_line = 8;pug_debug_filename = "views\u002Fextensions_tab.jade";
pug_html = pug_html + "Default Version\u003C\u002Fth\u003E";
;pug_debug_line = 9;pug_debug_filename = "views\u002Fextensions_tab.jade";
pug_html = pug_html + "\n          \u003Cth\u003E";
;pug_debug_line = 9;pug_debug_filename = "views\u002Fextensions_tab.jade";
pug_html = pug_html + "Installed Version\u003C\u002Fth\u003E";
;pug_debug_line = 10;pug_debug_filename = "views\u002Fextensions_tab.jade";
pug_html = pug_html + "\n          \u003Cth\u003E\u003C\u002Fth\u003E\n        \u003C\u002Ftr\u003E\n      \u003C\u002Fthead\u003E";
;pug_debug_line = 11;pug_debug_filename = "views\u002Fextensions_tab.jade";
pug_html = pug_html + "\n      \u003Ctbody\u003E";
;pug_debug_line = 12;pug_debug_filename = "views\u002Fextensions_tab.jade";
// iterate rows
;(function(){
  var $$obj = rows;
  if ('number' == typeof $$obj.length) {
      for (var pug_index0 = 0, $$l = $$obj.length; pug_index0 < $$l; pug_index0++) {
        var column = $$obj[pug_index0];
;pug_debug_line = 13;pug_debug_filename = "views\u002Fextensions_tab.jade";
pug_html = pug_html + "\n        \u003Ctr\u003E";
;pug_debug_line = 14;pug_debug_filename = "views\u002Fextensions_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 14;pug_debug_filename = "views\u002Fextensions_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = column.name) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 15;pug_debug_filename = "views\u002Fextensions_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 15;pug_debug_filename = "views\u002Fextensions_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = column.default_version) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 16;pug_debug_filename = "views\u002Fextensions_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 17;pug_debug_filename = "views\u002Fextensions_tab.jade";
if (column.installed_version) {
;pug_debug_line = 18;pug_debug_filename = "views\u002Fextensions_tab.jade";
pug_html = pug_html + "\u003Cstrong\u003E";
;pug_debug_line = 18;pug_debug_filename = "views\u002Fextensions_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = column.installed_version) ? "" : pug_interp)) + "\u003C\u002Fstrong\u003E";
;pug_debug_line = 19;pug_debug_filename = "views\u002Fextensions_tab.jade";
pug_html = pug_html + "\n            \u003Cbutton" + (pug.attr("exec", "uninstall('" + column.name + "')", true, false)) + "\u003E";
;pug_debug_line = 19;pug_debug_filename = "views\u002Fextensions_tab.jade";
pug_html = pug_html + "Uninstall\u003C\u002Fbutton\u003E";
}
else {
;pug_debug_line = 21;pug_debug_filename = "views\u002Fextensions_tab.jade";
pug_html = pug_html + "\n            \u003Cbutton" + (pug.attr("exec", "install('" + column.name + "')", true, false)) + "\u003E";
;pug_debug_line = 21;pug_debug_filename = "views\u002Fextensions_tab.jade";
pug_html = pug_html + "Install\u003C\u002Fbutton\u003E";
}
pug_html = pug_html + "\n          \u003C\u002Ftd\u003E";
;pug_debug_line = 22;pug_debug_filename = "views\u002Fextensions_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 22;pug_debug_filename = "views\u002Fextensions_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = column.comment) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E\n        \u003C\u002Ftr\u003E";
      }
  } else {
    var $$l = 0;
    for (var pug_index0 in $$obj) {
      $$l++;
      var column = $$obj[pug_index0];
;pug_debug_line = 13;pug_debug_filename = "views\u002Fextensions_tab.jade";
pug_html = pug_html + "\n        \u003Ctr\u003E";
;pug_debug_line = 14;pug_debug_filename = "views\u002Fextensions_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 14;pug_debug_filename = "views\u002Fextensions_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = column.name) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 15;pug_debug_filename = "views\u002Fextensions_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 15;pug_debug_filename = "views\u002Fextensions_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = column.default_version) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 16;pug_debug_filename = "views\u002Fextensions_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 17;pug_debug_filename = "views\u002Fextensions_tab.jade";
if (column.installed_version) {
;pug_debug_line = 18;pug_debug_filename = "views\u002Fextensions_tab.jade";
pug_html = pug_html + "\u003Cstrong\u003E";
;pug_debug_line = 18;pug_debug_filename = "views\u002Fextensions_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = column.installed_version) ? "" : pug_interp)) + "\u003C\u002Fstrong\u003E";
;pug_debug_line = 19;pug_debug_filename = "views\u002Fextensions_tab.jade";
pug_html = pug_html + "\n            \u003Cbutton" + (pug.attr("exec", "uninstall('" + column.name + "')", true, false)) + "\u003E";
;pug_debug_line = 19;pug_debug_filename = "views\u002Fextensions_tab.jade";
pug_html = pug_html + "Uninstall\u003C\u002Fbutton\u003E";
}
else {
;pug_debug_line = 21;pug_debug_filename = "views\u002Fextensions_tab.jade";
pug_html = pug_html + "\n            \u003Cbutton" + (pug.attr("exec", "install('" + column.name + "')", true, false)) + "\u003E";
;pug_debug_line = 21;pug_debug_filename = "views\u002Fextensions_tab.jade";
pug_html = pug_html + "Install\u003C\u002Fbutton\u003E";
}
pug_html = pug_html + "\n          \u003C\u002Ftd\u003E";
;pug_debug_line = 22;pug_debug_filename = "views\u002Fextensions_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 22;pug_debug_filename = "views\u002Fextensions_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = column.comment) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E\n        \u003C\u002Ftr\u003E";
    }
  }
}).call(this);

pug_html = pug_html + "\n      \u003C\u002Ftbody\u003E\n    \u003C\u002Ftable\u003E\n  \u003C\u002Fdiv\u003E\n\u003C\u002Fdiv\u003E";}.call(this,"rows" in locals_for_with?locals_for_with.rows:typeof rows!=="undefined"?rows:undefined));} catch (err) {pug.rethrow(err, pug_debug_filename, pug_debug_line, pug_debug_sources[pug_debug_filename]);};return pug_html;};
exports["extensions_tab"].content = ".rescol-wrapper\n  .rescol-header-wrapper\n  .rescol-content-wrapper\n    table\n      thead\n        tr\n          th Name\n          th Default Version\n          th Installed Version\n          th\n      tbody\n        each column in rows\n          tr\n            td= column.name\n            td= column.default_version\n            td\n              if column.installed_version\n                strong= column.installed_version\n                button(exec=\"uninstall('\" + column.name + \"')\") Uninstall\n              else\n                button(exec=\"install('\" + column.name + \"')\") Install\n            td= column.comment";
exports["history"] = function template(pug, locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {var pug_debug_sources = {"views\u002Fhistory.jade":".history-window\n  header\n    button.native-look.reload-btn Reload\n    button.native-look.clear-btn Clear\n  ul\n    each event in events\n      - console.log(event)\n      if event.type == \"sql.start\" && event.args[0].state != 'running'\n        - \u002F\u002F do nothing\n      else\n        li\n          time= timeFormat(new Date(event.time))\n          .event-info\n            if event.type == \"sql.start\" && event.args[0].state == 'running'\n              - var query = event.args[0]\n              strong Running\n              .sql.running\n                code.sql= \"SQL: \" + query.sql\n\n            else if event.type == \"sql.failed\"\n              - var query = event.args[0]\n              .sql.failed\n                code.sql= \"SQL: \" + query.sql\n                span.error= JSON.stringify(query.error, null, 2)\n                span.exec-time= \"(\" + execTime(query.time) + \")\"\n\n            else if event.type == \"sql.success\"\n              - var query = event.args[0]\n              .sql.success\n                code.sql= \"SQL: \" + query.sql\n                span.exec-time= \"(\" + execTime(query.time) + \")\"\n\n            else if event.type == \"connect.success\"\n              - var opts = event.args[1]\n              - console.log(event)\n              = \"Connected to server \"\n              if opts\n                code.sql\n                  = opts.user + (opts.password ? \":*\" : \"\") + \"@\" + opts.host + \":\" + opts.port\n                  if opts.database\n                    = \"\u002F\" + opts.database\n\n            else if event.type == \"connect.error\"\n              - var opts = event.args[1]\n              = \"Failed connect to server \"\n              code.sql\n                = opts.user + (opts.password ? \":*\" : \"\") + \"@\" + opts.host + \":\" + opts.port\n                if opts.database\n                  = \"\u002F\" + opts.database\n              span.error= event.args[2].message || event.args[2]\n\n            else if event.type == \"exec.start\"\n              strong Executing\n              .exec.start\n                code= event.args[0].command\n\n            else if event.type == \"exec.finish\"\n              strong Complete\n              .exec.finish\n                code= event.args[0].command\n                span.exec-time= \"(\" + execTime(event.args[0].time) + \")\"\n\n            else\n              .event\n                = \"~\"\n                = event.type\n                = \" \"\n                = JSON.stringify(event.args, null, 2)\n"};
;var locals_for_with = (locals || {});(function (Date, JSON, console, events, execTime, timeFormat) {var pug_indent = [];
;pug_debug_line = 1;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + "\n\u003Cdiv class=\"history-window\"\u003E";
;pug_debug_line = 2;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + "\n  \u003Cheader\u003E";
;pug_debug_line = 3;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + "\n    \u003Cbutton class=\"native-look reload-btn\"\u003E";
;pug_debug_line = 3;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + "Reload\u003C\u002Fbutton\u003E";
;pug_debug_line = 4;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + "\n    \u003Cbutton class=\"native-look clear-btn\"\u003E";
;pug_debug_line = 4;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + "Clear\u003C\u002Fbutton\u003E\n  \u003C\u002Fheader\u003E";
;pug_debug_line = 5;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + "\n  \u003Cul\u003E";
;pug_debug_line = 6;pug_debug_filename = "views\u002Fhistory.jade";
// iterate events
;(function(){
  var $$obj = events;
  if ('number' == typeof $$obj.length) {
      for (var pug_index0 = 0, $$l = $$obj.length; pug_index0 < $$l; pug_index0++) {
        var event = $$obj[pug_index0];
;pug_debug_line = 7;pug_debug_filename = "views\u002Fhistory.jade";
console.log(event)
;pug_debug_line = 8;pug_debug_filename = "views\u002Fhistory.jade";
if (event.type == "sql.start" && event.args[0].state != 'running') {
;pug_debug_line = 9;pug_debug_filename = "views\u002Fhistory.jade";
// do nothing
}
else {
;pug_debug_line = 11;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + "\n    \u003Cli\u003E";
;pug_debug_line = 12;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + "\n      \u003Ctime\u003E";
;pug_debug_line = 12;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = timeFormat(new Date(event.time))) ? "" : pug_interp)) + "\u003C\u002Ftime\u003E";
;pug_debug_line = 13;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + "\n      \u003Cdiv class=\"event-info\"\u003E";
;pug_debug_line = 14;pug_debug_filename = "views\u002Fhistory.jade";
if (event.type == "sql.start" && event.args[0].state == 'running') {
;pug_debug_line = 15;pug_debug_filename = "views\u002Fhistory.jade";
var query = event.args[0]
;pug_debug_line = 16;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + "\u003Cstrong\u003E";
;pug_debug_line = 16;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + "Running\u003C\u002Fstrong\u003E";
;pug_debug_line = 17;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + "\n        \u003Cdiv class=\"sql running\"\u003E";
;pug_debug_line = 18;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + "\u003Ccode class=\"sql\"\u003E";
;pug_debug_line = 18;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = "SQL: " + query.sql) ? "" : pug_interp)) + "\u003C\u002Fcode\u003E\u003C\u002Fdiv\u003E";
}
else
if (event.type == "sql.failed") {
;pug_debug_line = 21;pug_debug_filename = "views\u002Fhistory.jade";
var query = event.args[0]
;pug_debug_line = 22;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + "\n        \u003Cdiv class=\"sql failed\"\u003E";
;pug_debug_line = 23;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + "\u003Ccode class=\"sql\"\u003E";
;pug_debug_line = 23;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = "SQL: " + query.sql) ? "" : pug_interp)) + "\u003C\u002Fcode\u003E";
;pug_debug_line = 24;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + "\u003Cspan class=\"error\"\u003E";
;pug_debug_line = 24;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = JSON.stringify(query.error, null, 2)) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E";
;pug_debug_line = 25;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + "\u003Cspan class=\"exec-time\"\u003E";
;pug_debug_line = 25;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = "(" + execTime(query.time) + ")") ? "" : pug_interp)) + "\u003C\u002Fspan\u003E\u003C\u002Fdiv\u003E";
}
else
if (event.type == "sql.success") {
;pug_debug_line = 28;pug_debug_filename = "views\u002Fhistory.jade";
var query = event.args[0]
;pug_debug_line = 29;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + "\n        \u003Cdiv class=\"sql success\"\u003E";
;pug_debug_line = 30;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + "\u003Ccode class=\"sql\"\u003E";
;pug_debug_line = 30;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = "SQL: " + query.sql) ? "" : pug_interp)) + "\u003C\u002Fcode\u003E";
;pug_debug_line = 31;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + "\u003Cspan class=\"exec-time\"\u003E";
;pug_debug_line = 31;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = "(" + execTime(query.time) + ")") ? "" : pug_interp)) + "\u003C\u002Fspan\u003E\u003C\u002Fdiv\u003E";
}
else
if (event.type == "connect.success") {
;pug_debug_line = 34;pug_debug_filename = "views\u002Fhistory.jade";
var opts = event.args[1]
;pug_debug_line = 35;pug_debug_filename = "views\u002Fhistory.jade";
console.log(event)
;pug_debug_line = 36;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = "Connected to server ") ? "" : pug_interp));
;pug_debug_line = 37;pug_debug_filename = "views\u002Fhistory.jade";
if (opts) {
;pug_debug_line = 38;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + "\u003Ccode class=\"sql\"\u003E";
;pug_debug_line = 39;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = opts.user + (opts.password ? ":*" : "") + "@" + opts.host + ":" + opts.port) ? "" : pug_interp));
;pug_debug_line = 40;pug_debug_filename = "views\u002Fhistory.jade";
if (opts.database) {
;pug_debug_line = 41;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = "/" + opts.database) ? "" : pug_interp));
}
pug_html = pug_html + "\u003C\u002Fcode\u003E";
}
}
else
if (event.type == "connect.error") {
;pug_debug_line = 44;pug_debug_filename = "views\u002Fhistory.jade";
var opts = event.args[1]
;pug_debug_line = 45;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = "Failed connect to server ") ? "" : pug_interp));
;pug_debug_line = 46;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + "\u003Ccode class=\"sql\"\u003E";
;pug_debug_line = 47;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = opts.user + (opts.password ? ":*" : "") + "@" + opts.host + ":" + opts.port) ? "" : pug_interp));
;pug_debug_line = 48;pug_debug_filename = "views\u002Fhistory.jade";
if (opts.database) {
;pug_debug_line = 49;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = "/" + opts.database) ? "" : pug_interp));
}
pug_html = pug_html + "\u003C\u002Fcode\u003E";
;pug_debug_line = 50;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + "\u003Cspan class=\"error\"\u003E";
;pug_debug_line = 50;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = event.args[2].message || event.args[2]) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E";
}
else
if (event.type == "exec.start") {
;pug_debug_line = 53;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + "\u003Cstrong\u003E";
;pug_debug_line = 53;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + "Executing\u003C\u002Fstrong\u003E";
;pug_debug_line = 54;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + "\n        \u003Cdiv class=\"exec start\"\u003E";
;pug_debug_line = 55;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + "\u003Ccode\u003E";
;pug_debug_line = 55;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = event.args[0].command) ? "" : pug_interp)) + "\u003C\u002Fcode\u003E\u003C\u002Fdiv\u003E";
}
else
if (event.type == "exec.finish") {
;pug_debug_line = 58;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + "\u003Cstrong\u003E";
;pug_debug_line = 58;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + "Complete\u003C\u002Fstrong\u003E";
;pug_debug_line = 59;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + "\n        \u003Cdiv class=\"exec finish\"\u003E";
;pug_debug_line = 60;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + "\u003Ccode\u003E";
;pug_debug_line = 60;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = event.args[0].command) ? "" : pug_interp)) + "\u003C\u002Fcode\u003E";
;pug_debug_line = 61;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + "\u003Cspan class=\"exec-time\"\u003E";
;pug_debug_line = 61;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = "(" + execTime(event.args[0].time) + ")") ? "" : pug_interp)) + "\u003C\u002Fspan\u003E\u003C\u002Fdiv\u003E";
}
else {
;pug_debug_line = 64;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + "\n        \u003Cdiv class=\"event\"\u003E";
;pug_debug_line = 65;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = "~") ? "" : pug_interp));
;pug_debug_line = 66;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = event.type) ? "" : pug_interp));
;pug_debug_line = 67;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = " ") ? "" : pug_interp));
;pug_debug_line = 68;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = JSON.stringify(event.args, null, 2)) ? "" : pug_interp)) + "\n        \u003C\u002Fdiv\u003E";
}
pug_html = pug_html + "\n      \u003C\u002Fdiv\u003E\n    \u003C\u002Fli\u003E";
}
      }
  } else {
    var $$l = 0;
    for (var pug_index0 in $$obj) {
      $$l++;
      var event = $$obj[pug_index0];
;pug_debug_line = 7;pug_debug_filename = "views\u002Fhistory.jade";
console.log(event)
;pug_debug_line = 8;pug_debug_filename = "views\u002Fhistory.jade";
if (event.type == "sql.start" && event.args[0].state != 'running') {
;pug_debug_line = 9;pug_debug_filename = "views\u002Fhistory.jade";
// do nothing
}
else {
;pug_debug_line = 11;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + "\n    \u003Cli\u003E";
;pug_debug_line = 12;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + "\n      \u003Ctime\u003E";
;pug_debug_line = 12;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = timeFormat(new Date(event.time))) ? "" : pug_interp)) + "\u003C\u002Ftime\u003E";
;pug_debug_line = 13;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + "\n      \u003Cdiv class=\"event-info\"\u003E";
;pug_debug_line = 14;pug_debug_filename = "views\u002Fhistory.jade";
if (event.type == "sql.start" && event.args[0].state == 'running') {
;pug_debug_line = 15;pug_debug_filename = "views\u002Fhistory.jade";
var query = event.args[0]
;pug_debug_line = 16;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + "\u003Cstrong\u003E";
;pug_debug_line = 16;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + "Running\u003C\u002Fstrong\u003E";
;pug_debug_line = 17;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + "\n        \u003Cdiv class=\"sql running\"\u003E";
;pug_debug_line = 18;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + "\u003Ccode class=\"sql\"\u003E";
;pug_debug_line = 18;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = "SQL: " + query.sql) ? "" : pug_interp)) + "\u003C\u002Fcode\u003E\u003C\u002Fdiv\u003E";
}
else
if (event.type == "sql.failed") {
;pug_debug_line = 21;pug_debug_filename = "views\u002Fhistory.jade";
var query = event.args[0]
;pug_debug_line = 22;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + "\n        \u003Cdiv class=\"sql failed\"\u003E";
;pug_debug_line = 23;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + "\u003Ccode class=\"sql\"\u003E";
;pug_debug_line = 23;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = "SQL: " + query.sql) ? "" : pug_interp)) + "\u003C\u002Fcode\u003E";
;pug_debug_line = 24;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + "\u003Cspan class=\"error\"\u003E";
;pug_debug_line = 24;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = JSON.stringify(query.error, null, 2)) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E";
;pug_debug_line = 25;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + "\u003Cspan class=\"exec-time\"\u003E";
;pug_debug_line = 25;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = "(" + execTime(query.time) + ")") ? "" : pug_interp)) + "\u003C\u002Fspan\u003E\u003C\u002Fdiv\u003E";
}
else
if (event.type == "sql.success") {
;pug_debug_line = 28;pug_debug_filename = "views\u002Fhistory.jade";
var query = event.args[0]
;pug_debug_line = 29;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + "\n        \u003Cdiv class=\"sql success\"\u003E";
;pug_debug_line = 30;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + "\u003Ccode class=\"sql\"\u003E";
;pug_debug_line = 30;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = "SQL: " + query.sql) ? "" : pug_interp)) + "\u003C\u002Fcode\u003E";
;pug_debug_line = 31;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + "\u003Cspan class=\"exec-time\"\u003E";
;pug_debug_line = 31;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = "(" + execTime(query.time) + ")") ? "" : pug_interp)) + "\u003C\u002Fspan\u003E\u003C\u002Fdiv\u003E";
}
else
if (event.type == "connect.success") {
;pug_debug_line = 34;pug_debug_filename = "views\u002Fhistory.jade";
var opts = event.args[1]
;pug_debug_line = 35;pug_debug_filename = "views\u002Fhistory.jade";
console.log(event)
;pug_debug_line = 36;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = "Connected to server ") ? "" : pug_interp));
;pug_debug_line = 37;pug_debug_filename = "views\u002Fhistory.jade";
if (opts) {
;pug_debug_line = 38;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + "\u003Ccode class=\"sql\"\u003E";
;pug_debug_line = 39;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = opts.user + (opts.password ? ":*" : "") + "@" + opts.host + ":" + opts.port) ? "" : pug_interp));
;pug_debug_line = 40;pug_debug_filename = "views\u002Fhistory.jade";
if (opts.database) {
;pug_debug_line = 41;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = "/" + opts.database) ? "" : pug_interp));
}
pug_html = pug_html + "\u003C\u002Fcode\u003E";
}
}
else
if (event.type == "connect.error") {
;pug_debug_line = 44;pug_debug_filename = "views\u002Fhistory.jade";
var opts = event.args[1]
;pug_debug_line = 45;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = "Failed connect to server ") ? "" : pug_interp));
;pug_debug_line = 46;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + "\u003Ccode class=\"sql\"\u003E";
;pug_debug_line = 47;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = opts.user + (opts.password ? ":*" : "") + "@" + opts.host + ":" + opts.port) ? "" : pug_interp));
;pug_debug_line = 48;pug_debug_filename = "views\u002Fhistory.jade";
if (opts.database) {
;pug_debug_line = 49;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = "/" + opts.database) ? "" : pug_interp));
}
pug_html = pug_html + "\u003C\u002Fcode\u003E";
;pug_debug_line = 50;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + "\u003Cspan class=\"error\"\u003E";
;pug_debug_line = 50;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = event.args[2].message || event.args[2]) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E";
}
else
if (event.type == "exec.start") {
;pug_debug_line = 53;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + "\u003Cstrong\u003E";
;pug_debug_line = 53;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + "Executing\u003C\u002Fstrong\u003E";
;pug_debug_line = 54;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + "\n        \u003Cdiv class=\"exec start\"\u003E";
;pug_debug_line = 55;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + "\u003Ccode\u003E";
;pug_debug_line = 55;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = event.args[0].command) ? "" : pug_interp)) + "\u003C\u002Fcode\u003E\u003C\u002Fdiv\u003E";
}
else
if (event.type == "exec.finish") {
;pug_debug_line = 58;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + "\u003Cstrong\u003E";
;pug_debug_line = 58;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + "Complete\u003C\u002Fstrong\u003E";
;pug_debug_line = 59;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + "\n        \u003Cdiv class=\"exec finish\"\u003E";
;pug_debug_line = 60;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + "\u003Ccode\u003E";
;pug_debug_line = 60;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = event.args[0].command) ? "" : pug_interp)) + "\u003C\u002Fcode\u003E";
;pug_debug_line = 61;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + "\u003Cspan class=\"exec-time\"\u003E";
;pug_debug_line = 61;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = "(" + execTime(event.args[0].time) + ")") ? "" : pug_interp)) + "\u003C\u002Fspan\u003E\u003C\u002Fdiv\u003E";
}
else {
;pug_debug_line = 64;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + "\n        \u003Cdiv class=\"event\"\u003E";
;pug_debug_line = 65;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = "~") ? "" : pug_interp));
;pug_debug_line = 66;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = event.type) ? "" : pug_interp));
;pug_debug_line = 67;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = " ") ? "" : pug_interp));
;pug_debug_line = 68;pug_debug_filename = "views\u002Fhistory.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = JSON.stringify(event.args, null, 2)) ? "" : pug_interp)) + "\n        \u003C\u002Fdiv\u003E";
}
pug_html = pug_html + "\n      \u003C\u002Fdiv\u003E\n    \u003C\u002Fli\u003E";
}
    }
  }
}).call(this);

pug_html = pug_html + "\n  \u003C\u002Ful\u003E\n\u003C\u002Fdiv\u003E";}.call(this,"Date" in locals_for_with?locals_for_with.Date:typeof Date!=="undefined"?Date:undefined,"JSON" in locals_for_with?locals_for_with.JSON:typeof JSON!=="undefined"?JSON:undefined,"console" in locals_for_with?locals_for_with.console:typeof console!=="undefined"?console:undefined,"events" in locals_for_with?locals_for_with.events:typeof events!=="undefined"?events:undefined,"execTime" in locals_for_with?locals_for_with.execTime:typeof execTime!=="undefined"?execTime:undefined,"timeFormat" in locals_for_with?locals_for_with.timeFormat:typeof timeFormat!=="undefined"?timeFormat:undefined));} catch (err) {pug.rethrow(err, pug_debug_filename, pug_debug_line, pug_debug_sources[pug_debug_filename]);};return pug_html;};
exports["history"].content = ".history-window\n  header\n    button.native-look.reload-btn Reload\n    button.native-look.clear-btn Clear\n  ul\n    each event in events\n      - console.log(event)\n      if event.type == \"sql.start\" && event.args[0].state != 'running'\n        - // do nothing\n      else\n        li\n          time= timeFormat(new Date(event.time))\n          .event-info\n            if event.type == \"sql.start\" && event.args[0].state == 'running'\n              - var query = event.args[0]\n              strong Running\n              .sql.running\n                code.sql= \"SQL: \" + query.sql\n\n            else if event.type == \"sql.failed\"\n              - var query = event.args[0]\n              .sql.failed\n                code.sql= \"SQL: \" + query.sql\n                span.error= JSON.stringify(query.error, null, 2)\n                span.exec-time= \"(\" + execTime(query.time) + \")\"\n\n            else if event.type == \"sql.success\"\n              - var query = event.args[0]\n              .sql.success\n                code.sql= \"SQL: \" + query.sql\n                span.exec-time= \"(\" + execTime(query.time) + \")\"\n\n            else if event.type == \"connect.success\"\n              - var opts = event.args[1]\n              - console.log(event)\n              = \"Connected to server \"\n              if opts\n                code.sql\n                  = opts.user + (opts.password ? \":*\" : \"\") + \"@\" + opts.host + \":\" + opts.port\n                  if opts.database\n                    = \"/\" + opts.database\n\n            else if event.type == \"connect.error\"\n              - var opts = event.args[1]\n              = \"Failed connect to server \"\n              code.sql\n                = opts.user + (opts.password ? \":*\" : \"\") + \"@\" + opts.host + \":\" + opts.port\n                if opts.database\n                  = \"/\" + opts.database\n              span.error= event.args[2].message || event.args[2]\n\n            else if event.type == \"exec.start\"\n              strong Executing\n              .exec.start\n                code= event.args[0].command\n\n            else if event.type == \"exec.finish\"\n              strong Complete\n              .exec.finish\n                code= event.args[0].command\n                span.exec-time= \"(\" + execTime(event.args[0].time) + \")\"\n\n            else\n              .event\n                = \"~\"\n                = event.type\n                = \" \"\n                = JSON.stringify(event.args, null, 2)\n";
exports["info_tab"] = function template(pug, locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {var pug_debug_sources = {"views\u002Finfo_tab.jade":".summary\n  p\n    = \"Type: \"\n    strong= relType\n  p\n    = \"Estimate rows count: \"\n    = recordsCount\n  p\n    = \"Size on disk: \"\n    = tableSize\n\nh4 Source SQL\n\ncode.result.sql\n  = code"};
;var locals_for_with = (locals || {});(function (code, recordsCount, relType, tableSize) {var pug_indent = [];
;pug_debug_line = 1;pug_debug_filename = "views\u002Finfo_tab.jade";
pug_html = pug_html + "\n\u003Cdiv class=\"summary\"\u003E";
;pug_debug_line = 2;pug_debug_filename = "views\u002Finfo_tab.jade";
pug_html = pug_html + "\n  \u003Cp\u003E";
;pug_debug_line = 3;pug_debug_filename = "views\u002Finfo_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = "Type: ") ? "" : pug_interp));
;pug_debug_line = 4;pug_debug_filename = "views\u002Finfo_tab.jade";
pug_html = pug_html + "\u003Cstrong\u003E";
;pug_debug_line = 4;pug_debug_filename = "views\u002Finfo_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = relType) ? "" : pug_interp)) + "\u003C\u002Fstrong\u003E\n  \u003C\u002Fp\u003E";
;pug_debug_line = 5;pug_debug_filename = "views\u002Finfo_tab.jade";
pug_html = pug_html + "\n  \u003Cp\u003E";
;pug_debug_line = 6;pug_debug_filename = "views\u002Finfo_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = "Estimate rows count: ") ? "" : pug_interp));
;pug_debug_line = 7;pug_debug_filename = "views\u002Finfo_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = recordsCount) ? "" : pug_interp)) + "\n  \u003C\u002Fp\u003E";
;pug_debug_line = 8;pug_debug_filename = "views\u002Finfo_tab.jade";
pug_html = pug_html + "\n  \u003Cp\u003E";
;pug_debug_line = 9;pug_debug_filename = "views\u002Finfo_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = "Size on disk: ") ? "" : pug_interp));
;pug_debug_line = 10;pug_debug_filename = "views\u002Finfo_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = tableSize) ? "" : pug_interp)) + "\n  \u003C\u002Fp\u003E\n\u003C\u002Fdiv\u003E";
;pug_debug_line = 12;pug_debug_filename = "views\u002Finfo_tab.jade";
pug_html = pug_html + "\n\u003Ch4\u003E";
;pug_debug_line = 12;pug_debug_filename = "views\u002Finfo_tab.jade";
pug_html = pug_html + "Source SQL\u003C\u002Fh4\u003E";
;pug_debug_line = 14;pug_debug_filename = "views\u002Finfo_tab.jade";
pug_html = pug_html + "\u003Ccode class=\"result sql\"\u003E";
;pug_debug_line = 15;pug_debug_filename = "views\u002Finfo_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = code) ? "" : pug_interp)) + "\u003C\u002Fcode\u003E";}.call(this,"code" in locals_for_with?locals_for_with.code:typeof code!=="undefined"?code:undefined,"recordsCount" in locals_for_with?locals_for_with.recordsCount:typeof recordsCount!=="undefined"?recordsCount:undefined,"relType" in locals_for_with?locals_for_with.relType:typeof relType!=="undefined"?relType:undefined,"tableSize" in locals_for_with?locals_for_with.tableSize:typeof tableSize!=="undefined"?tableSize:undefined));} catch (err) {pug.rethrow(err, pug_debug_filename, pug_debug_line, pug_debug_sources[pug_debug_filename]);};return pug_html;};
exports["info_tab"].content = ".summary\n  p\n    = \"Type: \"\n    strong= relType\n  p\n    = \"Estimate rows count: \"\n    = recordsCount\n  p\n    = \"Size on disk: \"\n    = tableSize\n\nh4 Source SQL\n\ncode.result.sql\n  = code";
exports["login_screen"] = function template(pug, locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {var pug_debug_sources = {"views\u002Flogin_screen.jade":".home-screen\n  .sidebar\n    h4 Saved connections\n    ul.connections\n    button.add-connection.native-look(exec=\"addNewConnection\") Add\n\n  .main-window\n    form.middle-window.plain\n      p\n        label(for=\"login_host\") Host\n        input#login_host(name='host', type='text', value='localhost', placeholder='localhost')\n      p\n        label(for=\"login_port\") Port\n        input#login_port(name='port', type='text', value='5432', placeholder='5432')\n      p\n        label(for=\"login_username\") Username\n        input#login_username(name='user', type='text', value='')\n      p\n        label(for=\"login_password\") Password\n        input#login_password(name='password', type='password', value='')\n\n      p\n        label(for=\"login_database\") Database\n        input#login_database(name='database', type='text', value='')\n\n      input(name=\"query\", type=\"hidden\")\n\n      p.buttons\n        button.native-look(exec=\"testConnection\") Test connection\n        button.native-look(exec=\"saveAndConnect\") Save & connect\n        input.native-look(type=\"submit\", value=\"Connect\", autofocus=true)\n\n    .middle-window.heroku-1\n      h5 Heroku login\n\n      p!= link_to(\"Access with OAuth\", '#', {exec: 'startHerokuOAuth'})\n      - \u002F\u002Fp!= link_to('Access with \"$ heroku\" command line tool', '#')\n\n    .middle-window.heroku-oauth\n      ul.steps\n        li.access-token Grand access\n        li.request-token Request Token\n        li.get-apps Get applications list\n      ul.apps\n      ul.steps\n        li.database-url Database URL\n        li.connect-db Connect to DB\n\n    .middle-window.heroku-cl\n      ul\n        li Detect command line utilite\n        li Get applications list\n\n    footer\n      != link_to(\"Login with heroku\", '#', {exec: 'showHerokuPane1', class: 'login-with-heroku'})\n      != link_to(\"Login with password\", '#', {exec: 'showPlainPane', class: 'login-with-password'})\n      br\n      a.go-to-help Get Postgres\n"};
;var locals_for_with = (locals || {});(function (link_to) {var pug_indent = [];
;pug_debug_line = 1;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + "\n\u003Cdiv class=\"home-screen\"\u003E";
;pug_debug_line = 2;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + "\n  \u003Cdiv class=\"sidebar\"\u003E";
;pug_debug_line = 3;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + "\n    \u003Ch4\u003E";
;pug_debug_line = 3;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + "Saved connections\u003C\u002Fh4\u003E";
;pug_debug_line = 4;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + "\n    \u003Cul class=\"connections\"\u003E\u003C\u002Ful\u003E";
;pug_debug_line = 5;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + "\n    \u003Cbutton class=\"add-connection native-look\" exec=\"addNewConnection\"\u003E";
;pug_debug_line = 5;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + "Add\u003C\u002Fbutton\u003E\n  \u003C\u002Fdiv\u003E";
;pug_debug_line = 7;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + "\n  \u003Cdiv class=\"main-window\"\u003E";
;pug_debug_line = 8;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + "\n    \u003Cform class=\"middle-window plain\"\u003E";
;pug_debug_line = 9;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + "\n      \u003Cp\u003E";
;pug_debug_line = 10;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + "\n        \u003Clabel for=\"login_host\"\u003E";
;pug_debug_line = 10;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + "Host\u003C\u002Flabel\u003E";
;pug_debug_line = 11;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + "\n        \u003Cinput id=\"login_host\" name=\"host\" type=\"text\" value=\"localhost\" placeholder=\"localhost\"\u002F\u003E\n      \u003C\u002Fp\u003E";
;pug_debug_line = 12;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + "\n      \u003Cp\u003E";
;pug_debug_line = 13;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + "\n        \u003Clabel for=\"login_port\"\u003E";
;pug_debug_line = 13;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + "Port\u003C\u002Flabel\u003E";
;pug_debug_line = 14;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + "\n        \u003Cinput id=\"login_port\" name=\"port\" type=\"text\" value=\"5432\" placeholder=\"5432\"\u002F\u003E\n      \u003C\u002Fp\u003E";
;pug_debug_line = 15;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + "\n      \u003Cp\u003E";
;pug_debug_line = 16;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + "\n        \u003Clabel for=\"login_username\"\u003E";
;pug_debug_line = 16;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + "Username\u003C\u002Flabel\u003E";
;pug_debug_line = 17;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + "\n        \u003Cinput id=\"login_username\" name=\"user\" type=\"text\" value=\"\"\u002F\u003E\n      \u003C\u002Fp\u003E";
;pug_debug_line = 18;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + "\n      \u003Cp\u003E";
;pug_debug_line = 19;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + "\n        \u003Clabel for=\"login_password\"\u003E";
;pug_debug_line = 19;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + "Password\u003C\u002Flabel\u003E";
;pug_debug_line = 20;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + "\n        \u003Cinput id=\"login_password\" name=\"password\" type=\"password\" value=\"\"\u002F\u003E\n      \u003C\u002Fp\u003E";
;pug_debug_line = 22;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + "\n      \u003Cp\u003E";
;pug_debug_line = 23;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + "\n        \u003Clabel for=\"login_database\"\u003E";
;pug_debug_line = 23;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + "Database\u003C\u002Flabel\u003E";
;pug_debug_line = 24;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + "\n        \u003Cinput id=\"login_database\" name=\"database\" type=\"text\" value=\"\"\u002F\u003E\n      \u003C\u002Fp\u003E";
;pug_debug_line = 26;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + "\n      \u003Cinput name=\"query\" type=\"hidden\"\u002F\u003E";
;pug_debug_line = 28;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + "\n      \u003Cp class=\"buttons\"\u003E";
;pug_debug_line = 29;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + "\n        \u003Cbutton class=\"native-look\" exec=\"testConnection\"\u003E";
;pug_debug_line = 29;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + "Test connection\u003C\u002Fbutton\u003E";
;pug_debug_line = 30;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + "\n        \u003Cbutton class=\"native-look\" exec=\"saveAndConnect\"\u003E";
;pug_debug_line = 30;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + "Save & connect\u003C\u002Fbutton\u003E";
;pug_debug_line = 31;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + "\n        \u003Cinput class=\"native-look\" type=\"submit\" value=\"Connect\" autofocus=\"autofocus\"\u002F\u003E\n      \u003C\u002Fp\u003E\n    \u003C\u002Fform\u003E";
;pug_debug_line = 33;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + "\n    \u003Cdiv class=\"middle-window heroku-1\"\u003E";
;pug_debug_line = 34;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + "\n      \u003Ch5\u003E";
;pug_debug_line = 34;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + "Heroku login\u003C\u002Fh5\u003E";
;pug_debug_line = 36;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + "\n      \u003Cp\u003E";
;pug_debug_line = 36;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + (null == (pug_interp = link_to("Access with OAuth", '#', {exec: 'startHerokuOAuth'})) ? "" : pug_interp) + "\u003C\u002Fp\u003E";
;pug_debug_line = 37;pug_debug_filename = "views\u002Flogin_screen.jade";
//p!= link_to('Access with "$ heroku" command line tool', '#')
pug_html = pug_html + "\n    \u003C\u002Fdiv\u003E";
;pug_debug_line = 39;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + "\n    \u003Cdiv class=\"middle-window heroku-oauth\"\u003E";
;pug_debug_line = 40;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + "\n      \u003Cul class=\"steps\"\u003E";
;pug_debug_line = 41;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + "\n        \u003Cli class=\"access-token\"\u003E";
;pug_debug_line = 41;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + "Grand access\u003C\u002Fli\u003E";
;pug_debug_line = 42;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + "\n        \u003Cli class=\"request-token\"\u003E";
;pug_debug_line = 42;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + "Request Token\u003C\u002Fli\u003E";
;pug_debug_line = 43;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + "\n        \u003Cli class=\"get-apps\"\u003E";
;pug_debug_line = 43;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + "Get applications list\u003C\u002Fli\u003E\n      \u003C\u002Ful\u003E";
;pug_debug_line = 44;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + "\n      \u003Cul class=\"apps\"\u003E\u003C\u002Ful\u003E";
;pug_debug_line = 45;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + "\n      \u003Cul class=\"steps\"\u003E";
;pug_debug_line = 46;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + "\n        \u003Cli class=\"database-url\"\u003E";
;pug_debug_line = 46;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + "Database URL\u003C\u002Fli\u003E";
;pug_debug_line = 47;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + "\n        \u003Cli class=\"connect-db\"\u003E";
;pug_debug_line = 47;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + "Connect to DB\u003C\u002Fli\u003E\n      \u003C\u002Ful\u003E\n    \u003C\u002Fdiv\u003E";
;pug_debug_line = 49;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + "\n    \u003Cdiv class=\"middle-window heroku-cl\"\u003E";
;pug_debug_line = 50;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + "\n      \u003Cul\u003E";
;pug_debug_line = 51;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + "\n        \u003Cli\u003E";
;pug_debug_line = 51;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + "Detect command line utilite\u003C\u002Fli\u003E";
;pug_debug_line = 52;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + "\n        \u003Cli\u003E";
;pug_debug_line = 52;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + "Get applications list\u003C\u002Fli\u003E\n      \u003C\u002Ful\u003E\n    \u003C\u002Fdiv\u003E";
;pug_debug_line = 54;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + "\n    \u003Cfooter\u003E";
;pug_debug_line = 55;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + (null == (pug_interp = link_to("Login with heroku", '#', {exec: 'showHerokuPane1', class: 'login-with-heroku'})) ? "" : pug_interp);
;pug_debug_line = 56;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + (null == (pug_interp = link_to("Login with password", '#', {exec: 'showPlainPane', class: 'login-with-password'})) ? "" : pug_interp);
;pug_debug_line = 57;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + "\u003Cbr\u002F\u003E";
;pug_debug_line = 58;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + "\u003Ca class=\"go-to-help\"\u003E";
;pug_debug_line = 58;pug_debug_filename = "views\u002Flogin_screen.jade";
pug_html = pug_html + "Get Postgres\u003C\u002Fa\u003E\n    \u003C\u002Ffooter\u003E\n  \u003C\u002Fdiv\u003E\n\u003C\u002Fdiv\u003E";}.call(this,"link_to" in locals_for_with?locals_for_with.link_to:typeof link_to!=="undefined"?link_to:undefined));} catch (err) {pug.rethrow(err, pug_debug_filename, pug_debug_line, pug_debug_sources[pug_debug_filename]);};return pug_html;};
exports["login_screen"].content = ".home-screen\n  .sidebar\n    h4 Saved connections\n    ul.connections\n    button.add-connection.native-look(exec=\"addNewConnection\") Add\n\n  .main-window\n    form.middle-window.plain\n      p\n        label(for=\"login_host\") Host\n        input#login_host(name='host', type='text', value='localhost', placeholder='localhost')\n      p\n        label(for=\"login_port\") Port\n        input#login_port(name='port', type='text', value='5432', placeholder='5432')\n      p\n        label(for=\"login_username\") Username\n        input#login_username(name='user', type='text', value='')\n      p\n        label(for=\"login_password\") Password\n        input#login_password(name='password', type='password', value='')\n\n      p\n        label(for=\"login_database\") Database\n        input#login_database(name='database', type='text', value='')\n\n      input(name=\"query\", type=\"hidden\")\n\n      p.buttons\n        button.native-look(exec=\"testConnection\") Test connection\n        button.native-look(exec=\"saveAndConnect\") Save & connect\n        input.native-look(type=\"submit\", value=\"Connect\", autofocus=true)\n\n    .middle-window.heroku-1\n      h5 Heroku login\n\n      p!= link_to(\"Access with OAuth\", '#', {exec: 'startHerokuOAuth'})\n      - //p!= link_to('Access with \"$ heroku\" command line tool', '#')\n\n    .middle-window.heroku-oauth\n      ul.steps\n        li.access-token Grand access\n        li.request-token Request Token\n        li.get-apps Get applications list\n      ul.apps\n      ul.steps\n        li.database-url Database URL\n        li.connect-db Connect to DB\n\n    .middle-window.heroku-cl\n      ul\n        li Detect command line utilite\n        li Get applications list\n\n    footer\n      != link_to(\"Login with heroku\", '#', {exec: 'showHerokuPane1', class: 'login-with-heroku'})\n      != link_to(\"Login with password\", '#', {exec: 'showPlainPane', class: 'login-with-password'})\n      br\n      a.go-to-help Get Postgres\n";
exports["main"] = function template(pug, locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {var pug_debug_sources = {"views\u002Fmain.jade":".main-screen\n  .sidebar\n    .databases\n      label Select database\n      select\n        option Select database...\n    .tables.without-system-tables\n      ul\n      .show-system-tables\n        label\n          input(type=\"checkbox\")\n          = \"Show Schemas\"\n\n    ul.extras\n      li.reload\n        a.reloadStructure!= icon('reload', 'Reload Tables')\n      li.add-table\n        a.addTable!= icon('add-table', 'Add Table')\n      li.users(tab='users')!= icon('users', 'Users')\n      li.extensions(tab='extensions')!= icon('extensions', \"Postgres Extensions\")\n      li.procedures(tab='procedures')!= icon('procedures', \"Procedures\")\n    .resize-handler\n  .main\n    .window-tabs\n      .window-tab.tab.structure(tab='structure') Structure\n      .window-tab.tab.content(tab='content') Content\n      .window-tab.tab.info(tab='info') Info\n      .window-tab.tab.query(tab='query') Query\n      \u002F\u002F.tab.triggers(tab='triggers') Triggers\n    .clearfix\n\n    .window-content.structure\n    .window-content.content\n    .window-content.info\n    .window-content.query\n    .window-content.triggers\n    .window-content.users\n    .window-content.extensions\n    .window-content.procedures"};
;var locals_for_with = (locals || {});(function (icon) {var pug_indent = [];
;pug_debug_line = 1;pug_debug_filename = "views\u002Fmain.jade";
pug_html = pug_html + "\n\u003Cdiv class=\"main-screen\"\u003E";
;pug_debug_line = 2;pug_debug_filename = "views\u002Fmain.jade";
pug_html = pug_html + "\n  \u003Cdiv class=\"sidebar\"\u003E";
;pug_debug_line = 3;pug_debug_filename = "views\u002Fmain.jade";
pug_html = pug_html + "\n    \u003Cdiv class=\"databases\"\u003E";
;pug_debug_line = 4;pug_debug_filename = "views\u002Fmain.jade";
pug_html = pug_html + "\n      \u003Clabel\u003E";
;pug_debug_line = 4;pug_debug_filename = "views\u002Fmain.jade";
pug_html = pug_html + "Select database\u003C\u002Flabel\u003E";
;pug_debug_line = 5;pug_debug_filename = "views\u002Fmain.jade";
pug_html = pug_html + "\n      \u003Cselect\u003E";
;pug_debug_line = 6;pug_debug_filename = "views\u002Fmain.jade";
pug_html = pug_html + "\n        \u003Coption\u003E";
;pug_debug_line = 6;pug_debug_filename = "views\u002Fmain.jade";
pug_html = pug_html + "Select database...\u003C\u002Foption\u003E\n      \u003C\u002Fselect\u003E\n    \u003C\u002Fdiv\u003E";
;pug_debug_line = 7;pug_debug_filename = "views\u002Fmain.jade";
pug_html = pug_html + "\n    \u003Cdiv class=\"tables without-system-tables\"\u003E";
;pug_debug_line = 8;pug_debug_filename = "views\u002Fmain.jade";
pug_html = pug_html + "\n      \u003Cul\u003E\u003C\u002Ful\u003E";
;pug_debug_line = 9;pug_debug_filename = "views\u002Fmain.jade";
pug_html = pug_html + "\n      \u003Cdiv class=\"show-system-tables\"\u003E";
;pug_debug_line = 10;pug_debug_filename = "views\u002Fmain.jade";
pug_html = pug_html + "\n        \u003Clabel\u003E";
;pug_debug_line = 11;pug_debug_filename = "views\u002Fmain.jade";
pug_html = pug_html + "\n          \u003Cinput type=\"checkbox\"\u002F\u003E";
;pug_debug_line = 12;pug_debug_filename = "views\u002Fmain.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = "Show Schemas") ? "" : pug_interp)) + "\n        \u003C\u002Flabel\u003E\n      \u003C\u002Fdiv\u003E\n    \u003C\u002Fdiv\u003E";
;pug_debug_line = 14;pug_debug_filename = "views\u002Fmain.jade";
pug_html = pug_html + "\n    \u003Cul class=\"extras\"\u003E";
;pug_debug_line = 15;pug_debug_filename = "views\u002Fmain.jade";
pug_html = pug_html + "\n      \u003Cli class=\"reload\"\u003E";
;pug_debug_line = 16;pug_debug_filename = "views\u002Fmain.jade";
pug_html = pug_html + "\u003Ca class=\"reloadStructure\"\u003E";
;pug_debug_line = 16;pug_debug_filename = "views\u002Fmain.jade";
pug_html = pug_html + (null == (pug_interp = icon('reload', 'Reload Tables')) ? "" : pug_interp) + "\u003C\u002Fa\u003E\u003C\u002Fli\u003E";
;pug_debug_line = 17;pug_debug_filename = "views\u002Fmain.jade";
pug_html = pug_html + "\n      \u003Cli class=\"add-table\"\u003E";
;pug_debug_line = 18;pug_debug_filename = "views\u002Fmain.jade";
pug_html = pug_html + "\u003Ca class=\"addTable\"\u003E";
;pug_debug_line = 18;pug_debug_filename = "views\u002Fmain.jade";
pug_html = pug_html + (null == (pug_interp = icon('add-table', 'Add Table')) ? "" : pug_interp) + "\u003C\u002Fa\u003E\u003C\u002Fli\u003E";
;pug_debug_line = 19;pug_debug_filename = "views\u002Fmain.jade";
pug_html = pug_html + "\n      \u003Cli class=\"users\" tab=\"users\"\u003E";
;pug_debug_line = 19;pug_debug_filename = "views\u002Fmain.jade";
pug_html = pug_html + (null == (pug_interp = icon('users', 'Users')) ? "" : pug_interp) + "\u003C\u002Fli\u003E";
;pug_debug_line = 20;pug_debug_filename = "views\u002Fmain.jade";
pug_html = pug_html + "\n      \u003Cli class=\"extensions\" tab=\"extensions\"\u003E";
;pug_debug_line = 20;pug_debug_filename = "views\u002Fmain.jade";
pug_html = pug_html + (null == (pug_interp = icon('extensions', "Postgres Extensions")) ? "" : pug_interp) + "\u003C\u002Fli\u003E";
;pug_debug_line = 21;pug_debug_filename = "views\u002Fmain.jade";
pug_html = pug_html + "\n      \u003Cli class=\"procedures\" tab=\"procedures\"\u003E";
;pug_debug_line = 21;pug_debug_filename = "views\u002Fmain.jade";
pug_html = pug_html + (null == (pug_interp = icon('procedures', "Procedures")) ? "" : pug_interp) + "\u003C\u002Fli\u003E\n    \u003C\u002Ful\u003E";
;pug_debug_line = 22;pug_debug_filename = "views\u002Fmain.jade";
pug_html = pug_html + "\n    \u003Cdiv class=\"resize-handler\"\u003E\u003C\u002Fdiv\u003E\n  \u003C\u002Fdiv\u003E";
;pug_debug_line = 23;pug_debug_filename = "views\u002Fmain.jade";
pug_html = pug_html + "\n  \u003Cdiv class=\"main\"\u003E";
;pug_debug_line = 24;pug_debug_filename = "views\u002Fmain.jade";
pug_html = pug_html + "\n    \u003Cdiv class=\"window-tabs\"\u003E";
;pug_debug_line = 25;pug_debug_filename = "views\u002Fmain.jade";
pug_html = pug_html + "\n      \u003Cdiv class=\"window-tab tab structure\" tab=\"structure\"\u003E";
;pug_debug_line = 25;pug_debug_filename = "views\u002Fmain.jade";
pug_html = pug_html + "Structure\u003C\u002Fdiv\u003E";
;pug_debug_line = 26;pug_debug_filename = "views\u002Fmain.jade";
pug_html = pug_html + "\n      \u003Cdiv class=\"window-tab tab content\" tab=\"content\"\u003E";
;pug_debug_line = 26;pug_debug_filename = "views\u002Fmain.jade";
pug_html = pug_html + "Content\u003C\u002Fdiv\u003E";
;pug_debug_line = 27;pug_debug_filename = "views\u002Fmain.jade";
pug_html = pug_html + "\n      \u003Cdiv class=\"window-tab tab info\" tab=\"info\"\u003E";
;pug_debug_line = 27;pug_debug_filename = "views\u002Fmain.jade";
pug_html = pug_html + "Info\u003C\u002Fdiv\u003E";
;pug_debug_line = 28;pug_debug_filename = "views\u002Fmain.jade";
pug_html = pug_html + "\n      \u003Cdiv class=\"window-tab tab query\" tab=\"query\"\u003E";
;pug_debug_line = 28;pug_debug_filename = "views\u002Fmain.jade";
pug_html = pug_html + "Query\u003C\u002Fdiv\u003E";
;pug_debug_line = 29;pug_debug_filename = "views\u002Fmain.jade";
pug_html = pug_html + "\n      \u003C!--.tab.triggers(tab='triggers') Triggers--\u003E\n    \u003C\u002Fdiv\u003E";
;pug_debug_line = 30;pug_debug_filename = "views\u002Fmain.jade";
pug_html = pug_html + "\n    \u003Cdiv class=\"clearfix\"\u003E\u003C\u002Fdiv\u003E";
;pug_debug_line = 32;pug_debug_filename = "views\u002Fmain.jade";
pug_html = pug_html + "\n    \u003Cdiv class=\"window-content structure\"\u003E\u003C\u002Fdiv\u003E";
;pug_debug_line = 33;pug_debug_filename = "views\u002Fmain.jade";
pug_html = pug_html + "\n    \u003Cdiv class=\"window-content content\"\u003E\u003C\u002Fdiv\u003E";
;pug_debug_line = 34;pug_debug_filename = "views\u002Fmain.jade";
pug_html = pug_html + "\n    \u003Cdiv class=\"window-content info\"\u003E\u003C\u002Fdiv\u003E";
;pug_debug_line = 35;pug_debug_filename = "views\u002Fmain.jade";
pug_html = pug_html + "\n    \u003Cdiv class=\"window-content query\"\u003E\u003C\u002Fdiv\u003E";
;pug_debug_line = 36;pug_debug_filename = "views\u002Fmain.jade";
pug_html = pug_html + "\n    \u003Cdiv class=\"window-content triggers\"\u003E\u003C\u002Fdiv\u003E";
;pug_debug_line = 37;pug_debug_filename = "views\u002Fmain.jade";
pug_html = pug_html + "\n    \u003Cdiv class=\"window-content users\"\u003E\u003C\u002Fdiv\u003E";
;pug_debug_line = 38;pug_debug_filename = "views\u002Fmain.jade";
pug_html = pug_html + "\n    \u003Cdiv class=\"window-content extensions\"\u003E\u003C\u002Fdiv\u003E";
;pug_debug_line = 39;pug_debug_filename = "views\u002Fmain.jade";
pug_html = pug_html + "\n    \u003Cdiv class=\"window-content procedures\"\u003E\u003C\u002Fdiv\u003E\n  \u003C\u002Fdiv\u003E\n\u003C\u002Fdiv\u003E";}.call(this,"icon" in locals_for_with?locals_for_with.icon:typeof icon!=="undefined"?icon:undefined));} catch (err) {pug.rethrow(err, pug_debug_filename, pug_debug_line, pug_debug_sources[pug_debug_filename]);};return pug_html;};
exports["main"].content = ".main-screen\n  .sidebar\n    .databases\n      label Select database\n      select\n        option Select database...\n    .tables.without-system-tables\n      ul\n      .show-system-tables\n        label\n          input(type=\"checkbox\")\n          = \"Show Schemas\"\n\n    ul.extras\n      li.reload\n        a.reloadStructure!= icon('reload', 'Reload Tables')\n      li.add-table\n        a.addTable!= icon('add-table', 'Add Table')\n      li.users(tab='users')!= icon('users', 'Users')\n      li.extensions(tab='extensions')!= icon('extensions', \"Postgres Extensions\")\n      li.procedures(tab='procedures')!= icon('procedures', \"Procedures\")\n    .resize-handler\n  .main\n    .window-tabs\n      .window-tab.tab.structure(tab='structure') Structure\n      .window-tab.tab.content(tab='content') Content\n      .window-tab.tab.info(tab='info') Info\n      .window-tab.tab.query(tab='query') Query\n      //.tab.triggers(tab='triggers') Triggers\n    .clearfix\n\n    .window-content.structure\n    .window-content.content\n    .window-content.info\n    .window-content.query\n    .window-content.triggers\n    .window-content.users\n    .window-content.extensions\n    .window-content.procedures";
exports["procedures_tab"] = function template(pug, locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {var pug_debug_sources = {"views\u002Fprocedures_tab.jade":"h4 Procedures\n\n.rescol-wrapper.with-borders\n  .rescol-header-wrapper\n  .rescol-content-wrapper\n    table\n      thead\n        tr\n          th name\n          th return type\n          th arguments\n          th language\n          th extension\n          th\n      tbody\n        each proc in procs\n          tr\n            td\n              strong= proc.name\n            td= proc.return_type\n            td= proc.arg_list\n            td= proc.language\n            td= proc.extension\n            td\n              if proc.language != \"c\" && proc.language != 'internal'\n                a(exec=\"editProc('\" + proc.oid + \"', '\" + proc.name + \"')\") Edit\n                != \"&nbsp;\"\n                a(exec=\"procDefinition('\" + proc.oid + \"', '\" + proc.name + \"')\") Source\n                != \"&nbsp;\"\n              a(exec=\"removeProc('\" + proc.name + \"')\") Delete\n\nfooter\n  - \u002F\u002Fbutton.native-look(exec=\"addColumnForm\") Create Procedure\n  - \u002F\u002Fbutton.native-look(exec=\"addColumnForm\") Create Trigger\n  button.native-look(exec=\"listLanguages\") List Languages\n\nh4 Triggers And Constraints\n\n.rescol-wrapper.with-borders\n  .rescol-header-wrapper\n  .rescol-content-wrapper\n    table\n      thead\n        tr\n          th Name\n          th Table\n          th Procedure\n          th Event\n          th(title=\"Deferrable\") Deferr.\n          th\n      tbody\n        each trigger in triggers\n          tr\n            td\n              if trigger.constraint_name\n                strong(title=\"Constraint\") C\n                != \"&nbsp;\"\n                = trigger.constraint_name\n              else\n                = trigger.name\n            td= trigger.table_name\n            td= trigger.proc_name\n            td= trigger.typeDesc().join(\", \")\n            td= trigger.tgdeferrable ? \"Yes\" : \"No\"\n            td\n              a(exec=\"editTrigger('\" + trigger.name + \"')\") Edit\n              != \"&nbsp;\"\n              a(exec=\"removeTrigger('\" + trigger.name + \"')\") Delete\n\nfooter\n  - \u002F\u002Fbutton.native-look(exec=\"addColumnForm\") Create Trigger\n"};
;var locals_for_with = (locals || {});(function (procs, triggers) {var pug_indent = [];
;pug_debug_line = 1;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\n\u003Ch4\u003E";
;pug_debug_line = 1;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "Procedures\u003C\u002Fh4\u003E";
;pug_debug_line = 3;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\n\u003Cdiv class=\"rescol-wrapper with-borders\"\u003E";
;pug_debug_line = 4;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\n  \u003Cdiv class=\"rescol-header-wrapper\"\u003E\u003C\u002Fdiv\u003E";
;pug_debug_line = 5;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\n  \u003Cdiv class=\"rescol-content-wrapper\"\u003E";
;pug_debug_line = 6;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\n    \u003Ctable\u003E";
;pug_debug_line = 7;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\n      \u003Cthead\u003E";
;pug_debug_line = 8;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\n        \u003Ctr\u003E";
;pug_debug_line = 9;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\n          \u003Cth\u003E";
;pug_debug_line = 9;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "name\u003C\u002Fth\u003E";
;pug_debug_line = 10;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\n          \u003Cth\u003E";
;pug_debug_line = 10;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "return type\u003C\u002Fth\u003E";
;pug_debug_line = 11;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\n          \u003Cth\u003E";
;pug_debug_line = 11;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "arguments\u003C\u002Fth\u003E";
;pug_debug_line = 12;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\n          \u003Cth\u003E";
;pug_debug_line = 12;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "language\u003C\u002Fth\u003E";
;pug_debug_line = 13;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\n          \u003Cth\u003E";
;pug_debug_line = 13;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "extension\u003C\u002Fth\u003E";
;pug_debug_line = 14;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\n          \u003Cth\u003E\u003C\u002Fth\u003E\n        \u003C\u002Ftr\u003E\n      \u003C\u002Fthead\u003E";
;pug_debug_line = 15;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\n      \u003Ctbody\u003E";
;pug_debug_line = 16;pug_debug_filename = "views\u002Fprocedures_tab.jade";
// iterate procs
;(function(){
  var $$obj = procs;
  if ('number' == typeof $$obj.length) {
      for (var pug_index0 = 0, $$l = $$obj.length; pug_index0 < $$l; pug_index0++) {
        var proc = $$obj[pug_index0];
;pug_debug_line = 17;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\n        \u003Ctr\u003E";
;pug_debug_line = 18;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 19;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\u003Cstrong\u003E";
;pug_debug_line = 19;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = proc.name) ? "" : pug_interp)) + "\u003C\u002Fstrong\u003E\u003C\u002Ftd\u003E";
;pug_debug_line = 20;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 20;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = proc.return_type) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 21;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 21;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = proc.arg_list) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 22;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 22;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = proc.language) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 23;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 23;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = proc.extension) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 24;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 25;pug_debug_filename = "views\u002Fprocedures_tab.jade";
if (proc.language != "c" && proc.language != 'internal') {
;pug_debug_line = 26;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\u003Ca" + (pug.attr("exec", "editProc('" + proc.oid + "', '" + proc.name + "')", true, false)) + "\u003E";
;pug_debug_line = 26;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "Edit\u003C\u002Fa\u003E";
;pug_debug_line = 27;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + (null == (pug_interp = "&nbsp;") ? "" : pug_interp);
;pug_debug_line = 28;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\u003Ca" + (pug.attr("exec", "procDefinition('" + proc.oid + "', '" + proc.name + "')", true, false)) + "\u003E";
;pug_debug_line = 28;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "Source\u003C\u002Fa\u003E";
;pug_debug_line = 29;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + (null == (pug_interp = "&nbsp;") ? "" : pug_interp);
}
;pug_debug_line = 30;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\u003Ca" + (pug.attr("exec", "removeProc('" + proc.name + "')", true, false)) + "\u003E";
;pug_debug_line = 30;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "Delete\u003C\u002Fa\u003E\n          \u003C\u002Ftd\u003E\n        \u003C\u002Ftr\u003E";
      }
  } else {
    var $$l = 0;
    for (var pug_index0 in $$obj) {
      $$l++;
      var proc = $$obj[pug_index0];
;pug_debug_line = 17;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\n        \u003Ctr\u003E";
;pug_debug_line = 18;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 19;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\u003Cstrong\u003E";
;pug_debug_line = 19;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = proc.name) ? "" : pug_interp)) + "\u003C\u002Fstrong\u003E\u003C\u002Ftd\u003E";
;pug_debug_line = 20;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 20;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = proc.return_type) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 21;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 21;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = proc.arg_list) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 22;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 22;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = proc.language) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 23;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 23;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = proc.extension) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 24;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 25;pug_debug_filename = "views\u002Fprocedures_tab.jade";
if (proc.language != "c" && proc.language != 'internal') {
;pug_debug_line = 26;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\u003Ca" + (pug.attr("exec", "editProc('" + proc.oid + "', '" + proc.name + "')", true, false)) + "\u003E";
;pug_debug_line = 26;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "Edit\u003C\u002Fa\u003E";
;pug_debug_line = 27;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + (null == (pug_interp = "&nbsp;") ? "" : pug_interp);
;pug_debug_line = 28;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\u003Ca" + (pug.attr("exec", "procDefinition('" + proc.oid + "', '" + proc.name + "')", true, false)) + "\u003E";
;pug_debug_line = 28;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "Source\u003C\u002Fa\u003E";
;pug_debug_line = 29;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + (null == (pug_interp = "&nbsp;") ? "" : pug_interp);
}
;pug_debug_line = 30;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\u003Ca" + (pug.attr("exec", "removeProc('" + proc.name + "')", true, false)) + "\u003E";
;pug_debug_line = 30;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "Delete\u003C\u002Fa\u003E\n          \u003C\u002Ftd\u003E\n        \u003C\u002Ftr\u003E";
    }
  }
}).call(this);

pug_html = pug_html + "\n      \u003C\u002Ftbody\u003E\n    \u003C\u002Ftable\u003E\n  \u003C\u002Fdiv\u003E\n\u003C\u002Fdiv\u003E";
;pug_debug_line = 32;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\n\u003Cfooter\u003E";
;pug_debug_line = 33;pug_debug_filename = "views\u002Fprocedures_tab.jade";
//button.native-look(exec="addColumnForm") Create Procedure
;pug_debug_line = 34;pug_debug_filename = "views\u002Fprocedures_tab.jade";
//button.native-look(exec="addColumnForm") Create Trigger
;pug_debug_line = 35;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\n  \u003Cbutton class=\"native-look\" exec=\"listLanguages\"\u003E";
;pug_debug_line = 35;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "List Languages\u003C\u002Fbutton\u003E\n\u003C\u002Ffooter\u003E";
;pug_debug_line = 37;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\n\u003Ch4\u003E";
;pug_debug_line = 37;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "Triggers And Constraints\u003C\u002Fh4\u003E";
;pug_debug_line = 39;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\n\u003Cdiv class=\"rescol-wrapper with-borders\"\u003E";
;pug_debug_line = 40;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\n  \u003Cdiv class=\"rescol-header-wrapper\"\u003E\u003C\u002Fdiv\u003E";
;pug_debug_line = 41;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\n  \u003Cdiv class=\"rescol-content-wrapper\"\u003E";
;pug_debug_line = 42;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\n    \u003Ctable\u003E";
;pug_debug_line = 43;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\n      \u003Cthead\u003E";
;pug_debug_line = 44;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\n        \u003Ctr\u003E";
;pug_debug_line = 45;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\n          \u003Cth\u003E";
;pug_debug_line = 45;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "Name\u003C\u002Fth\u003E";
;pug_debug_line = 46;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\n          \u003Cth\u003E";
;pug_debug_line = 46;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "Table\u003C\u002Fth\u003E";
;pug_debug_line = 47;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\n          \u003Cth\u003E";
;pug_debug_line = 47;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "Procedure\u003C\u002Fth\u003E";
;pug_debug_line = 48;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\n          \u003Cth\u003E";
;pug_debug_line = 48;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "Event\u003C\u002Fth\u003E";
;pug_debug_line = 49;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\n          \u003Cth title=\"Deferrable\"\u003E";
;pug_debug_line = 49;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "Deferr.\u003C\u002Fth\u003E";
;pug_debug_line = 50;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\n          \u003Cth\u003E\u003C\u002Fth\u003E\n        \u003C\u002Ftr\u003E\n      \u003C\u002Fthead\u003E";
;pug_debug_line = 51;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\n      \u003Ctbody\u003E";
;pug_debug_line = 52;pug_debug_filename = "views\u002Fprocedures_tab.jade";
// iterate triggers
;(function(){
  var $$obj = triggers;
  if ('number' == typeof $$obj.length) {
      for (var pug_index1 = 0, $$l = $$obj.length; pug_index1 < $$l; pug_index1++) {
        var trigger = $$obj[pug_index1];
;pug_debug_line = 53;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\n        \u003Ctr\u003E";
;pug_debug_line = 54;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 55;pug_debug_filename = "views\u002Fprocedures_tab.jade";
if (trigger.constraint_name) {
;pug_debug_line = 56;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\u003Cstrong title=\"Constraint\"\u003E";
;pug_debug_line = 56;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "C\u003C\u002Fstrong\u003E";
;pug_debug_line = 57;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + (null == (pug_interp = "&nbsp;") ? "" : pug_interp);
;pug_debug_line = 58;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = trigger.constraint_name) ? "" : pug_interp));
}
else {
;pug_debug_line = 60;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = trigger.name) ? "" : pug_interp));
}
pug_html = pug_html + "\n          \u003C\u002Ftd\u003E";
;pug_debug_line = 61;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 61;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = trigger.table_name) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 62;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 62;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = trigger.proc_name) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 63;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 63;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = trigger.typeDesc().join(", ")) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 64;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 64;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = trigger.tgdeferrable ? "Yes" : "No") ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 65;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 66;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\u003Ca" + (pug.attr("exec", "editTrigger('" + trigger.name + "')", true, false)) + "\u003E";
;pug_debug_line = 66;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "Edit\u003C\u002Fa\u003E";
;pug_debug_line = 67;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + (null == (pug_interp = "&nbsp;") ? "" : pug_interp);
;pug_debug_line = 68;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\u003Ca" + (pug.attr("exec", "removeTrigger('" + trigger.name + "')", true, false)) + "\u003E";
;pug_debug_line = 68;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "Delete\u003C\u002Fa\u003E\n          \u003C\u002Ftd\u003E\n        \u003C\u002Ftr\u003E";
      }
  } else {
    var $$l = 0;
    for (var pug_index1 in $$obj) {
      $$l++;
      var trigger = $$obj[pug_index1];
;pug_debug_line = 53;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\n        \u003Ctr\u003E";
;pug_debug_line = 54;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 55;pug_debug_filename = "views\u002Fprocedures_tab.jade";
if (trigger.constraint_name) {
;pug_debug_line = 56;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\u003Cstrong title=\"Constraint\"\u003E";
;pug_debug_line = 56;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "C\u003C\u002Fstrong\u003E";
;pug_debug_line = 57;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + (null == (pug_interp = "&nbsp;") ? "" : pug_interp);
;pug_debug_line = 58;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = trigger.constraint_name) ? "" : pug_interp));
}
else {
;pug_debug_line = 60;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = trigger.name) ? "" : pug_interp));
}
pug_html = pug_html + "\n          \u003C\u002Ftd\u003E";
;pug_debug_line = 61;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 61;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = trigger.table_name) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 62;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 62;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = trigger.proc_name) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 63;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 63;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = trigger.typeDesc().join(", ")) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 64;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 64;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = trigger.tgdeferrable ? "Yes" : "No") ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 65;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 66;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\u003Ca" + (pug.attr("exec", "editTrigger('" + trigger.name + "')", true, false)) + "\u003E";
;pug_debug_line = 66;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "Edit\u003C\u002Fa\u003E";
;pug_debug_line = 67;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + (null == (pug_interp = "&nbsp;") ? "" : pug_interp);
;pug_debug_line = 68;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\u003Ca" + (pug.attr("exec", "removeTrigger('" + trigger.name + "')", true, false)) + "\u003E";
;pug_debug_line = 68;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "Delete\u003C\u002Fa\u003E\n          \u003C\u002Ftd\u003E\n        \u003C\u002Ftr\u003E";
    }
  }
}).call(this);

pug_html = pug_html + "\n      \u003C\u002Ftbody\u003E\n    \u003C\u002Ftable\u003E\n  \u003C\u002Fdiv\u003E\n\u003C\u002Fdiv\u003E";
;pug_debug_line = 70;pug_debug_filename = "views\u002Fprocedures_tab.jade";
pug_html = pug_html + "\n\u003Cfooter\u003E";
;pug_debug_line = 71;pug_debug_filename = "views\u002Fprocedures_tab.jade";
//button.native-look(exec="addColumnForm") Create Trigger
pug_html = pug_html + "\n\u003C\u002Ffooter\u003E";}.call(this,"procs" in locals_for_with?locals_for_with.procs:typeof procs!=="undefined"?procs:undefined,"triggers" in locals_for_with?locals_for_with.triggers:typeof triggers!=="undefined"?triggers:undefined));} catch (err) {pug.rethrow(err, pug_debug_filename, pug_debug_line, pug_debug_sources[pug_debug_filename]);};return pug_html;};
exports["procedures_tab"].content = "h4 Procedures\n\n.rescol-wrapper.with-borders\n  .rescol-header-wrapper\n  .rescol-content-wrapper\n    table\n      thead\n        tr\n          th name\n          th return type\n          th arguments\n          th language\n          th extension\n          th\n      tbody\n        each proc in procs\n          tr\n            td\n              strong= proc.name\n            td= proc.return_type\n            td= proc.arg_list\n            td= proc.language\n            td= proc.extension\n            td\n              if proc.language != \"c\" && proc.language != 'internal'\n                a(exec=\"editProc('\" + proc.oid + \"', '\" + proc.name + \"')\") Edit\n                != \"&nbsp;\"\n                a(exec=\"procDefinition('\" + proc.oid + \"', '\" + proc.name + \"')\") Source\n                != \"&nbsp;\"\n              a(exec=\"removeProc('\" + proc.name + \"')\") Delete\n\nfooter\n  - //button.native-look(exec=\"addColumnForm\") Create Procedure\n  - //button.native-look(exec=\"addColumnForm\") Create Trigger\n  button.native-look(exec=\"listLanguages\") List Languages\n\nh4 Triggers And Constraints\n\n.rescol-wrapper.with-borders\n  .rescol-header-wrapper\n  .rescol-content-wrapper\n    table\n      thead\n        tr\n          th Name\n          th Table\n          th Procedure\n          th Event\n          th(title=\"Deferrable\") Deferr.\n          th\n      tbody\n        each trigger in triggers\n          tr\n            td\n              if trigger.constraint_name\n                strong(title=\"Constraint\") C\n                != \"&nbsp;\"\n                = trigger.constraint_name\n              else\n                = trigger.name\n            td= trigger.table_name\n            td= trigger.proc_name\n            td= trigger.typeDesc().join(\", \")\n            td= trigger.tgdeferrable ? \"Yes\" : \"No\"\n            td\n              a(exec=\"editTrigger('\" + trigger.name + \"')\") Edit\n              != \"&nbsp;\"\n              a(exec=\"removeTrigger('\" + trigger.name + \"')\") Delete\n\nfooter\n  - //button.native-look(exec=\"addColumnForm\") Create Trigger\n";
exports["query_tab"] = function template(pug, locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {var pug_debug_sources = {"views\u002Fquery_tab.jade":".editing\n  textarea.editor\n.middlebar\n  .resizer\n  button.native-look(exec=\"runQuery\" title=\"Cmd+R\") Run Query\n  button.native-look(exec=\"showHistory\") See History\n  button.native-look(exec=\"openSnippets\") Snippets\n  button.native-look.is-hidden.cleanButton(exec=\"cleanButtonClick\") Clear\n.result\n  .rescol-wrapper\n    .rescol-header-wrapper\n    .rescol-content-wrapper\n      table\n  .status"};
var pug_indent = [];
;pug_debug_line = 1;pug_debug_filename = "views\u002Fquery_tab.jade";
pug_html = pug_html + "\n\u003Cdiv class=\"editing\"\u003E";
;pug_debug_line = 2;pug_debug_filename = "views\u002Fquery_tab.jade";
pug_html = pug_html + "\n  \u003Ctextarea class=\"editor\"\u003E\u003C\u002Ftextarea\u003E\n\u003C\u002Fdiv\u003E";
;pug_debug_line = 3;pug_debug_filename = "views\u002Fquery_tab.jade";
pug_html = pug_html + "\n\u003Cdiv class=\"middlebar\"\u003E";
;pug_debug_line = 4;pug_debug_filename = "views\u002Fquery_tab.jade";
pug_html = pug_html + "\n  \u003Cdiv class=\"resizer\"\u003E\u003C\u002Fdiv\u003E";
;pug_debug_line = 5;pug_debug_filename = "views\u002Fquery_tab.jade";
pug_html = pug_html + "\n  \u003Cbutton class=\"native-look\" exec=\"runQuery\" title=\"Cmd+R\"\u003E";
;pug_debug_line = 5;pug_debug_filename = "views\u002Fquery_tab.jade";
pug_html = pug_html + "Run Query\u003C\u002Fbutton\u003E";
;pug_debug_line = 6;pug_debug_filename = "views\u002Fquery_tab.jade";
pug_html = pug_html + "\n  \u003Cbutton class=\"native-look\" exec=\"showHistory\"\u003E";
;pug_debug_line = 6;pug_debug_filename = "views\u002Fquery_tab.jade";
pug_html = pug_html + "See History\u003C\u002Fbutton\u003E";
;pug_debug_line = 7;pug_debug_filename = "views\u002Fquery_tab.jade";
pug_html = pug_html + "\n  \u003Cbutton class=\"native-look\" exec=\"openSnippets\"\u003E";
;pug_debug_line = 7;pug_debug_filename = "views\u002Fquery_tab.jade";
pug_html = pug_html + "Snippets\u003C\u002Fbutton\u003E";
;pug_debug_line = 8;pug_debug_filename = "views\u002Fquery_tab.jade";
pug_html = pug_html + "\n  \u003Cbutton class=\"native-look is-hidden cleanButton\" exec=\"cleanButtonClick\"\u003E";
;pug_debug_line = 8;pug_debug_filename = "views\u002Fquery_tab.jade";
pug_html = pug_html + "Clear\u003C\u002Fbutton\u003E\n\u003C\u002Fdiv\u003E";
;pug_debug_line = 9;pug_debug_filename = "views\u002Fquery_tab.jade";
pug_html = pug_html + "\n\u003Cdiv class=\"result\"\u003E";
;pug_debug_line = 10;pug_debug_filename = "views\u002Fquery_tab.jade";
pug_html = pug_html + "\n  \u003Cdiv class=\"rescol-wrapper\"\u003E";
;pug_debug_line = 11;pug_debug_filename = "views\u002Fquery_tab.jade";
pug_html = pug_html + "\n    \u003Cdiv class=\"rescol-header-wrapper\"\u003E\u003C\u002Fdiv\u003E";
;pug_debug_line = 12;pug_debug_filename = "views\u002Fquery_tab.jade";
pug_html = pug_html + "\n    \u003Cdiv class=\"rescol-content-wrapper\"\u003E";
;pug_debug_line = 13;pug_debug_filename = "views\u002Fquery_tab.jade";
pug_html = pug_html + "\n      \u003Ctable\u003E\u003C\u002Ftable\u003E\n    \u003C\u002Fdiv\u003E\n  \u003C\u002Fdiv\u003E";
;pug_debug_line = 14;pug_debug_filename = "views\u002Fquery_tab.jade";
pug_html = pug_html + "\n  \u003Cdiv class=\"status\"\u003E\u003C\u002Fdiv\u003E\n\u003C\u002Fdiv\u003E";} catch (err) {pug.rethrow(err, pug_debug_filename, pug_debug_line, pug_debug_sources[pug_debug_filename]);};return pug_html;};
exports["query_tab"].content = ".editing\n  textarea.editor\n.middlebar\n  .resizer\n  button.native-look(exec=\"runQuery\" title=\"Cmd+R\") Run Query\n  button.native-look(exec=\"showHistory\") See History\n  button.native-look(exec=\"openSnippets\") Snippets\n  button.native-look.is-hidden.cleanButton(exec=\"cleanButtonClick\") Clear\n.result\n  .rescol-wrapper\n    .rescol-header-wrapper\n    .rescol-content-wrapper\n      table\n  .status";
exports["snippet_preview"] = function template(pug, locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {var pug_debug_sources = {"views\u002Fsnippet_preview.jade":".preview-content\n  p= snippet.description\n\n  code.result.sql= snippet.sql\n\n  button(exec=\"insert\") Insert to Editor\n"};
;var locals_for_with = (locals || {});(function (snippet) {var pug_indent = [];
;pug_debug_line = 1;pug_debug_filename = "views\u002Fsnippet_preview.jade";
pug_html = pug_html + "\n\u003Cdiv class=\"preview-content\"\u003E";
;pug_debug_line = 2;pug_debug_filename = "views\u002Fsnippet_preview.jade";
pug_html = pug_html + "\n  \u003Cp\u003E";
;pug_debug_line = 2;pug_debug_filename = "views\u002Fsnippet_preview.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = snippet.description) ? "" : pug_interp)) + "\u003C\u002Fp\u003E";
;pug_debug_line = 4;pug_debug_filename = "views\u002Fsnippet_preview.jade";
pug_html = pug_html + "\u003Ccode class=\"result sql\"\u003E";
;pug_debug_line = 4;pug_debug_filename = "views\u002Fsnippet_preview.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = snippet.sql) ? "" : pug_interp)) + "\u003C\u002Fcode\u003E";
;pug_debug_line = 6;pug_debug_filename = "views\u002Fsnippet_preview.jade";
pug_html = pug_html + "\n  \u003Cbutton exec=\"insert\"\u003E";
;pug_debug_line = 6;pug_debug_filename = "views\u002Fsnippet_preview.jade";
pug_html = pug_html + "Insert to Editor\u003C\u002Fbutton\u003E\n\u003C\u002Fdiv\u003E";}.call(this,"snippet" in locals_for_with?locals_for_with.snippet:typeof snippet!=="undefined"?snippet:undefined));} catch (err) {pug.rethrow(err, pug_debug_filename, pug_debug_line, pug_debug_sources[pug_debug_filename]);};return pug_html;};
exports["snippet_preview"].content = ".preview-content\n  p= snippet.description\n\n  code.result.sql= snippet.sql\n\n  button(exec=\"insert\") Insert to Editor\n";
exports["snippets"] = function template(pug, locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {var pug_debug_sources = {"views\u002Fsnippets.jade":".snippets-window\n  ul\n    each snippet, name in snippets\n      li(snippet=name)= name\n  .preview\n  footer\n"};
;var locals_for_with = (locals || {});(function (snippets) {var pug_indent = [];
;pug_debug_line = 1;pug_debug_filename = "views\u002Fsnippets.jade";
pug_html = pug_html + "\n\u003Cdiv class=\"snippets-window\"\u003E";
;pug_debug_line = 2;pug_debug_filename = "views\u002Fsnippets.jade";
pug_html = pug_html + "\n  \u003Cul\u003E";
;pug_debug_line = 3;pug_debug_filename = "views\u002Fsnippets.jade";
// iterate snippets
;(function(){
  var $$obj = snippets;
  if ('number' == typeof $$obj.length) {
      for (var name = 0, $$l = $$obj.length; name < $$l; name++) {
        var snippet = $$obj[name];
;pug_debug_line = 4;pug_debug_filename = "views\u002Fsnippets.jade";
pug_html = pug_html + "\n    \u003Cli" + (pug.attr("snippet", name, true, false)) + "\u003E";
;pug_debug_line = 4;pug_debug_filename = "views\u002Fsnippets.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = name) ? "" : pug_interp)) + "\u003C\u002Fli\u003E";
      }
  } else {
    var $$l = 0;
    for (var name in $$obj) {
      $$l++;
      var snippet = $$obj[name];
;pug_debug_line = 4;pug_debug_filename = "views\u002Fsnippets.jade";
pug_html = pug_html + "\n    \u003Cli" + (pug.attr("snippet", name, true, false)) + "\u003E";
;pug_debug_line = 4;pug_debug_filename = "views\u002Fsnippets.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = name) ? "" : pug_interp)) + "\u003C\u002Fli\u003E";
    }
  }
}).call(this);

pug_html = pug_html + "\n  \u003C\u002Ful\u003E";
;pug_debug_line = 5;pug_debug_filename = "views\u002Fsnippets.jade";
pug_html = pug_html + "\n  \u003Cdiv class=\"preview\"\u003E\u003C\u002Fdiv\u003E";
;pug_debug_line = 6;pug_debug_filename = "views\u002Fsnippets.jade";
pug_html = pug_html + "\n  \u003Cfooter\u003E\u003C\u002Ffooter\u003E\n\u003C\u002Fdiv\u003E";}.call(this,"snippets" in locals_for_with?locals_for_with.snippets:typeof snippets!=="undefined"?snippets:undefined));} catch (err) {pug.rethrow(err, pug_debug_filename, pug_debug_line, pug_debug_sources[pug_debug_filename]);};return pug_html;};
exports["snippets"].content = ".snippets-window\n  ul\n    each snippet, name in snippets\n      li(snippet=name)= name\n  .preview\n  footer\n";
exports["structure_tab"] = function template(pug, locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {var pug_debug_sources = {"views\u002Fstructure_tab.jade":".rescol-wrapper.with-borders.columns-list-table\n  .rescol-header-wrapper\n  .rescol-content-wrapper\n    table\n      thead\n        tr\n          th column\n          th type\n          th max length\n          th default\n          th primary key\n          th null\n          th\n      tbody\n        each column in columns || []\n          tr\n            td= column.column_name\n            td(title = column_type_label(column))= column_type_label(column, true)\n            td= column.character_maximum_length\n            td= ('' + column.column_default).match(\u002F^nextval\u002F) ? 'auto increment' : column.column_default\n            td= column.is_primary_key ? 'yes' : ''\n            td= column.is_nullable == 'YES' || column.is_nullable == true ? 'yes' : 'no'\n            td\n              a(exec=\"editColumn('\" + column.column_name + \"')\") Edit\n              != \"&nbsp;\"\n              a(exec=\"deleteColumn('\" + column.column_name + \"')\") Delete\n        else\n          if !columns\n            tr\n              td(collspan=7) Error accured while getting table info\n\nfooter\n  if !is_mat_view\n    button.native-look(exec=\"addColumnForm\") Add column\n\nh4 Indexes\n\n.rescol-wrapper.with-borders.indexes-list-table\n  .rescol-header-wrapper\n  .rescol-content-wrapper\n    table\n      thead\n        tr\n          th name\n          th p. key\n          th uniq\n          th columns\n          th type\n          th\n      tbody\n        each index in indexes\n          tr\n            td= index.relname\n            td= index.indisprimary ? 'Yes' : 'No'\n            td= index.indisunique ? 'Yes' : 'No'\n            td= index.pg_get_indexdef.match(\u002FON [^\\(]+\\((.+)\\)\u002F)[1]\n            td= getIndexType(index.pg_get_indexdef)\n            td\n              a(exec=\"deleteIndex('\" + index.relname + \"')\") Delete\n\nfooter\n  button.native-look(exec=\"addIndexForm\") Add index\n\nif constraints.length \u003E 0\n  h4 Constraints\n  .rescol-wrapper.with-borders.indexes-list-table\n    .rescol-header-wrapper\n    .rescol-content-wrapper\n      table\n        thead\n          tr\n            th name\n            th source\n            th\n        tbody\n          each constraint in constraints\n            tr\n              td= constraint.conname\n              td= constraint.pretty_source\n              td\n                a(exec=\"deleteConstraint('\" + constraint.conname + \"')\") Delete\n"};
;var locals_for_with = (locals || {});(function (column_type_label, columns, constraints, getIndexType, indexes, is_mat_view) {var pug_indent = [];
;pug_debug_line = 1;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n\u003Cdiv class=\"rescol-wrapper with-borders columns-list-table\"\u003E";
;pug_debug_line = 2;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n  \u003Cdiv class=\"rescol-header-wrapper\"\u003E\u003C\u002Fdiv\u003E";
;pug_debug_line = 3;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n  \u003Cdiv class=\"rescol-content-wrapper\"\u003E";
;pug_debug_line = 4;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n    \u003Ctable\u003E";
;pug_debug_line = 5;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n      \u003Cthead\u003E";
;pug_debug_line = 6;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n        \u003Ctr\u003E";
;pug_debug_line = 7;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n          \u003Cth\u003E";
;pug_debug_line = 7;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "column\u003C\u002Fth\u003E";
;pug_debug_line = 8;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n          \u003Cth\u003E";
;pug_debug_line = 8;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "type\u003C\u002Fth\u003E";
;pug_debug_line = 9;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n          \u003Cth\u003E";
;pug_debug_line = 9;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "max length\u003C\u002Fth\u003E";
;pug_debug_line = 10;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n          \u003Cth\u003E";
;pug_debug_line = 10;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "default\u003C\u002Fth\u003E";
;pug_debug_line = 11;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n          \u003Cth\u003E";
;pug_debug_line = 11;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "primary key\u003C\u002Fth\u003E";
;pug_debug_line = 12;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n          \u003Cth\u003E";
;pug_debug_line = 12;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "null\u003C\u002Fth\u003E";
;pug_debug_line = 13;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n          \u003Cth\u003E\u003C\u002Fth\u003E\n        \u003C\u002Ftr\u003E\n      \u003C\u002Fthead\u003E";
;pug_debug_line = 14;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n      \u003Ctbody\u003E";
;pug_debug_line = 15;pug_debug_filename = "views\u002Fstructure_tab.jade";
// iterate columns || []
;(function(){
  var $$obj = columns || [];
  if ('number' == typeof $$obj.length) {
    if ($$obj.length) {
      for (var pug_index0 = 0, $$l = $$obj.length; pug_index0 < $$l; pug_index0++) {
        var column = $$obj[pug_index0];
;pug_debug_line = 16;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n        \u003Ctr\u003E";
;pug_debug_line = 17;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 17;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = column.column_name) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 18;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n          \u003Ctd" + (pug.attr("title", column_type_label(column), true, false)) + "\u003E";
;pug_debug_line = 18;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = column_type_label(column, true)) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 19;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 19;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = column.character_maximum_length) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 20;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 20;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = ('' + column.column_default).match(/^nextval/) ? 'auto increment' : column.column_default) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 21;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 21;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = column.is_primary_key ? 'yes' : '') ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 22;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 22;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = column.is_nullable == 'YES' || column.is_nullable == true ? 'yes' : 'no') ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 23;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 24;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\u003Ca" + (pug.attr("exec", "editColumn('" + column.column_name + "')", true, false)) + "\u003E";
;pug_debug_line = 24;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "Edit\u003C\u002Fa\u003E";
;pug_debug_line = 25;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + (null == (pug_interp = "&nbsp;") ? "" : pug_interp);
;pug_debug_line = 26;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\u003Ca" + (pug.attr("exec", "deleteColumn('" + column.column_name + "')", true, false)) + "\u003E";
;pug_debug_line = 26;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "Delete\u003C\u002Fa\u003E\n          \u003C\u002Ftd\u003E\n        \u003C\u002Ftr\u003E";
      }
    } else {
;pug_debug_line = 28;pug_debug_filename = "views\u002Fstructure_tab.jade";
if (!columns) {
;pug_debug_line = 29;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n        \u003Ctr\u003E";
;pug_debug_line = 30;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n          \u003Ctd collspan=\"7\"\u003E";
;pug_debug_line = 30;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "Error accured while getting table info\u003C\u002Ftd\u003E\n        \u003C\u002Ftr\u003E";
}
    }
  } else {
    var $$l = 0;
    for (var pug_index0 in $$obj) {
      $$l++;
      var column = $$obj[pug_index0];
;pug_debug_line = 16;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n        \u003Ctr\u003E";
;pug_debug_line = 17;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 17;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = column.column_name) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 18;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n          \u003Ctd" + (pug.attr("title", column_type_label(column), true, false)) + "\u003E";
;pug_debug_line = 18;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = column_type_label(column, true)) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 19;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 19;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = column.character_maximum_length) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 20;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 20;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = ('' + column.column_default).match(/^nextval/) ? 'auto increment' : column.column_default) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 21;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 21;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = column.is_primary_key ? 'yes' : '') ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 22;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 22;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = column.is_nullable == 'YES' || column.is_nullable == true ? 'yes' : 'no') ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 23;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 24;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\u003Ca" + (pug.attr("exec", "editColumn('" + column.column_name + "')", true, false)) + "\u003E";
;pug_debug_line = 24;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "Edit\u003C\u002Fa\u003E";
;pug_debug_line = 25;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + (null == (pug_interp = "&nbsp;") ? "" : pug_interp);
;pug_debug_line = 26;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\u003Ca" + (pug.attr("exec", "deleteColumn('" + column.column_name + "')", true, false)) + "\u003E";
;pug_debug_line = 26;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "Delete\u003C\u002Fa\u003E\n          \u003C\u002Ftd\u003E\n        \u003C\u002Ftr\u003E";
    }
    if ($$l === 0) {
;pug_debug_line = 28;pug_debug_filename = "views\u002Fstructure_tab.jade";
if (!columns) {
;pug_debug_line = 29;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n        \u003Ctr\u003E";
;pug_debug_line = 30;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n          \u003Ctd collspan=\"7\"\u003E";
;pug_debug_line = 30;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "Error accured while getting table info\u003C\u002Ftd\u003E\n        \u003C\u002Ftr\u003E";
}
    }
  }
}).call(this);

pug_html = pug_html + "\n      \u003C\u002Ftbody\u003E\n    \u003C\u002Ftable\u003E\n  \u003C\u002Fdiv\u003E\n\u003C\u002Fdiv\u003E";
;pug_debug_line = 32;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n\u003Cfooter\u003E";
;pug_debug_line = 33;pug_debug_filename = "views\u002Fstructure_tab.jade";
if (!is_mat_view) {
;pug_debug_line = 34;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n  \u003Cbutton class=\"native-look\" exec=\"addColumnForm\"\u003E";
;pug_debug_line = 34;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "Add column\u003C\u002Fbutton\u003E";
}
pug_html = pug_html + "\n\u003C\u002Ffooter\u003E";
;pug_debug_line = 36;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n\u003Ch4\u003E";
;pug_debug_line = 36;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "Indexes\u003C\u002Fh4\u003E";
;pug_debug_line = 38;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n\u003Cdiv class=\"rescol-wrapper with-borders indexes-list-table\"\u003E";
;pug_debug_line = 39;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n  \u003Cdiv class=\"rescol-header-wrapper\"\u003E\u003C\u002Fdiv\u003E";
;pug_debug_line = 40;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n  \u003Cdiv class=\"rescol-content-wrapper\"\u003E";
;pug_debug_line = 41;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n    \u003Ctable\u003E";
;pug_debug_line = 42;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n      \u003Cthead\u003E";
;pug_debug_line = 43;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n        \u003Ctr\u003E";
;pug_debug_line = 44;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n          \u003Cth\u003E";
;pug_debug_line = 44;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "name\u003C\u002Fth\u003E";
;pug_debug_line = 45;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n          \u003Cth\u003E";
;pug_debug_line = 45;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "p. key\u003C\u002Fth\u003E";
;pug_debug_line = 46;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n          \u003Cth\u003E";
;pug_debug_line = 46;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "uniq\u003C\u002Fth\u003E";
;pug_debug_line = 47;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n          \u003Cth\u003E";
;pug_debug_line = 47;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "columns\u003C\u002Fth\u003E";
;pug_debug_line = 48;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n          \u003Cth\u003E";
;pug_debug_line = 48;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "type\u003C\u002Fth\u003E";
;pug_debug_line = 49;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n          \u003Cth\u003E\u003C\u002Fth\u003E\n        \u003C\u002Ftr\u003E\n      \u003C\u002Fthead\u003E";
;pug_debug_line = 50;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n      \u003Ctbody\u003E";
;pug_debug_line = 51;pug_debug_filename = "views\u002Fstructure_tab.jade";
// iterate indexes
;(function(){
  var $$obj = indexes;
  if ('number' == typeof $$obj.length) {
      for (var pug_index1 = 0, $$l = $$obj.length; pug_index1 < $$l; pug_index1++) {
        var index = $$obj[pug_index1];
;pug_debug_line = 52;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n        \u003Ctr\u003E";
;pug_debug_line = 53;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 53;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = index.relname) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 54;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 54;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = index.indisprimary ? 'Yes' : 'No') ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 55;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 55;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = index.indisunique ? 'Yes' : 'No') ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 56;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 56;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = index.pg_get_indexdef.match(/ON [^\(]+\((.+)\)/)[1]) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 57;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 57;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = getIndexType(index.pg_get_indexdef)) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 58;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 59;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\u003Ca" + (pug.attr("exec", "deleteIndex('" + index.relname + "')", true, false)) + "\u003E";
;pug_debug_line = 59;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "Delete\u003C\u002Fa\u003E\u003C\u002Ftd\u003E\n        \u003C\u002Ftr\u003E";
      }
  } else {
    var $$l = 0;
    for (var pug_index1 in $$obj) {
      $$l++;
      var index = $$obj[pug_index1];
;pug_debug_line = 52;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n        \u003Ctr\u003E";
;pug_debug_line = 53;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 53;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = index.relname) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 54;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 54;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = index.indisprimary ? 'Yes' : 'No') ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 55;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 55;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = index.indisunique ? 'Yes' : 'No') ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 56;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 56;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = index.pg_get_indexdef.match(/ON [^\(]+\((.+)\)/)[1]) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 57;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 57;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = getIndexType(index.pg_get_indexdef)) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 58;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 59;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\u003Ca" + (pug.attr("exec", "deleteIndex('" + index.relname + "')", true, false)) + "\u003E";
;pug_debug_line = 59;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "Delete\u003C\u002Fa\u003E\u003C\u002Ftd\u003E\n        \u003C\u002Ftr\u003E";
    }
  }
}).call(this);

pug_html = pug_html + "\n      \u003C\u002Ftbody\u003E\n    \u003C\u002Ftable\u003E\n  \u003C\u002Fdiv\u003E\n\u003C\u002Fdiv\u003E";
;pug_debug_line = 61;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n\u003Cfooter\u003E";
;pug_debug_line = 62;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n  \u003Cbutton class=\"native-look\" exec=\"addIndexForm\"\u003E";
;pug_debug_line = 62;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "Add index\u003C\u002Fbutton\u003E\n\u003C\u002Ffooter\u003E";
;pug_debug_line = 64;pug_debug_filename = "views\u002Fstructure_tab.jade";
if (constraints.length > 0) {
;pug_debug_line = 65;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n\u003Ch4\u003E";
;pug_debug_line = 65;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "Constraints\u003C\u002Fh4\u003E";
;pug_debug_line = 66;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n\u003Cdiv class=\"rescol-wrapper with-borders indexes-list-table\"\u003E";
;pug_debug_line = 67;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n  \u003Cdiv class=\"rescol-header-wrapper\"\u003E\u003C\u002Fdiv\u003E";
;pug_debug_line = 68;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n  \u003Cdiv class=\"rescol-content-wrapper\"\u003E";
;pug_debug_line = 69;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n    \u003Ctable\u003E";
;pug_debug_line = 70;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n      \u003Cthead\u003E";
;pug_debug_line = 71;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n        \u003Ctr\u003E";
;pug_debug_line = 72;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n          \u003Cth\u003E";
;pug_debug_line = 72;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "name\u003C\u002Fth\u003E";
;pug_debug_line = 73;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n          \u003Cth\u003E";
;pug_debug_line = 73;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "source\u003C\u002Fth\u003E";
;pug_debug_line = 74;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n          \u003Cth\u003E\u003C\u002Fth\u003E\n        \u003C\u002Ftr\u003E\n      \u003C\u002Fthead\u003E";
;pug_debug_line = 75;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n      \u003Ctbody\u003E";
;pug_debug_line = 76;pug_debug_filename = "views\u002Fstructure_tab.jade";
// iterate constraints
;(function(){
  var $$obj = constraints;
  if ('number' == typeof $$obj.length) {
      for (var pug_index2 = 0, $$l = $$obj.length; pug_index2 < $$l; pug_index2++) {
        var constraint = $$obj[pug_index2];
;pug_debug_line = 77;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n        \u003Ctr\u003E";
;pug_debug_line = 78;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 78;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = constraint.conname) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 79;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 79;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = constraint.pretty_source) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 80;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 81;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\u003Ca" + (pug.attr("exec", "deleteConstraint('" + constraint.conname + "')", true, false)) + "\u003E";
;pug_debug_line = 81;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "Delete\u003C\u002Fa\u003E\u003C\u002Ftd\u003E\n        \u003C\u002Ftr\u003E";
      }
  } else {
    var $$l = 0;
    for (var pug_index2 in $$obj) {
      $$l++;
      var constraint = $$obj[pug_index2];
;pug_debug_line = 77;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n        \u003Ctr\u003E";
;pug_debug_line = 78;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 78;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = constraint.conname) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 79;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 79;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = constraint.pretty_source) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 80;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 81;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "\u003Ca" + (pug.attr("exec", "deleteConstraint('" + constraint.conname + "')", true, false)) + "\u003E";
;pug_debug_line = 81;pug_debug_filename = "views\u002Fstructure_tab.jade";
pug_html = pug_html + "Delete\u003C\u002Fa\u003E\u003C\u002Ftd\u003E\n        \u003C\u002Ftr\u003E";
    }
  }
}).call(this);

pug_html = pug_html + "\n      \u003C\u002Ftbody\u003E\n    \u003C\u002Ftable\u003E\n  \u003C\u002Fdiv\u003E\n\u003C\u002Fdiv\u003E";
}}.call(this,"column_type_label" in locals_for_with?locals_for_with.column_type_label:typeof column_type_label!=="undefined"?column_type_label:undefined,"columns" in locals_for_with?locals_for_with.columns:typeof columns!=="undefined"?columns:undefined,"constraints" in locals_for_with?locals_for_with.constraints:typeof constraints!=="undefined"?constraints:undefined,"getIndexType" in locals_for_with?locals_for_with.getIndexType:typeof getIndexType!=="undefined"?getIndexType:undefined,"indexes" in locals_for_with?locals_for_with.indexes:typeof indexes!=="undefined"?indexes:undefined,"is_mat_view" in locals_for_with?locals_for_with.is_mat_view:typeof is_mat_view!=="undefined"?is_mat_view:undefined));} catch (err) {pug.rethrow(err, pug_debug_filename, pug_debug_line, pug_debug_sources[pug_debug_filename]);};return pug_html;};
exports["structure_tab"].content = ".rescol-wrapper.with-borders.columns-list-table\n  .rescol-header-wrapper\n  .rescol-content-wrapper\n    table\n      thead\n        tr\n          th column\n          th type\n          th max length\n          th default\n          th primary key\n          th null\n          th\n      tbody\n        each column in columns || []\n          tr\n            td= column.column_name\n            td(title = column_type_label(column))= column_type_label(column, true)\n            td= column.character_maximum_length\n            td= ('' + column.column_default).match(/^nextval/) ? 'auto increment' : column.column_default\n            td= column.is_primary_key ? 'yes' : ''\n            td= column.is_nullable == 'YES' || column.is_nullable == true ? 'yes' : 'no'\n            td\n              a(exec=\"editColumn('\" + column.column_name + \"')\") Edit\n              != \"&nbsp;\"\n              a(exec=\"deleteColumn('\" + column.column_name + \"')\") Delete\n        else\n          if !columns\n            tr\n              td(collspan=7) Error accured while getting table info\n\nfooter\n  if !is_mat_view\n    button.native-look(exec=\"addColumnForm\") Add column\n\nh4 Indexes\n\n.rescol-wrapper.with-borders.indexes-list-table\n  .rescol-header-wrapper\n  .rescol-content-wrapper\n    table\n      thead\n        tr\n          th name\n          th p. key\n          th uniq\n          th columns\n          th type\n          th\n      tbody\n        each index in indexes\n          tr\n            td= index.relname\n            td= index.indisprimary ? 'Yes' : 'No'\n            td= index.indisunique ? 'Yes' : 'No'\n            td= index.pg_get_indexdef.match(/ON [^\\(]+\\((.+)\\)/)[1]\n            td= getIndexType(index.pg_get_indexdef)\n            td\n              a(exec=\"deleteIndex('\" + index.relname + \"')\") Delete\n\nfooter\n  button.native-look(exec=\"addIndexForm\") Add index\n\nif constraints.length > 0\n  h4 Constraints\n  .rescol-wrapper.with-borders.indexes-list-table\n    .rescol-header-wrapper\n    .rescol-content-wrapper\n      table\n        thead\n          tr\n            th name\n            th source\n            th\n        tbody\n          each constraint in constraints\n            tr\n              td= constraint.conname\n              td= constraint.pretty_source\n              td\n                a(exec=\"deleteConstraint('\" + constraint.conname + \"')\") Delete\n";
exports["users_tab"] = function template(pug, locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {var pug_debug_sources = {"views\u002Fusers_tab.jade":".rescol-wrapper.with-borders\n  .rescol-header-wrapper\n  .rescol-content-wrapper\n    table\n      thead\n        tr\n          th Role name\n          th List of roles\n          th Member of\n          th(style=\"max-width: 250px\") Owned Databases\n          th\n      tbody\n        each user in rows\n          tr\n            td\n              if currentUser == user.rolname\n                strong= user.rolname\n                br\n                small (current user)\n              else\n                = user.rolname\n            td(style=\"max-width: 180px\")= user.roles.join(', ')\n            td= user.memberof\n            td(style=\"max-width: 250px\")= user.owned_dbs\n            td\n              a(exec=\"editUser('\" + user.rolname + \"')\") Edit\n              = \" \"\n              a(exec=\"deleteUser('\" + user.rolname + \"')\") Delete\n\nfooter\n  button.native-look.createUserBtn(exec=\"newUserDialog\") Create new user\n  \u002F\u002Fbutton.native-look.createRoleBtn(exec=\"newRole\") Create new role"};
;var locals_for_with = (locals || {});(function (currentUser, rows) {var pug_indent = [];
;pug_debug_line = 1;pug_debug_filename = "views\u002Fusers_tab.jade";
pug_html = pug_html + "\n\u003Cdiv class=\"rescol-wrapper with-borders\"\u003E";
;pug_debug_line = 2;pug_debug_filename = "views\u002Fusers_tab.jade";
pug_html = pug_html + "\n  \u003Cdiv class=\"rescol-header-wrapper\"\u003E\u003C\u002Fdiv\u003E";
;pug_debug_line = 3;pug_debug_filename = "views\u002Fusers_tab.jade";
pug_html = pug_html + "\n  \u003Cdiv class=\"rescol-content-wrapper\"\u003E";
;pug_debug_line = 4;pug_debug_filename = "views\u002Fusers_tab.jade";
pug_html = pug_html + "\n    \u003Ctable\u003E";
;pug_debug_line = 5;pug_debug_filename = "views\u002Fusers_tab.jade";
pug_html = pug_html + "\n      \u003Cthead\u003E";
;pug_debug_line = 6;pug_debug_filename = "views\u002Fusers_tab.jade";
pug_html = pug_html + "\n        \u003Ctr\u003E";
;pug_debug_line = 7;pug_debug_filename = "views\u002Fusers_tab.jade";
pug_html = pug_html + "\n          \u003Cth\u003E";
;pug_debug_line = 7;pug_debug_filename = "views\u002Fusers_tab.jade";
pug_html = pug_html + "Role name\u003C\u002Fth\u003E";
;pug_debug_line = 8;pug_debug_filename = "views\u002Fusers_tab.jade";
pug_html = pug_html + "\n          \u003Cth\u003E";
;pug_debug_line = 8;pug_debug_filename = "views\u002Fusers_tab.jade";
pug_html = pug_html + "List of roles\u003C\u002Fth\u003E";
;pug_debug_line = 9;pug_debug_filename = "views\u002Fusers_tab.jade";
pug_html = pug_html + "\n          \u003Cth\u003E";
;pug_debug_line = 9;pug_debug_filename = "views\u002Fusers_tab.jade";
pug_html = pug_html + "Member of\u003C\u002Fth\u003E";
;pug_debug_line = 10;pug_debug_filename = "views\u002Fusers_tab.jade";
pug_html = pug_html + "\n          \u003Cth style=\"max-width: 250px;\"\u003E";
;pug_debug_line = 10;pug_debug_filename = "views\u002Fusers_tab.jade";
pug_html = pug_html + "Owned Databases\u003C\u002Fth\u003E";
;pug_debug_line = 11;pug_debug_filename = "views\u002Fusers_tab.jade";
pug_html = pug_html + "\n          \u003Cth\u003E\u003C\u002Fth\u003E\n        \u003C\u002Ftr\u003E\n      \u003C\u002Fthead\u003E";
;pug_debug_line = 12;pug_debug_filename = "views\u002Fusers_tab.jade";
pug_html = pug_html + "\n      \u003Ctbody\u003E";
;pug_debug_line = 13;pug_debug_filename = "views\u002Fusers_tab.jade";
// iterate rows
;(function(){
  var $$obj = rows;
  if ('number' == typeof $$obj.length) {
      for (var pug_index0 = 0, $$l = $$obj.length; pug_index0 < $$l; pug_index0++) {
        var user = $$obj[pug_index0];
;pug_debug_line = 14;pug_debug_filename = "views\u002Fusers_tab.jade";
pug_html = pug_html + "\n        \u003Ctr\u003E";
;pug_debug_line = 15;pug_debug_filename = "views\u002Fusers_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 16;pug_debug_filename = "views\u002Fusers_tab.jade";
if (currentUser == user.rolname) {
;pug_debug_line = 17;pug_debug_filename = "views\u002Fusers_tab.jade";
pug_html = pug_html + "\u003Cstrong\u003E";
;pug_debug_line = 17;pug_debug_filename = "views\u002Fusers_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = user.rolname) ? "" : pug_interp)) + "\u003C\u002Fstrong\u003E";
;pug_debug_line = 18;pug_debug_filename = "views\u002Fusers_tab.jade";
pug_html = pug_html + "\u003Cbr\u002F\u003E";
;pug_debug_line = 19;pug_debug_filename = "views\u002Fusers_tab.jade";
pug_html = pug_html + "\u003Csmall\u003E";
;pug_debug_line = 19;pug_debug_filename = "views\u002Fusers_tab.jade";
pug_html = pug_html + "(current user)\u003C\u002Fsmall\u003E";
}
else {
;pug_debug_line = 21;pug_debug_filename = "views\u002Fusers_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = user.rolname) ? "" : pug_interp));
}
pug_html = pug_html + "\n          \u003C\u002Ftd\u003E";
;pug_debug_line = 22;pug_debug_filename = "views\u002Fusers_tab.jade";
pug_html = pug_html + "\n          \u003Ctd style=\"max-width: 180px;\"\u003E";
;pug_debug_line = 22;pug_debug_filename = "views\u002Fusers_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = user.roles.join(', ')) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 23;pug_debug_filename = "views\u002Fusers_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 23;pug_debug_filename = "views\u002Fusers_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = user.memberof) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 24;pug_debug_filename = "views\u002Fusers_tab.jade";
pug_html = pug_html + "\n          \u003Ctd style=\"max-width: 250px;\"\u003E";
;pug_debug_line = 24;pug_debug_filename = "views\u002Fusers_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = user.owned_dbs) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 25;pug_debug_filename = "views\u002Fusers_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 26;pug_debug_filename = "views\u002Fusers_tab.jade";
pug_html = pug_html + "\u003Ca" + (pug.attr("exec", "editUser('" + user.rolname + "')", true, false)) + "\u003E";
;pug_debug_line = 26;pug_debug_filename = "views\u002Fusers_tab.jade";
pug_html = pug_html + "Edit\u003C\u002Fa\u003E";
;pug_debug_line = 27;pug_debug_filename = "views\u002Fusers_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = " ") ? "" : pug_interp));
;pug_debug_line = 28;pug_debug_filename = "views\u002Fusers_tab.jade";
pug_html = pug_html + "\u003Ca" + (pug.attr("exec", "deleteUser('" + user.rolname + "')", true, false)) + "\u003E";
;pug_debug_line = 28;pug_debug_filename = "views\u002Fusers_tab.jade";
pug_html = pug_html + "Delete\u003C\u002Fa\u003E\n          \u003C\u002Ftd\u003E\n        \u003C\u002Ftr\u003E";
      }
  } else {
    var $$l = 0;
    for (var pug_index0 in $$obj) {
      $$l++;
      var user = $$obj[pug_index0];
;pug_debug_line = 14;pug_debug_filename = "views\u002Fusers_tab.jade";
pug_html = pug_html + "\n        \u003Ctr\u003E";
;pug_debug_line = 15;pug_debug_filename = "views\u002Fusers_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 16;pug_debug_filename = "views\u002Fusers_tab.jade";
if (currentUser == user.rolname) {
;pug_debug_line = 17;pug_debug_filename = "views\u002Fusers_tab.jade";
pug_html = pug_html + "\u003Cstrong\u003E";
;pug_debug_line = 17;pug_debug_filename = "views\u002Fusers_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = user.rolname) ? "" : pug_interp)) + "\u003C\u002Fstrong\u003E";
;pug_debug_line = 18;pug_debug_filename = "views\u002Fusers_tab.jade";
pug_html = pug_html + "\u003Cbr\u002F\u003E";
;pug_debug_line = 19;pug_debug_filename = "views\u002Fusers_tab.jade";
pug_html = pug_html + "\u003Csmall\u003E";
;pug_debug_line = 19;pug_debug_filename = "views\u002Fusers_tab.jade";
pug_html = pug_html + "(current user)\u003C\u002Fsmall\u003E";
}
else {
;pug_debug_line = 21;pug_debug_filename = "views\u002Fusers_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = user.rolname) ? "" : pug_interp));
}
pug_html = pug_html + "\n          \u003C\u002Ftd\u003E";
;pug_debug_line = 22;pug_debug_filename = "views\u002Fusers_tab.jade";
pug_html = pug_html + "\n          \u003Ctd style=\"max-width: 180px;\"\u003E";
;pug_debug_line = 22;pug_debug_filename = "views\u002Fusers_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = user.roles.join(', ')) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 23;pug_debug_filename = "views\u002Fusers_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 23;pug_debug_filename = "views\u002Fusers_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = user.memberof) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 24;pug_debug_filename = "views\u002Fusers_tab.jade";
pug_html = pug_html + "\n          \u003Ctd style=\"max-width: 250px;\"\u003E";
;pug_debug_line = 24;pug_debug_filename = "views\u002Fusers_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = user.owned_dbs) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 25;pug_debug_filename = "views\u002Fusers_tab.jade";
pug_html = pug_html + "\n          \u003Ctd\u003E";
;pug_debug_line = 26;pug_debug_filename = "views\u002Fusers_tab.jade";
pug_html = pug_html + "\u003Ca" + (pug.attr("exec", "editUser('" + user.rolname + "')", true, false)) + "\u003E";
;pug_debug_line = 26;pug_debug_filename = "views\u002Fusers_tab.jade";
pug_html = pug_html + "Edit\u003C\u002Fa\u003E";
;pug_debug_line = 27;pug_debug_filename = "views\u002Fusers_tab.jade";
pug_html = pug_html + (pug.escape(null == (pug_interp = " ") ? "" : pug_interp));
;pug_debug_line = 28;pug_debug_filename = "views\u002Fusers_tab.jade";
pug_html = pug_html + "\u003Ca" + (pug.attr("exec", "deleteUser('" + user.rolname + "')", true, false)) + "\u003E";
;pug_debug_line = 28;pug_debug_filename = "views\u002Fusers_tab.jade";
pug_html = pug_html + "Delete\u003C\u002Fa\u003E\n          \u003C\u002Ftd\u003E\n        \u003C\u002Ftr\u003E";
    }
  }
}).call(this);

pug_html = pug_html + "\n      \u003C\u002Ftbody\u003E\n    \u003C\u002Ftable\u003E\n  \u003C\u002Fdiv\u003E\n\u003C\u002Fdiv\u003E";
;pug_debug_line = 30;pug_debug_filename = "views\u002Fusers_tab.jade";
pug_html = pug_html + "\n\u003Cfooter\u003E";
;pug_debug_line = 31;pug_debug_filename = "views\u002Fusers_tab.jade";
pug_html = pug_html + "\n  \u003Cbutton class=\"native-look createUserBtn\" exec=\"newUserDialog\"\u003E";
;pug_debug_line = 31;pug_debug_filename = "views\u002Fusers_tab.jade";
pug_html = pug_html + "Create new user\u003C\u002Fbutton\u003E";
;pug_debug_line = 32;pug_debug_filename = "views\u002Fusers_tab.jade";
pug_html = pug_html + "\n  \u003C!--button.native-look.createRoleBtn(exec=\"newRole\") Create new role--\u003E\n\u003C\u002Ffooter\u003E";}.call(this,"currentUser" in locals_for_with?locals_for_with.currentUser:typeof currentUser!=="undefined"?currentUser:undefined,"rows" in locals_for_with?locals_for_with.rows:typeof rows!=="undefined"?rows:undefined));} catch (err) {pug.rethrow(err, pug_debug_filename, pug_debug_line, pug_debug_sources[pug_debug_filename]);};return pug_html;};
exports["users_tab"].content = ".rescol-wrapper.with-borders\n  .rescol-header-wrapper\n  .rescol-content-wrapper\n    table\n      thead\n        tr\n          th Role name\n          th List of roles\n          th Member of\n          th(style=\"max-width: 250px\") Owned Databases\n          th\n      tbody\n        each user in rows\n          tr\n            td\n              if currentUser == user.rolname\n                strong= user.rolname\n                br\n                small (current user)\n              else\n                = user.rolname\n            td(style=\"max-width: 180px\")= user.roles.join(', ')\n            td= user.memberof\n            td(style=\"max-width: 250px\")= user.owned_dbs\n            td\n              a(exec=\"editUser('\" + user.rolname + \"')\") Edit\n              = \" \"\n              a(exec=\"deleteUser('\" + user.rolname + \"')\") Delete\n\nfooter\n  button.native-look.createUserBtn(exec=\"newUserDialog\") Create new user\n  //button.native-look.createRoleBtn(exec=\"newRole\") Create new role";
