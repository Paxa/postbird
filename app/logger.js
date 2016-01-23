var sprintf = require("sprintf-js").sprintf;

var log_levels = ['emergency', 'alert', 'critical', 'error', 'warning', 'notice', 'info', 'debug'];

var remote = require('electron').remote;
var topProcess = remote ? remote.process : process;

function Logger (level) {
  this.logLevel = level;
};

!function (proto) {

  log_levels.forEach(function(level) {
    proto[level] = function (message) {
      this.write(level, arguments);
    };
  });

  proto.print = function Logger_print (string) {
    topProcess.stdout.write(string);
  };

  proto.write = function (level, mesg_args) {
    if (log_levels.indexOf(level) <= log_levels.indexOf(this.logLevel)) {
      var messages = [];
      for (var i = 0; i < mesg_args.length; i++) {
        message = mesg_args[i];
        if (typeof message == 'object') {
          message = node.util.inspect(message, {depth: 5});
        }
        messages.push(String(message));
      }
      var message = messages.join(' ');

      line = sprintf("%s %s\n", level.toUpperCase(), message);
      this.print(line);
    }
  };
}(Logger.prototype);

Logger.make = function (level) {
  return (new Logger(level));
};

module.exports = Logger;