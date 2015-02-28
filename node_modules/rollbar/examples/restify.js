var restify = require('restify');
var rollbar = require('rollbar');

rollbar.init('ACCESS_TOKEN', {environment: 'playground'});

var server = restify.createServer();
server.get('/breakme', function(req, res, next) {
  console.log('Breaking...');
  var a = b;
});

server.on('uncaughtException', function(req, res, route, err) {
  res.send(err);
  rollbar.handleError(err, req);
});

console.log('browse to http://localhost:8080/breakme then go to your rollbar account: http://rollbar.com/');
server.listen(8080);
