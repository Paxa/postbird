var express = require('express');
var rollbar = require('../rollbar');

var app = express();

app.get('/', function(req, res) {
  req.user_id = "test-user";
  throw new Error('Hello World');
});

app.use(rollbar.errorHandler("ACCESS_TOKEN",
                             {environment: 'playground'}));

console.log('browse to http://localhost:9876/ then go to your rollbar account: http://rollbar.com/');
app.listen(9876);
