var assert = require('assert');
var vows = require('vows');

var notifier = require('../lib/notifier');
var rollbar = require('../rollbar');

var ACCESS_TOKEN = '8802be7c990a4922beadaaefb6e0327b';

rollbar.init(ACCESS_TOKEN, {environment: 'playground', handler: 'inline'});

var suite = vows.describe('json').addBatch({
  'should handle circular object references': {
    topic: function() {
      var c = {};
      var circularObject = {c: c};
      c.d = circularObject;

      notifier.reportMessageWithPayloadData('test', circularObject, null, this.callback);
    },
    'verify there were no errors reporting the circular object': function(err, resp) {
      assert.isNull(err);
      assert.isObject(resp);
      assert.include(resp, 'ids');
    }
  },
  'should handle sibling keys that refer to the same object': {
    topic: function() {
      var obj = {foo: 'bar'};
      var testObj = {a: obj, b: obj};

      notifier.reportMessageWithPayloadData('test', testObj, null, this.callback);
    },
    'verify there were no errors reporting the object': function(err, resp) {
      assert.isNull(err);
      assert.isObject(resp);
      assert.include(resp, 'ids');
    }
  },
  'should be able to send unicode characters properly': {
    topic: function() {
      var obj = {foo: '☀ ☁ ☂ ☃ ☄ ★ ☆ ☇ ☈ ☉ ☊ ☋ ☌ ☍ ☎ ☏ ☐ ☑ ☒ ☓ ☚ ☛ ☜'};
      var testObj = {a: obj, b: obj};

      notifier.reportMessageWithPayloadData('test', testObj, null, this.callback);
    },
    'verify there were no errors reporting the object': function(err, resp) {
      assert.isNull(err);
      assert.isObject(resp);
      assert.include(resp, 'ids');
    }
  }
}).export(module, {error: false});
