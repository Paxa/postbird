/*jslint devel: true, nomen: true, plusplus: true, regexp: true, indent: 2, maxlen: 100 */

"use strict";

var async = require('async');
var http = require('http');
var https = require('https');
var uuid = require('node-uuid');
var os = require('os');
var url = require('url');

var parser = require('./parser');
var packageJson = require('../package.json');


exports.VERSION = packageJson.version;


var SETTINGS = {
  accessToken: null,
  codeVersion: null,
  host: os.hostname(),
  environment: 'development',
  framework: 'node-js',
  root: null,  // root path to your code
  branch: null,  // git branch name
  notifier: {
    name: 'node_rollbar',
    version: exports.VERSION
  },
  scrubHeaders: [],
  scrubFields: ['passwd', 'password', 'secret', 'confirm_password', 'password_confirmation'],
  addRequestData: null  // Can be set by the user or will default to addRequestData defined below
};


var apiClient;


/** Internal **/


function genUuid() {
  var buf = new Buffer(16);
  uuid.v4(null, buf);
  return buf.toString('hex');
}


function buildBaseData(extra) {
  var data, props;

  extra = extra || {};
  data = {
    timestamp: Math.floor((new Date().getTime()) / 1000),
    environment: extra.environment || SETTINGS.environment,
    level: extra.level || 'error',
    language: 'javascript',
    framework: extra.framework || SETTINGS.framework,
    uuid: genUuid(),
    notifier: JSON.parse(JSON.stringify(SETTINGS.notifier))
  };

  if (SETTINGS.codeVersion) {
    data.code_version = SETTINGS.codeVersion;
  }

  props = Object.getOwnPropertyNames(extra);
  props.forEach(function (name) {
    if (!data.hasOwnProperty(name)) {
      data[name] = extra[name];
    }
  });

  data.server = {
    host: SETTINGS.host,
    argv: process.argv.concat(),
    pid: process.pid
  }

  data.server.host = SETTINGS.host;

  if (SETTINGS.branch) {
    data.server.branch = SETTINGS.branch;
  }
  if (SETTINGS.root) {
    data.server.root = SETTINGS.root;
  }

  return data;
}


function buildErrorData(baseData, err, callback) {
  parser.parseException(err, function (e, errData) {
    if (e) {
      return callback(e);
    }
    baseData.body.trace = {
      frames: errData.frames,
      exception: {
        class: errData['class'],
        message: errData.message
      }
    };

    callback(null);
  });
}


function charFill(char, num) {
  var a, x;

  a = [];
  x = num;
  while (x > 0) {
    a[x] = '';
    x -= 1;
  }
  return a.join(char);
}


function scrubRequestHeaders(headers, settings) {
  var obj, k;

  obj = {};
  settings = settings || SETTINGS;
  for (k in headers) {
    if (headers.hasOwnProperty(k)) {
      if (settings.scrubHeaders.indexOf(k) === -1) {
        obj[k] = headers[k];
      } else {
        obj[k] = charFill('*', headers[k].length);
      }
    }
  }
  return obj;
}


function scrubRequestParams(params, settings) {
  var k;

  settings = settings || SETTINGS;
  for (k in params) {
    if (params.hasOwnProperty(k) && params[k] && settings.scrubFields.indexOf(k) >= 0) {
      params[k] = charFill('*', params[k].length);
    }
  }

  return params;
}


function extractIp(req) {
  var ip = req.ip;
  if (!ip) {
    if (req.headers) {
      ip = req.headers['x-real-ip'] || req.headers['x-forwarded-for'];
    }
    if (!ip && req.connection && req.connection.remoteAddress) {
      ip = req.connection.remoteAddress;
    }
  }
  return ip;
}


function buildRequestData(req) {
  var headers, host, proto, reqUrl, parsedUrl, data, bodyParams, k;

  headers = req.headers || {};
  host = headers.host || '<no host>';
  proto = req.protocol || (req.socket && req.socket.encrypted) ? 'https' : 'http';
  reqUrl = proto + '://' + host + (req.url || '');
  parsedUrl = url.parse(reqUrl, true);
  data = {url: reqUrl,
    GET: parsedUrl.query,
    user_ip: extractIp(req),
    headers: scrubRequestHeaders(headers),
    method: req.method};

  if (req.body) {
    bodyParams = {};
    if (typeof req.body === 'object') {
      for (k in req.body) {
        if (req.body.hasOwnProperty(k)) {
          bodyParams[k] = req.body[k];
        }
      }
      data[req.method] = scrubRequestParams(bodyParams);
    } else {
      data.body = req.body;
    }
  }

  return data;
}


function addRequestData(data, req) {
  var reqData, userId;

  reqData = buildRequestData(req);
  if (reqData) {
    data.request = reqData;
  }

  if (req.route) {
    data.context = req.route.path;
  } else {
    try {
      data.context = req.app._router.matchRequest(req).path;
    } catch (ignore) {
      // ignore
    }
  }

  if (req.rollbar_person) {
    data.person = req.rollbar_person;
  } else if (req.user) {
    data.person = {id: req.user.id};
    if (req.user.username) {
      data.person.username = req.user.username;
    }
    if (req.user.email) {
      data.person.email = req.user.email;
    }
  } else if (req.user_id || req.userId) {
    userId = req.user_id || req.userId;
    if (typeof userId === 'function') {
      userId = userId();
    }
    data.person = {id: userId};
  }
}


function buildItemData(item, callback) {
  var baseData, steps;

  baseData = buildBaseData(item.payload);

  // Add the message to baseData if there is one
  function addMessageData(callback) {
    baseData.body = {};
    if (item.message !== undefined) {
      baseData.body.message = {
        body: item.message
      };
    }
    callback(null);
  }

  // Add the error trace information to baseData if there is one
  function addTraceData(callback) {
    if (item.error) {
      buildErrorData(baseData, item.error, callback);
    } else {
      callback(null);
    }
  }

  // Add the request information to baseData if there is one
  function addReqData(callback) {
    var addReqDataFn = SETTINGS.addRequestData || addRequestData;
    if (item.request) {
      addReqDataFn(baseData, item.request);
    }
    callback(null);
  }

  steps = [
    addMessageData,
    addTraceData,
    addReqData
  ];

  async.series(steps, function (err) {
    if (err) {
      callback(err);
    }
    callback(null, baseData);
  });

}


function addItem(item, callback) {
  if (typeof callback !== 'function') {
    callback = function dummyCallback() {};
  }

  try {
    buildItemData(item, function (err, data) {
      if (err) {
        return callback(err);
      }
      apiClient.postItem(data, function (err, resp) {
        if (typeof callback === 'function') {
          callback(err, data, resp);
        }
      });
    });
  } catch (e) {
    console.error('[Rollbar] Internal error while building payload: ' + e);
    callback(e);
  }
}


/*
 * Exports for testing
 */


exports._scrubRequestHeaders = function (headersToScrub, headers) {
  return scrubRequestHeaders(headers, headersToScrub ? {scrubHeaders: headersToScrub} : undefined);
};


exports._scrubRequestParams = function (paramsToScrub, params) {
  return scrubRequestParams(params, paramsToScrub ? {scrubFields: paramsToScrub} : undefined);
};


exports._extractIp = function (req) {
  return extractIp(req);
};


/*
 * Public API
 */

exports.init = function (api, options) {
  var opt;

  SETTINGS.accessToken = api.accessToken;

  apiClient = api;
  options = options || {};

  for (opt in options) {
    if (options.hasOwnProperty(opt)) {
      SETTINGS[opt] = options[opt];
    }
  }
};


exports.handleError = function (err, req, callback) {
  return exports.handleErrorWithPayloadData(err, {}, req, callback);
};


exports.handleErrorWithPayloadData = function (err, payloadData, req, callback) {
  // Allow the user to call with an optional request and callback
  // e.g. handleErrorWithPayloadData(err, payloadData, req, callback) 
  //   or handleErrorWithPayloadData(err, payloadData, callback)
  //   or handleErrorPayloadData(err, payloadData)
  if (typeof req === 'function') {
    callback = req;
    req = null;
  }

  if (!(err instanceof Error)) {
    if (typeof callback === 'function') {
      return callback(new Error('handleError was passed something other than an Error'));
    }
  }
  addItem({error: err, payload: payloadData, request: req}, callback);
};


exports.reportMessage = function (message, level, req, callback) {
  return exports.reportMessageWithPayloadData(message, {level: level}, req, callback);
};


exports.reportMessageWithPayloadData = function (message, payloadData, req, callback) {
  addItem({message: message, payload: payloadData, request: req}, callback);
};
