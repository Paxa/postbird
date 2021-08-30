var colors = require('colors/safe');

var initSentry = function initSentry() {
  if (process.env.POSTBIRD_DEV != "true") {
    var Sentry = require('@sentry/electron');
    var integrationsPkg = require("@sentry/integrations");
    Sentry.init({
      dsn: 'https://07fa68e1ac02484e9370fc9f0b77631f:2d27d42ff1514d4390500c8633a89442@sentry.io/143647',
      debug: false,
      appName: 'Postbird',
      integrations: function(integrations) {
        integrations.push(new integrationsPkg.Dedupe());
        return integrations;
      },
      beforeBreadcrumb(breadcrumb, hint) {
        return null;
      },
    });
  }
}

var errorReporter = function errorReporter(exception /*: PgError */, showError = true) {
  setTimeout(function () {
    // skip errors while developing
    if (process.env.POSTBIRD_DEV == "true") {
      logger.info("Skip error reporting");
      logger.info(exception.stack);
      try {
        console.log("Skip error reporting");
        console.error(exception.stack);
      } catch (e) {
        logger.info(e.message);
      }
      return;
    }

    if (
      exception.message.includes("server closed the connection unexpectedly") ||
      exception.message.includes("Unable to set non-blocking to true") ||
      exception.message.includes("Client has encountered a connection error and is not queryable") ||
      exception.message.includes("Connection terminated") ||
      exception.message.includes("current transaction is aborted,")
    ) {
      console.log("Skip error reporting");
      console.error(exception.stack);
      return;
    }

    console.log("Sending error report");
    console.error(exception);
    logger.info(`Sending error report ~ ${exception}`);

    if (exception.client) {
      exception.client = "CUT!";
    }

    // initSentry();
    var Sentry = require('@sentry/electron');
    var electron = require('electron');

    var extra /*: any */ = {
      arch: global.process.arch,
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

    if (global.App.currentTab) {
      extra.appTab = global.App.currentTab.name;
      extra.appPane = global.App.currentTab.instance.currentTab;
    }

    Sentry.configureScope(scope => {
      scope.setExtra('user', extra);
    });
    Sentry.captureException(exception);
  });

  if (global.logger) {
    global.logger.error('error: ', colors.red(exception.message || exception.toString()));
    global.logger.info(exception.stack);
  } else {
    console.log('error: ', exception);
    console.log(exception.stack);
  }

  if (showError) {
    try {
      if (exception instanceof Error) {
        window.alert(exception.message + "\n" + exception.stack);
      } else {
        window.alert(exception);
      }
    } catch (e) {
      console.log("can not show error", e);
    }
  }
  return false;
};

errorReporter.init = initSentry;

process.on("uncaughtException", errorReporter);
module.exports = errorReporter;