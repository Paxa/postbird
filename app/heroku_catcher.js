var libs = {};
var loadedModules = {};

['child_process', 'http', 'https', 'url', 'querystring', 'needle'].forEach(function(lib) {
  Object.defineProperty(libs, lib, {
    get: function() {
      if (!loadedModules[lib]) {
        loadedModules[lib] = require(lib);
      }
      return loadedModules[lib];
    }
  });
});

global.HerokuClient = {
  app_id: 'da22247b-a5b0-498e-8110-5812d65f74c3',
  secret: '76358182-8fbc-40c7-81b8-9f5d3a6c6673',
  apiUrl: 'https://api.heroku.com',

  setRequestToken: function (value) {
    window.localStorage.herokuRequestToken = value;
  },

  getRequestToken: function () {
    return window.localStorage.herokuRequestToken;
  },

  clearRequestToken: function () {
    delete window.localStorage.herokuRequestToken;
  },

  makeAuthUrl: function () {
    var url = 'https://id.heroku.com/oauth/authorize?client_id={app_id}&response_type=code&scope=global&state={rand}';
    return url.replace('{app_id}', this.app_id).replace('{rand}', new Date().getTime().toString());
  },

  auth: function (callback, options) {
    var _this = this;
    if (!options) options = {};
    //console.log('auth started');
    options.onAccessTokenStart && options.onAccessTokenStart();
    _this.fetchRequestToken(function() {
      options.onAccessTokenDone && options.onAccessTokenDone()
      options.onRequestTokenStart && options.onRequestTokenStart()
      //console.log('got request token ' + _this.getRequestToken());
      _this.fetchAccessToken(function() {
        options.onRequestTokenDone && options.onRequestTokenDone()
        console.log(_this.getAccessToken());
        callback();
      }, options);
    }, options);
  },

  authAndGetApps: function(callback, options) {
    this.auth(function() {
      options.onGetAppsStarted && options.onGetAppsStarted();
      this.getApps(function(apps) {
        if (apps.id == 'unauthorized') {
          if (options.retry) {
            callback([]);
            return;
          }
          options.retry = true;
          this.clearRequestToken();
          this.clearAccessToken();
          this.auth(function() {
            this.authAndGetApps(callback, options);
          }.bind(this), options);
        } else {
          options.onGetAppsDone && options.onGetAppsDone();
          callback(apps)
        }
      }.bind(this));
    }.bind(this), options);
  },

  fetchRequestToken: function(callback) {
    if (this.getRequestToken()) {
      callback();
    } else {
      var url = this.makeAuthUrl();
      if (this.catcher) this.catcher.stop();
      this.catcher = new HerokuCatcher(callback);
      this.catcher.start();
      console.log("Opening url " + url);
      libs.child_process.spawn('open', [url]);
    }
  },

  getAccessToken: function () {
    if (window.localStorage.herokuAccessToken) {
      return JSON.parse(window.localStorage.herokuAccessToken);
    } else {
      return false;
    }
  },

  setAccessToken: function (accessToken) {
    return window.localStorage.herokuAccessToken = JSON.stringify(accessToken);
  },

  clearAccessToken: function () {
    delete window.localStorage.herokuAccessToken;
  },

  fetchAccessToken: function (callback, callbackOoptions) {
    if (this.getAccessToken()) {
      callback();
    } else {
      var params = {
        grant_type: 'authorization_code',
        code: this.getRequestToken(),
        client_secret: this.secret
      };

      var options = { ssl: true, timeout: 30 * 1000 };
      console.log("POST", 'https://id.heroku.com/oauth/token', libs.querystring.stringify(params));

      libs.needle.post('https://id.heroku.com/oauth/token', params, options, function (err, resp) {
        console.log(err, resp);
        if (resp.body.id == "unauthorized") {
          this.clearRequestToken();
          this.auth(function() {
            this.fetchAccessToken(callback);
          }.bind(this), callbackOoptions);
        } else {
          this.setAccessToken(resp.body);
          callback();
        }
      }.bind(this));
    }
  },

  getApps: function (callback) {
    this.getApiData('/apps', callback);
  },

  getAddons: function (app_id, callback) {
    this.getApiData('/apps/' + app_id + '/addons', callback);
  },

  getConfigVars: function (app_id, callback) {
    this.getApiData('/apps/' + app_id + '/config-vars', callback);
  },

  getDatabaseUrl: function(app_id, callback) {
    this.getConfigVars(app_id, function(data) {
      callback(data['DATABASE_URL']);
    });
  },

  getApiData: function (uri, callback) {
    var token = this.getAccessToken();
    var options = {
      ssl: true,
      timeout: 30 * 1000,
      headers: {
        'Authorization': [token.token_type, token.access_token].join(" "),
        'Accept': 'application/vnd.heroku+json; version=3'
      }
    };
    var url = this.apiUrl + uri;
    console.log("GET " + url, options);
    libs.needle.get(url, options, function (err, resp) {
      console.log('response', err, resp);
      if (resp) {
        callback ? callback(resp.body) : console.log(resp.body);
      } else {
        callback && callback();
      }
    });
  },
};

global.HerokuCatcher = jClass.extend({
  isRunning: false,

  init: function (doneCallback) {
    this.doneCallback = doneCallback;
    var _this = this;
    this.server = libs.http.createServer(function (request, response) {
      console.dir(request);

      var parsed = libs.url.parse(request.url);
      var query = libs.querystring.parse(parsed.query);
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
