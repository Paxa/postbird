var assert = require('assert');

assert.true = (value) => {
  return assert(value);
}

assert.false = (value) => {
  return assert.equal(value, false);
}

assert.match = (value, regex) => {
  return assert(regex.test(value), `Value ${value} should match ${regex}`);
}

assert.contain = (string, value) => {
  return assert(string.includes(value), `Value ${string} should include ${value}`);
}

assert.greaterThen = (number, otherNumner) => {
  return assert(number > otherNumner, `Value ${number} should br greater then ${otherNumner}`);
}

module.exports = assert;