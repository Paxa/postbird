process.on("uncaughtException", function(exception) {

/*
  setTimeout(function () {
    var raven = require('raven');
    var ravenKey =  "https://ebd4996bad984918aae929ea5b1163dc:" + 
                    "df24deda78b9486e907f041c5b8362ac@app.getsentry.com/38784";

    var client = new raven.Client(ravenKey);

    var extra = {
      user: global.process.env.USER,
      pwd: global.process.env.PWD,
      arch: global.process.arch
    };
    var exec = global.node.child_process.exec;
    exec('sw_vers -productVersion', function (error, stdout, stderr) {
      extra.system = stdout;

      client.captureError(err, {extra: extra}, function () {
        console.log("Notified");
      });
    });
  });
*/

  //Object.ls(err);

  setTimeout(function () {
    var rollbar = require("rollbar");
    rollbar.init("6cc6deeda15a40abb573541976dd2fbd");

    var extra = {
      user: global.process.env.USER,
      pwd: global.process.env.PWD,
      arch: global.process.arch
    };
    var exec = global.node.child_process.exec;
    exec('sw_vers -productVersion', function (err, stdout, stderr) {
      extra.system = stdout;

      rollbar.handleErrorWithPayloadData(exception, {custom: extra}, function(err2) {
        if (err2) {
          global.log.error('rollbar error: ', err2.message);
        }
      });
    });
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