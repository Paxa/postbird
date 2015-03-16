var rollbar = require('../rollbar');

var accessToken = "ACCESS_TOKEN";
rollbar.init(accessToken, {environment: 'playground'});
rollbar.handleUncaughtExceptions();

function foo() {
  return bar();
}

foo();
