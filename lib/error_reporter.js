global.log = require('../app/logger').make('info');

var errorReporter = module.exports = function errorReporter(exception) {
  setTimeout(function () {
    // skip errors while developing
    if (process.env.NW_DEV == "true") {
      log.info("Skip error reporting");
      log.info(exception.stack);
      try {
        console.log("Skip error reporting");
        console.error(exception.stack);
      } catch (e) {
        log.info(e.message);
      }
      return;
    }

    console.log("Sending error report");
    log.info("Sending error report");

    var Raven = require('raven');
    Raven.config('https://07fa68e1ac02484e9370fc9f0b77631f:2d27d42ff1514d4390500c8633a89442@sentry.io/143647', {
      logger: 'default'
    }).install();

    var electron = require('electron');
    var electronVersion;
    try {
      electronVersion = electron.remote.process.versions.electron;
    } catch (e) {
      console.error(e.stack);
    }

    var extra = {
      user: global.process.env.USER,
      pwd: global.process.env.PWD,
      arch: global.process.arch,
      version_el: electronVersion
    };

    try {
      extra.version = electron.remote.app.getVersion();
    } catch (error) {
      console.log("Error generatign error report");
      console.error(error);
    }

    try {
      extra.version_pg = global.Connection.instances.map(function (i) { return i._serverVersion; }).join(";; ");
    } catch (error) {
      console.log("Error generatign error report");
      console.error(error);
    }

    var sender = function () {
      Raven.setContext({user: extra});
      Raven.captureException(exception);
    };

    if (process.platform == "darwin") {
      var exec = global.node.child_process.exec;
      exec('sw_vers -productVersion', function (err, stdout, stderr) {
        extra.system = stdout;
        sender();
      });
    } else {
      sender();
    }
  });

  if (global.log) {
    global.log.error('error: ', global.node.colors.red(exception.msg || exception.toString()));
    global.log && global.log.info(exception.stack);
  } else {
    console.log('error: ', exception);
    console.log(exception.stack);
  }

  if (exception instanceof Error) {
    window.alert(exception.message + "\n" + exception.stack);
  } else {
    window.alert(exception);
  }
  return false;
};

process.on("uncaughtException", errorReporter);