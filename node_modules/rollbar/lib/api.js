var url = require('url');
var http = require('http');
var https = require('https');
var stringify = require('json-stringify-safe');

exports.VERSION = '1';
exports.endpoint = 'https://api.rollbar.com/api/' + exports.VERSION + '/';
exports.accessToken = null;

var SETTINGS = {
  accessToken: null,
  protocol: 'https',
  endpoint: exports.endpoint,
  verbose: true,
  proxy: null
};

/*
 * Public API
 */

exports.init = function(accessToken, options) {
  options = options || {};
  exports.accessToken = accessToken;
  exports.endpoint = options.endpoint || exports.endpoint;

  for (var opt in options) {
    SETTINGS[opt] = options[opt];
  }

  SETTINGS.endpointOpts = url.parse(exports.endpoint);
  SETTINGS.protocol = SETTINGS.endpointOpts.protocol.split(':')[0];
  SETTINGS.transport = {http: http, https: https}[SETTINGS.protocol];
  SETTINGS.proxy = options.proxy;

  var portCheck = SETTINGS.endpointOpts.host.split(':');
  if (portCheck.length > 1) {
    SETTINGS.endpointOpts.host = portCheck[0];
    SETTINGS.port = parseInt(portCheck[1]);
  }
};


exports.postItems = function(items, callback) {
  return postApi('items/', buildPayload(items), callback);
};


/** Internal **/

function getApi(path, params, callback) {
  var transport = SETTINGS.transport;
  var opts = transportOpts(path, 'GET');
  return makeApiRequest(transport, opts, null, callback);
}


function postApi(path, payload, callback) {
  var transport = SETTINGS.transport;
  var opts = transportOpts(path, 'POST');

  return makeApiRequest(transport, opts, payload, callback);
}


function makeApiRequest(transport, opts, bodyObj, callback) {
  var writeData = null;

  if (bodyObj) {
    try {
      try {
        writeData = JSON.stringify(bodyObj);
      } catch (e) {
        console.error('[Rollbar] Could not serialize to JSON - falling back to safe-stringify');
        writeData = stringify(bodyObj);
      }
    } catch(e) {
      console.error(e);
      return callback(e);
    }

    opts.headers = opts.headers || {};
    opts.headers['Content-Type'] = 'application/json';
    opts.headers['Content-Length'] = Buffer.byteLength(writeData, 'utf8');
  }

  if (SETTINGS.proxy) {
    opts.path = SETTINGS.protocol + '://' + opts.host + opts.path;
    opts.host = SETTINGS.proxy.host;
    opts.port = SETTINGS.proxy.port;
    transport = http;
  }

  var req = transport.request(opts, function(resp) {
    var respData = [];
    resp.setEncoding('utf8');
    resp.on('data', function(chunk) {
      respData.push(chunk);
    });

    resp.on('end', function() {
      respData = respData.join('');
      return parseApiResponse(respData, callback);
    });
  });

  req.on('error', function(err) {
    console.error('[Rollbar] Could not make request to rollbar, ' + err);
    return callback(err);
  });

  if (writeData) {
    req.write(writeData);
  }
  req.end();
}


function parseApiResponse(respData, callback) {
  try {
    respData = JSON.parse(respData);
  } catch (e) {
    console.error('[Rollbar] Could not parse api response, err: ' + e);
    return callback(e);
  }

  if (respData.err) {
    console.error('[Rollbar] Received error: ' + respData.message);
    return callback(new Error('Api error: ' + (respData.message || 'Unknown error')));
  } else {
    if (SETTINGS.verbose) {
      console.log('[Rollbar] Successful api response');
    }
    return callback(null, respData.result);
  }
}


function transportOpts(path, method) {
  return {
    host: SETTINGS.endpointOpts.host,
    port: SETTINGS.port || 
      (SETTINGS.protocol == 'http' ? 80 : (SETTINGS.protocol == 'https' ? 443 : undefined)),
    path: SETTINGS.endpointOpts.path + path,
    method: method
  };
}


function buildPayload(data) {
  var payload = {
    access_token: exports.accessToken,
    data: data 
  };
  return payload;
}
