var sprintf = require("sprintf-js").sprintf;
var util = require('util');
var remote = require('electron').remote;
var topProcess = remote ? remote.process : process;

var LOG_LEVELS = ['emergency', 'alert', 'critical', 'error', 'warning', 'notice', 'info', 'debug'];

class Logger {
  /*::
    logLevel: string
  */

  constructor (level) {
    this.logLevel = level;
  }

  static make (level) {
    return new Logger(level);
  }

  print (string) {
    topProcess.stdout.write(string);
  }

  emergency(...messageArgs) { this.write('emergency', messageArgs); }
  alert(...messageArgs)     { this.write('alert', messageArgs); }
  critical(...messageArgs)  { this.write('critical', messageArgs); }
  error(...messageArgs)     { this.write('error', messageArgs); }
  warning(...messageArgs)   { this.write('warning', messageArgs); }
  notice(...messageArgs)    { this.write('notice', messageArgs); }
  info(...messageArgs)      { this.write('info', messageArgs); }
  debug(...messageArgs)     { this.write('debug', messageArgs); }

  write (level, mesg_args) {
    if (LOG_LEVELS.indexOf(level) <= LOG_LEVELS.indexOf(this.logLevel)) {
      var messages = [];
      for (var i = 0; i < mesg_args.length; i++) {
        var message = mesg_args[i];
        if (typeof message == 'object') {
          message = util.inspect(message, {depth: 5});
        }
        messages.push(String(message));
      }
      message = messages.join(' ');

      var line = sprintf("%s %s\n", level.toUpperCase(), message);
      this.print(line);
    }
  }
}

module.exports = Logger;