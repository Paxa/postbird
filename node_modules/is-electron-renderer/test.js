var assert = require('assert')

/* global describe it */

describe('isRenderer', function () {
  it('should return false in Node.js', function () {
    var isRenderer = require('./')
    assert(!isRenderer)
  })
})
