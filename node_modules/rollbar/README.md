# Rollbar notifier for Node.js [![Build Status](https://secure.travis-ci.org/rollbar/node_rollbar.png?branch=master)](https://travis-ci.org/rollbar/node_rollbar)

<!-- RemoveNext -->
Node.js library for reporting exceptions and other messages to [Rollbar](https://rollbar.com). Requires a Rollbar account.

<!-- Sub:[TOC] -->

## Quick start

```js
// include and initialize the rollbar library with your access token
var rollbar = require("rollbar");
rollbar.init("POST_SERVER_ITEM_ACCESS_TOKEN");

// record a generic message and send to rollbar
rollbar.reportMessage("Hello world!");

// more is required to automatically detect and report errors.
// keep reading for details.
```

<!-- RemoveNextIfProject -->
Be sure to replace ```POST_SERVER_ITEM_ACCESS_TOKEN``` with your project's ```post_server_item``` access token, which you can find in the Rollbar.com interface.

## Installation

Install using the node package manager, npm:

    $ npm install --save rollbar


## Configuration

### Using Express

```js
var express = require('express');
var rollbar = require('rollbar');

var app = express();

app.get('/', function(req, res) {
  // ...
});

// Use the rollbar error handler to send exceptions to your rollbar account
app.use(rollbar.errorHandler('POST_SERVER_ITEM_ACCESS_TOKEN'));

app.listen(6943);
```


### Standalone

In your main application, require and initialize using your access_token::

```js
var rollbar = require("rollbar");
rollbar.init("POST_SERVER_ITEM_ACCESS_TOKEN");
```
    
Other options can be passed into the init() function using a second parameter. E.g.:

```js
// Configure the library to send errors to api.rollbar.com
rollbar.init("POST_SERVER_ITEM_ACCESS_TOKEN", {
  environment: "staging",
  endpoint: "https://api.rollbar.com/api/1/"
});
```


## Usage

### Uncaught exceptions

Rollbar can be registered as a handler for any uncaught exceptions in your Node process:

```js
var options = {
  // Call process.exit(1) when an uncaught exception occurs but after reporting all
  // pending errors to Rollbar.
  //
  // Default: false
  exitOnUncaughtException: true
};
rollbar.handleUncaughtExceptions("POST_SERVER_ITEM_ACCESS_TOKEN", options);
```

### Caught exceptions

To report an exception that you have caught, use [`handleError`](https://github.com/rollbar/node_rollbar/blob/master/rollbar.js#L152) or the full-powered [`handleErrorWithPayloadData`](https://github.com/rollbar/node_rollbar/blob/master/rollbar.js#L176):

```js
var rollbar = require('rollbar');
rollbar.init('POST_SERVER_ITEM_ACCESS_TOKEN');

try {
  someCode();
} catch (e) {
  rollbar.handleError(e);
  
  // if you have a request object (or a function that returns one), pass it as the second arg
  // see below for details about what the request object is expected to be
  rollbar.handleError(e, request);
  
  // you can also pass a callback, which will be called upon success/failure
  rollbar.handleError(e, function(err2) {
    if (err2) {
      // an error occurred
    } else {
      // success
    }
  });
  
  // if you have a request and a callback, pass the callback last
  rollbar.handleError(e, request, callback);

  // to specify payload options - like extra data, or the level - use handleErrorWithPayloadData
  rollbar.handleErrorWithPayloadData(e, {level: "warning", custom: {someKey: "arbitrary value"}});

  // can also take request and callback, like handleError:
  rollbar.handleErrorWithPayloadData(e, {level: "info"}, request);
  rollbar.handleErrorWithPayloadData(e, {level: "info"}, callback);
  rollbar.handleErrorWithPayloadData(e, {level: "info"}, request, callback);
}
```

### Log messages

To report a string message, possibly along with additional context, use [`reportMessage`](https://github.com/rollbar/node_rollbar/blob/master/rollbar.js#L103) or the full-powered [`reportMessageWithPayloadData`](https://github.com/rollbar/node_rollbar/blob/master/rollbar.js#L129).

```js
var rollbar = require('rollbar');
rollbar.init('POST_SERVER_ITEM_ACCESS_TOKEN');

// reports a string message at the default severity level ("error")
rollbar.reportMessage("Timeout connecting to database");


// reports a string message at the level "warning", along with a request and callback
// only the first param is required
// valid severity levels: "critical", "error", "warning", "info", "debug"
rollbar.reportMessage("Response time exceeded threshold of 1s", "warning", request, callback);

// reports a string message along with additional data conforming to the Rollbar API Schema
// documented here: https://rollbar.com/docs/api/items_post/
// only the first two params are required
rollbar.reportMessageWithPayloadData("Response time exceeded threshold of 1s", {
    level: "warning",
    custom: {
      threshold: 1,
      timeElapsed: 2.3
    }
  }, request, callback);
```

### The Request Object

If your Node.js application is responding to web requests, you can send data about the current request along with each report to Rollbar. This will allow you to replay requests, track events by browser, IP address, and much more.

`handleError`, `reportMessage`, `handleErrorWithPayloadData`, and `reportMessageWithPayloadData` all accept a `request` parameter as the second, third, third, and third arguments respectively. If it is a function, it will be called and the result used.

If you're using Express, just pass the express request object. If you're using something custom, pass an object with these keys (all optional):

- `headers`: an object containing the request headers
- `protocol`: the request protocol (e.g. `"https"`)
- `url`: the URL starting after the domain name (e.g. `"/index.html?foo=bar"`)
- `method`: the request method (e.g. `"GET"`)
- `body`: the request body as a string
- `route`: an object containing a 'path' key, which will be used as the "context" for the event (e.g. `{path: "home/index"}`)

Sensitive param names will be scrubbed from the request body and, if `scrubHeaders` is configured, headers. See the `scrubFields` and `scrubHeaders` configuration options for details.

### Person Tracking

If your application has authenticated users, you can track which user ("person" in Rollbar parlance) was associated with each event.

If you're using the [Passport](http://passportjs.org/) authentication library, this will happen automatically when you pass the request object (which will have "user" attached). Otherwise, attach one of these keys to the `request` object described in the previous section:

- `rollbar_person` or `user`: an object like `{id: "123", username: "foo", email: "foo@example.com"}`. id is required, others are optional.
- `user_id`: the user id as an integer or string, or a function which when called will return the user id

Note: in Rollbar, the `id` is used to uniquely identify a person; `email` and `username` are supplemental and will be overwritten whenever a new value is received for an existing `id`. The `id` is a string up to 40 characters long.


## Configuration reference

`rollbar.init("access token", optionsObj)` takes the following configuration options:

  <dl>
  
  <dt>branch</dt>
  <dd>The branch in your version control system for this code.

e.g. `'master'`
  </dd>
  
  <dt>codeVersion</dt>
  <dd>The version or revision of your code.

e.g. `'868ff435d6a480929103452e5ebe8671c5c89f77'`
  </dd>
  
  <dt>endpoint</dt>
  <dd>The rollbar API base url.

Default: `'https://api.rollbar.com/api/1/'`
  </dd>
  
  <dt>environment</dt>
  <dd>The environment the code is running in, e.g. "production"

Default: `'unspecified'`
  </dd>
  
  <dt>host</dt>
  <dd>The hostname of the server the node.js process is running on.

Default: hostname returned from `os.hostname()`
  </dd>

  <dt>root</dt>
  <dd>The path to your code, (not including any trailing slash) which will be used to link source files on Rollbar.

e.g. `'/Users/bob/Development'`
  </dd>
  
  <dt>scrubFields</dt>
  <dd>List of field names to scrub out of the request body (POST params). Values will be replaced with asterisks. If overriding, make sure to list all fields you want to scrub, not just fields you want to add to the default. Param names are converted to lowercase before comparing against the scrub list.

Default: `['passwd', 'password', 'secret', 'confirm_password', 'password_confirmation']`
  </dd>
  
  <dt>scrubHeaders</dt>
  <dd>List of header names to scrub out of the request headers. Works like scrubFields.
  
Default: `[]`
  </dd>
  
  <dt>verbose</dt>
  <dd>Sets whether or not to log extra info/debug messages
  
Default: `true`
  </dd>
  </dl>


## Examples

See the [examples](https://github.com/rollbar/node_rollbar/tree/master/examples) directory for more use cases.


## Help / Support

If you have any questions, feedback, etc., drop us a line at support@rollbar.com

For bug reports, please [open an issue on GitHub](https://github.com/rollbar/node_rollbar/issues).

## Contributing

The project is hosted on [GitHub](https://github.com/rollbar/node_rollbar). If you'd like to contribute a change:

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Added some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create a new Pull Request

We're using [vows](http://vowsjs.org/) for testing. To run the tests, run: `vows --spec test/*`
