/*jslint devel: true, nomen: true, plusplus: true, regexp: true, indent: 2, maxlen: 100 */

"use strict";

var assert = require('assert');
var vows = require('vows');

var notifier = require('../lib/notifier');
var rollbar = require('../rollbar');

var ACCESS_TOKEN = '8802be7c990a4922beadaaefb6e0327b';

rollbar.init(ACCESS_TOKEN, {environment: 'playground'});

var suite = vows.describe('json').addBatch({
  'should handle circular object references': {
    topic: function () {
      var c, circularObject;

      c = {};
      circularObject = {c: c};
      c.d = circularObject;

      notifier.reportMessageWithPayloadData('test', circularObject, null, this.callback);
    },
    'verify there were no errors reporting the circular object': function (err) {
      assert.isNull(err);
    }
  },
  'should handle sibling keys that refer to the same object': {
    topic: function () {
      var obj, testObj;

      obj = {foo: 'bar'};
      testObj = {a: obj, b: obj};

      notifier.reportMessageWithPayloadData('test', testObj, null, this.callback);
    },
    'verify there were no errors reporting the object': function (err) {
      assert.isNull(err);
    }
  },
  'should be able to send unicode characters properly': {
    topic: function () {
      var obj, testObj;

      obj = {foo: '☀ ☁ ☂ ☃ ☄ ★ ☆ ☇ ☈ ☉ ☊ ☋ ☌ ☍ ☎ ☏ ☐ ☑ ☒ ☓ ☚ ☛ ☜'};
      testObj = {a: obj, b: obj};

      notifier.reportMessageWithPayloadData('test', testObj, null, this.callback);
    },
    'verify there were no errors reporting the object': function (err) {
      assert.isNull(err);
    }
  }
}).export(module, {error: false});
