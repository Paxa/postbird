var ObjectKit = require('./object_extras');

var buildStr = function (pattern, options) {
  var result = pattern;
  ObjectKit.forEach(options, function(key, value) {
    result = result.replace(new RegExp('%' + key, 'g'), value);
  });
  return result;
};

var puts = function (str, options) {
  var result = options ? buildStr(str, options) : str;
  process.stdout.write(result + "\n");
};

process.on("uncaughtException", function(err) {
  var headers = [];

  var lines = err.stack.split("\n").map(function(line) {
    var m = line.match(/^\s+at (.*) \((.+):(\d+):(\d+)\)$/);
    if (!m) headers.push(line);
    return m && { funcName: m[1], file: m[2], line: m[3], column: m[4] };
  });

  lines = lines.filter(function (el) { return !!el; });

  //var message = err.stack.split("\n")[0];
  var message = 'message' in err ? err.message : headers.join("\n");

  puts(err.name + ": " + message);

  lines.forEach(function(line) {
    puts("        from %file:%line:in %funcName", line);
  });
});
