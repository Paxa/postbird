var types = require('../')
var parse = types.getTypeParser(1009, 'text');
var dateParse = types.getTypeParser(1115, 'text');
var assert = require('./assert');

describe('array parsing', function() {
  it("testing empty array", function(){
    var input = '{}';
    var expected = [];
    assert.deepEqual(parse(input), expected);
  });

  it("testing empty string array", function(){
    var input = '{""}';
    var expected = [""];
    assert.deepEqual(parse(input), expected);
  });

  it("testing numeric array", function(){
    var input = '{1,2,3,4}';
    var expected = [1,2,3,4];
    assert.deepEqual(parse(input), expected);
  });

  it("testing stringy array", function(){
    var input = '{a,b,c,d}';
    var expected = ['a','b','c','d'];
    assert.deepEqual(parse(input), expected);
  });

  it("testing stringy array containing escaped strings", function(){
    var input = '{"\\"\\"\\"","\\\\\\\\\\\\"}';
    var expected = ['"""','\\\\\\'];
    assert.deepEqual(parse(input), expected);
  });

  it("testing NULL array", function(){
    var input = '{NULL,NULL}';
    var expected = [null,null];
    assert.deepEqual(parse(input), expected);
  });
  
  it("testing BOOL array", function(){
    var input = '{t,NULL,f}';
    var expected = [true,null,false];
    assert.deepEqual(types.getTypeParser(1000, 'text')(input), expected);
  });

  it("test timestamp without timezone[]", function(){
    var input = '{2010-12-11 09:09:04.1}';
    var expected = JSON.stringify([new Date(2010,11,11,9,9,4,100)]);
    assert.deepEqual(JSON.stringify(dateParse(input)), expected);
  });

  it("test timestamp with timezone[]", function(){
    var input = '{2010-12-11 09:09:04-08:00}';
    var expected = "[\"2010-12-11T17:09:04.000Z\"]";
    assert.deepEqual(JSON.stringify(dateParse(input)), expected);
  });
});
