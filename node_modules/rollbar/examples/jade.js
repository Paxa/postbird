var express = require('express');
var rollbar = require('../rollbar');

var app = express();
app.set('view engine', 'jade');

app.get('/', function(req, res) {
  return res.render('jadetest', {breakme: true});
});

app.use(rollbar.errorHandler("ACCESS_TOKEN",
                             {environment: 'playground'}));

console.log('browse to http://localhost:9876/ then go to your rollbar account: http://rollbar.com/');
app.listen(9876);
