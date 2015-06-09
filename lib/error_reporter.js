process.on("uncaughtException", function(exception) {
  setTimeout(function () {
    // skip errors while developing
    if (process.env.NW_DEV == "true") {
      console.error(exception);
      return;
    }

    var rollbar = require("rollbar");
    rollbar.init("6cc6deeda15a40abb573541976dd2fbd");

    var extra = {
      user: global.process.env.USER,
      pwd: global.process.env.PWD,
      arch: global.process.arch,
      version_nw: process.versions['node-webkit']
    };

    try {
      extra.version = gui.App.manifest.version;
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
      rollbar.handleErrorWithPayloadData(exception, {custom: extra}, function(err2) {
        if (err2) {
          global.log.error('rollbar error: ', err2.message);
        }
      });
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

  window.alert(exception);
  return false;
});