(function () {
  "use strict";

  var assert = require('assert')
    , localStorage = require('localStorage')
    ;

  // don't return prototypical things
  assert.strictEqual(localStorage.getItem('key'), null);

  // can't make assuptions about key positioning
  localStorage.setItem('a', 1);
  assert.strictEqual(localStorage.key(0), 'a');

  localStorage.setItem('b', '2');
  assert.strictEqual(localStorage.getItem('a'), '1');
  assert.strictEqual(localStorage.getItem('b'), '2');
  assert.strictEqual(localStorage.length, 2);

  assert.strictEqual(localStorage['c'], undefined);
  assert.strictEqual(localStorage.getItem('c'), null);

  localStorage.setItem('c');
  assert.strictEqual(localStorage.getItem('c'), "undefined");
  assert.strictEqual(localStorage.length, 3);

  localStorage.removeItem('c');
  assert.strictEqual(localStorage.getItem('c'), null);
  assert.strictEqual(localStorage.length, 2);

  localStorage.clear();
  assert.strictEqual(localStorage.getItem('a'), null);
  assert.strictEqual(localStorage.getItem('b'), null);
  assert.strictEqual(localStorage.length, 0);

  console.log('All tests passed');
}());
