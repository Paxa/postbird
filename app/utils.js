$u.formValues = function (selector_or_el) {
  var paramObj = {};
  $u.each($u(selector_or_el).serializeArray(), function(_, kv) {
    paramObj[kv.name] = kv.value;
  });

  return paramObj;
};

$u.stopEvent = function (e) {
  e && e.preventDefault();
};

$u.buildOption = function (label, value, options) {
  if (options == undefined && typeof value == 'object') {
    options = value;
    value = label;
  }

  if (!options) options = {};
  if (value) options.value = value;

  return $dom(['option', label, options]);
}