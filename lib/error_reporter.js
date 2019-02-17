global.log = require('../app/logger').make('info');
var child_process = require('child_process');

var errorReporter = module.exports = function errorReporter(exception, showError = true) {
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
    console.error(exception);
    log.info(`Sending error report ~ ${exception}`);

    if (exception.client) {
      exception.client = "CUT!";
    }

    var Raven = require('raven');
    Raven.config('https://07fa68e1ac02484e9370fc9f0b77631f:2d27d42ff1514d4390500c8633a89442@sentry.io/143647', {
      logger: 'default',
      allowSecretKey: true,
      transport: {
        send(client, message, headers, eventId, cb) {
          setTimeout(() => {
            try {
              var net = require('electron').remote.net;
              var request = net.request({
                method: 'POST',
                protocol: 'https:',
                hostname: client.dsn.host,
                path: client.dsn.path + 'api/' + client.dsn.project_id + '/store/',
                headers: headers,
                port: 443
              });

              request.on('error', (error) => {
                console.error(error);
              });

              request.on('abort', (error) => {
                console.error('abort', error);
              });

              request.on('response', (res, a, b) => {
                console.log('Error reported');
              });

              request.end(message);

              window.ERR_REQ = request;
            } catch (error) {
              console.error(error);
            }
          }, 100);
        }
      }
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
      exception.message = `${extra.version} - ${exception.message}`;
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
      var exec = child_process.exec;
      exec('sw_vers -productVersion', function (err, stdout) {
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

  if (showError) {
    if (exception instanceof Error) {
      window.alert(exception.message + "\n" + exception.stack);
    } else {
      window.alert(exception);
    }
  }
  return false;
};

process.on("uncaughtException", errorReporter);