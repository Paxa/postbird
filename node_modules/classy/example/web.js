var Classy = require("../classy");
require("./sync_utils");
global.Fiber = require('fibers');

/*

var express = require('express');
var bodyParser = require('body-parser');

var app = express();

//app.set('port', process.env.PORT || 13000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

//app.use(bodyParser());
//app.use(app.router);

//app.use(express.logger('dev'));
//app.use(express.bodyParser());
//app.use(express.methodOverride());
//app.use(express.cookieParser('your secret here'));
//app.use(express.session());

app.get('/', function(req, res) {
  setTimeout(function() {
    Fiber.current.run();
  }, 300);
  Fiber.yield();
  res.send('Hello World');
});

Fiber(function () {
  console.log('running on port %s', 13000);
  app.listen(13000);
}).run();

*/

var http = require("http");

var server = http.createServer(function(request, response) {
  /*
  Fiber(function () {
    var fiber = Fiber.current;
    setTimeout(function() {
      fiber.run();
    }, 300);
    Fiber.yield();

    response.writeHead(200, {"Content-Type": "text/html"});
    response.write("<!DOCTYPE \"html\">");
    response.write("<html>");
    response.write("<head>");
    response.write("<title>Hello World Page</title>");
    response.write("</head>");
    response.write("<body>");
    response.write("Hello World!");
    response.write("</body>");
    response.write("</html>");
    response.end();
  }).run();
  */
  setTimeout(function() {
    response.writeHead(200, {"Content-Type": "text/html"});
    response.write("<!DOCTYPE \"html\">");
    response.write("<html>");
    response.write("<head>");
    response.write("<title>Hello World Page</title>");
    response.write("</head>");
    response.write("<body>");
    response.write("Hello World!");
    response.write("</body>");
    response.write("</html>");
    response.end();
  }, 300);
});


server.listen(8080);
console.log("Server is listening");