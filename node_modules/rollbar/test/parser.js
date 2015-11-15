/*jslint devel: true, nomen: true, plusplus: true, regexp: true, unparam: true, indent: 2, maxlen: 100 */

"use strict";

var assert = require('assert');
var fs = require('fs');
var jade = require('jade');
var vows = require('vows');

var parser = require('../lib/parser');


/*
 * Internal
 */


function readJadeFixture(filename, includeJadeFilename, jadeLocals, callback) {
  fs.readFile(filename, function (err, data) {
    var opts, jadeFn;

    opts = {};

    if (err) {
      return callback(err);
    }

    if (includeJadeFilename) {
      opts.filename = __dirname + '/../fixture/jadeerr.jade';
    }

    jadeFn = jade.compile(data, opts);
    try {
      jadeFn(jadeLocals);
      return callback(new Error('expected this to break'));
    } catch (e) {
      return callback(null, e);
    }
  });
}


function parseAndVerifyException(jadeDebug) {
  return {
    topic: function (err, exc) {
      parser.parseException(exc, this.callback);
    },
    'verify stack frames': function (err, parsedObj) {

      var frames, i, numFrames, cur, jadeDebugFound;

      assert.isNull(err);
      assert.isObject(parsedObj);

      frames = parsedObj.frames;
      assert.isArray(frames);

      assert.equal(parsedObj.class, 'ReferenceError');
      assert.equal(parsedObj.message, 'foo is not defined');

      numFrames = frames.length;
      assert.isTrue(numFrames >= 1);

      jadeDebugFound = false;
      for (i = 0; i < numFrames; ++i) {
        cur = frames[i];
        assert.include(cur, 'method');
        assert.include(cur, 'filename');
        assert.include(cur, 'lineno');
        if (cur.method !== '<jade>') {
          assert.include(cur, 'colno');
          assert.isNumber(cur.colno);
        } else {
          jadeDebugFound = true;
        }

        assert.isNumber(cur.lineno);
        assert.isString(cur.method);
        assert.isString(cur.filename);
      }

      if (jadeDebug) {
        if (!jadeDebugFound) {
          assert.isFalse('jade debug not found');
        }
      } else {
        if (jadeDebugFound) {
          assert.isFalse('jade debug found but should not be');
        }
      }
    }
  };
}


/*
 * Tests
 */


var suite = vows.describe('parser').addBatch({
  'Read in a jade template with an error, compile with no filename': {
    topic: function () {
      readJadeFixture(__dirname + '/../fixture/jadeerr.jade',
        false, {breakme: true}, this.callback);
    },
    'parse the exception with parseException': parseAndVerifyException(false)
  },
  'Read in a jade template with an error, compile with a filename': {
    topic: function () {
      readJadeFixture(__dirname + '/../fixture/jadeerr.jade',
        true, {breakme: true}, this.callback);
    },
    'parse the exception with parseException': parseAndVerifyException(true)
  },
  'Create new Error with object as message': {
    topic: function() {
      var error = new Error({foo: 'bar'});

      return parser.parseException(error, this.callback);
    },
    'parse it with without errors': function(err, parsedObj) {
      assert.equal(parsedObj.message, '[object Object]');
    }
  },
  'Create a new Error in this file': {
    topic: function () {
      // NOTE: Don't change this next line of code since we verify the context line
      // in the parsed exception below.
      this.callback(null, new Error('Hello World'));
    },
    'parse it with parseException': {
      topic: function (err, exc) {
        var self = this;
        return parser.parseException(exc, function(err, parsedObj) {
          self.callback(err, parsedObj, exc);
        });
      },
      'verify the filename': function (err, parsedObj) {
        assert.isNull(err);
        assert.isObject(parsedObj);
        assert.isArray(parsedObj.frames);

        var lastFrame = parsedObj.frames[parsedObj.frames.length - 1];
        assert.isObject(lastFrame);
        assert.equal(lastFrame.filename, __filename);
      },
      'verify the context line': function (err, parsedObj) {
        var lastFrame = parsedObj.frames[parsedObj.frames.length - 1];
        assert.isString(lastFrame.code);
        assert.includes(lastFrame.code, 'new Error(\'Hello World\')');
      },
      'parse the same error again': {
        topic: function(err, parsedObj, exc) {
          return parser.parseException(exc, this.callback);
        },
        'verify the context line again': function (err, parsedObj) {
          var lastFrame = parsedObj.frames[parsedObj.frames.length - 1];
          assert.isString(lastFrame.code);
          assert.includes(lastFrame.code, 'new Error(\'Hello World\')');
        }
      }
    }
  },
  'An error reading a file': {
    topic: function (err) {
      var exc = new Error();
      exc.stack = "Error\n at REPLServer.self.eval (/tmp/file-does-not-exist.js:1:2)" +
        "\n at REPLServer.self.eval (/tmp/other-file-does-not-exist.js:3:4)";
      return parser.parseException(exc, this.callback);
    },
    'it returns frames without context': function (err, parsedObj) {
      assert.equal(parsedObj.frames.length, 2);
      assert.equal(parsedObj.frames[0].filename, "/tmp/other-file-does-not-exist.js");
      assert.equal(parsedObj.frames[0].lineno, 3);
      assert.equal(parsedObj.frames[0].colno, 4);
      assert.equal(parsedObj.frames[1].filename, "/tmp/file-does-not-exist.js");
      assert.equal(parsedObj.frames[1].lineno, 1);
      assert.equal(parsedObj.frames[1].colno, 2);
    }
  },
  'A coffee script stacktrace': {
    topic: function (err) {
      var exc = new Error();
      exc.stack = "TypeError: Cannot read property 'foo' of undefined\n" +
          " at example (/tmp/example.coffee:2:3, <js>:5:20)";
      return parser.parseException(exc, this.callback);
    },
    'it parses correctly': function (err, parsedObj) {
      assert.equal(parsedObj.frames[0].filename, "/tmp/example.coffee");
      assert.equal(parsedObj.frames[0].lineno, 2);
      assert.equal(parsedObj.frames[0].colno, 3);
      assert.equal(parsedObj.frames[0].compiled_lineno, 5);
      assert.equal(parsedObj.frames[0].compiled_colno, 20);
    }
  },
  'Multiple errors': {
    'Simple': {
      topic: function (err) {
        var exc1, exc2, containerExc;

        exc1 = new Error('First error');
        exc2 = new Error('Second error');
        containerExc = new Error();
        containerExc.errors = [exc1, exc2];
        return parser.parseException(containerExc, this.callback);
      },
      'it uses the first error': function (err, parsedObj) {
        assert.equal(parsedObj.message, 'First error');
      }
    },
    'exception.errors is an object': {
      topic: function (err) {
        var exc1, exc2, containerExc;

        exc1 = new Error('First error');
        exc2 = new Error('Second error');
        containerExc = new Error();
        containerExc.errors = {first: exc1, second: exc2};
        return parser.parseException(containerExc, this.callback);
      },
      'one of the errors was used': function (err, parsedObj) {
        assert.isTrue(parsedObj.message === 'First error' || parsedObj.message === 'Second error');
      }
    },
    'exception.errors is null': {
      topic: function (err) {
        var containerExc = new Error('Container error');
        containerExc.errors = null;
        return parser.parseException(containerExc, this.callback);
      },
      'the container error was used': function (err, parsedObj) {
        assert.equal(parsedObj.message, 'Container error');
      }
    },
    'exception.errors is an empty array': {
      topic: function (err) {
        var containerExc = new Error('Container error');
        containerExc.errors = [];
        return parser.parseException(containerExc, this.callback);
      },
      'the container error was used': function (err, parsedObj) {
        assert.equal(parsedObj.message, 'Container error');
      }
    }
  }
}).export(module, {error: false});
