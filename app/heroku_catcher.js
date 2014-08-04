var spawn = require('child_process').spawn;
var http = require('http');
var url = require('url');
var querystring = require('querystring');

global.HerokuClient = {
  secret: 'da22247b-a5b0-498e-8110-5812d65f74c3',

  setRequestToken: function (value) {
    console.log('setting heroku key ' + value);
    window.localStorage.herokuKey = value;
  },

  getRequestToken: function () {
    return window.localStorage.herokuKey;
  },

  makeAuthUrl: function () {
    var url = 'https://id.heroku.com/oauth/authorize?client_id={secret}&response_type=code&scope=global&state={rand}';
    return url.replace('{secret}', this.secret).replace('{rand}', new Date().getTime().toString());
  },

  auth: function (callback) {
    if (this.getRequestToken()) {
      callback();
    } else {
      var url = this.makeAuthUrl();
      if (this.catcher) this.catcher.stop();
      this.catcher = new HerokuCatcher(callback);
      this.catcher.start();
      console.log("Opening url " + url);
      spawn('open', [url]);
    }
  },

  getAccessToken: function () {
    // https://id.heroku.com/oauth/token \
    // -d "grant_type=authorization_code&code=01234567-89ab-cdef-0123-456789abcdef&client_secret=01234567-89ab-cdef-0123-456789abcdef"
  }
};

global.HerokuCatcher = jClass.extend({
  isRunning: false,

  init: function (doneCallback) {
    this.doneCallback = doneCallback;
    var _this = this;
    this.server = http.createServer(function (request, response) {
      console.dir(request);

      var parsed = url.parse(request.url);
      var query = querystring.parse(parsed.query);
      //console.log(query.code);
      HerokuClient.setRequestToken(query.code);
      _this.doneCallback();

      response.writeHead(200, {"Content-Type": "text/html"});
      response.end("<script type='text/javascript'>window.close();</script>");

      setTimeout(function() {
        _this.stop();
      }, 100);
    });
  },

  start: function () {
    this.isRunning = true;
    console.log('server started at http://localhost:12001/');
    this.server.listen(12001);
  },

  stop: function () {
    if (this.isRunning) {
      console.log("Stopping server");
      this.server.close();
      this.isRunning = false;
    }
  }
});
