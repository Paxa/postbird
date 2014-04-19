var sprintf = require("sprintf-js").sprintf;

var log_levels = ['emergency', 'alert', 'critical', 'error', 'warning', 'notice', 'info', 'debug'];

function Logger (level) {
  this.logLevel = level;
};

!function (proto) {

  log_levels.forEach(function(level) {
    proto[level] = function (message) {
      this.write(level, arguments);
    };
  });

  proto.write = function (level, mesg_args) {
    if (log_levels.indexOf(level) <= log_levels.indexOf(this.logLevel)) {
      var messages = [];
      for (var i = 0; i < mesg_args.length; i++) {
        messages.push(String(mesg_args[i]));
      }
      var message = messages.join(' ');

      line = sprintf("%s %s\n", level.toUpperCase(), message);
      process.stdout.write(line);
    }
  };
}(Logger.prototype);

Logger.make = function (level) {
  return (new Logger(level));
};

module.exports = Logger;