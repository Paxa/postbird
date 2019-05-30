/// <reference types="node" />

// @ts-ignore
var url = require('url');
var querystring = require('querystring');
var needle = require('needle');
var http = require('http');

/*::
interface HerokuClientOptions {
  onAccessTokenStart?:  () => void,
  onAccessTokenDone?:   () => void,
  onRequestTokenStart?: () => void,
  onRequestTokenDone?:  () => void,
  onGetAppsStarted?:    () => void,
  onGetAppsDone?:       () => void
  retry?: boolean
}
*/

class HerokuClient {
  /*::
    app_id: string
    secret: string
    apiUrl: string
    catcher: HerokuCatcher
  */

  constructor () {
    this.app_id = 'da22247b-a5b0-498e-8110-5812d65f74c3';
    this.secret = '76358182-8fbc-40c7-81b8-9f5d3a6c6673';
    this.apiUrl = 'https://api.heroku.com';
  }

  makeAuthUrl () {
    var url = 'https://id.heroku.com/oauth/authorize?client_id={app_id}&response_type=code&scope=global&state={rand}';
    return url.replace('{app_id}', this.app_id).replace('{rand}', new Date().getTime().toString());
  }

  setRequestToken (value) {
    window.localStorage.herokuRequestToken = value;
  }

  getRequestToken () {
    return window.localStorage.herokuRequestToken;
  }

  clearRequestToken () {
    delete window.localStorage.herokuRequestToken;
  }

  getAccessToken () {
    if (window.localStorage.herokuAccessToken) {
      var token = JSON.parse(window.localStorage.herokuAccessToken);

      // check if token expired
      var expiresAt = new Date(Date.parse(token.createdAt) + token.expires_in * 1000);
      if (new Date() > expiresAt) {
        this.clearAccessToken();
        return false;
      }

      return token;
    } else {
      return false;
    }
  }

  setAccessToken (accessToken) {
    accessToken.createdAt = new Date;
    return window.localStorage.herokuAccessToken = JSON.stringify(accessToken);
  }

  clearAccessToken () {
    delete window.localStorage.herokuAccessToken;
  }

  auth (callback, options /*: HerokuClientOptions */) {
    if (!options) options = {};
    //console.log('auth started');
    options.onAccessTokenStart && options.onAccessTokenStart();

    this.fetchRequestToken(() => {
      options.onAccessTokenDone && options.onAccessTokenDone()
      options.onRequestTokenStart && options.onRequestTokenStart()
      //console.log('got request token ' + _this.getRequestToken());
      this.fetchAccessToken(() => {
        options.onRequestTokenDone && options.onRequestTokenDone()
        callback();
      }, options);
    });
  }

  authAndGetApps (callback, options /*: HerokuClientOptions */) {
    this.auth(() => {
      options.onGetAppsStarted && options.onGetAppsStarted();
      this.getApps((apps) => {
        if (apps.id == 'unauthorized') {
          if (options.retry) {
            callback([]);
            return;
          }
          options.retry = true;
          this.clearRequestToken();
          this.clearAccessToken();
          this.auth(() => {
            this.authAndGetApps(callback, options);
          }, options);
        } else {
          options.onGetAppsDone && options.onGetAppsDone();
          callback(apps)
        }
      });
    }, options);
  }

  fetchRequestToken (callback) {
    if (this.getRequestToken()) {
      callback();
    } else {
      var url = this.makeAuthUrl();
      if (this.catcher) this.catcher.stop();
      this.catcher = new HerokuCatcher(requestToken => {
        this.setRequestToken(requestToken);
        electron.remote.app.mainWindow.focus();
        callback();
      });
      this.catcher.start();
      console.log("Opening url " + url);
      electron.remote.shell.openExternal(url);
      //child_process.spawn('open', [url]);
    }
  }

  fetchAccessToken (callback, callbackOptions) {
    if (this.getAccessToken()) {
      callback();
    } else {
      var params = {
        grant_type: 'authorization_code',
        code: this.getRequestToken(),
        client_secret: this.secret
      };

      var options = { ssl: true, timeout: 30 * 1000 };
      console.log("POST", 'https://id.heroku.com/oauth/token', querystring.stringify(params));

      needle.post('https://id.heroku.com/oauth/token', params, options, (err, resp) => {
        console.log(err, resp);
        if (resp.body.id == "unauthorized") {
          this.clearRequestToken();
          this.auth(() => {
            this.fetchAccessToken(callback, callbackOptions);
          }, callbackOptions);
        } else {
          this.setAccessToken(resp.body);
          callback();
        }
      });
    }
  }

  getApps (callback) {
    this.getApiData('/apps', callback);
  }

  getAddons (app_id, callback) {
    this.getApiData('/apps/' + app_id + '/addons', callback);
  }

  getConfigVars (app_id, callback) {
    this.getApiData('/apps/' + app_id + '/config-vars', callback);
  }

  getDatabaseUrl (app_id, callback) {
    this.getConfigVars(app_id, (data) => {
      callback(data['DATABASE_URL']);
    });
  }

  getApiData (uri, callback) {
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
    needle.get(url, options, (err, resp) => {
      //console.log('response', err, resp);
      if (resp) {
        callback ? callback(resp.body) : console.log(resp.body);
      } else {
        callback && callback();
      }
    });
  }
}

class HerokuCatcher {

  /*::
  isRunning: boolean
  doneCallback: (requestToken: string) => void
  server: any
  */

  constructor (doneCallback) {
    this.isRunning = false;
    this.doneCallback = doneCallback;
    this.server = http.createServer((request, response) => {
      //console.dir(request);

      var parsed = url.parse(request.url);
      var query = querystring.parse(parsed.query);
      //console.log(query.code);
      //HerokuClient.setRequestToken(query.code);
      this.doneCallback(query.code);

      response.writeHead(200, {"Content-Type": "text/html"});
      response.end("<script type='text/javascript'>window.close();</script>");

      setTimeout(() => {
        this.stop();
      }, 100);
    });
  }

  start () {
    this.isRunning = true;
    console.log('server started at http://localhost:12001/');
    this.server.listen(12001);
  }

  stop () {
    if (this.isRunning) {
      console.log("Stopping server");
      this.server.close();
      this.isRunning = false;
    }
  }
}

global.HerokuClient = HerokuClient;
