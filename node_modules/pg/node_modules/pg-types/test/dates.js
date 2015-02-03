/*global describe, it*/
var parse = require("../").getTypeParser(1114, "text");
var assert = require("./assert");

//some of these tests might be redundant
//they were ported over from node-postgres
//regardles: more tests is a good thing, right? :+1:
describe("date parser", function() {
  it("parses date", function() {
    assert.equal(
      parse("2010-12-11 09:09:04").toString(),
      new Date("2010-12-11 09:09:04").toString()
    );
  });

  var testForMs = function(part, expected) {
    var dateString = "2010-01-01 01:01:01" + part;
    it("testing for correcting parsing of " + dateString, function() {
      var ms = parse(dateString).getMilliseconds();
      assert.equal(ms, expected);
    });
  };

  testForMs(".1", 100);
  testForMs(".01", 10);
  testForMs(".74", 740);

  describe("parses dates with", function () {

    it("no timezones", function() {
      var actual = "2010-12-11 09:09:04.1";
      var expected = JSON.stringify(new Date(2010,11,11,9,9,4,100));
      assert.equal(JSON.stringify(parse(actual)),expected);
    });

    it("huge millisecond value", function() {
      var actual = "2011-01-23 22:15:51.280843-06";
      var expected = "\"2011-01-24T04:15:51.280Z\"";
      assert.equal(JSON.stringify(parse(actual)),expected);
    });

    it("Zulu time offset", function() {
      var actual = "2011-01-23 22:15:51Z";
      var expected = "\"2011-01-23T22:15:51.000Z\"";
      assert.equal(JSON.stringify(parse(actual)),expected);
    });

    it("positive hour offset", function() {
      var actual = "2011-01-23 10:15:51+04";
      var expected = "\"2011-01-23T06:15:51.000Z\"";
      assert.equal(JSON.stringify(parse(actual)),expected);
    });

    it("negative hour offset", function() {
      var actual = "2011-01-23 10:15:51-04";
      var expected = "\"2011-01-23T14:15:51.000Z\"";
      assert.equal(JSON.stringify(parse(actual)),expected);
    });

    it("positive HH:mm offset", function() {
      var actual = "2011-01-23 10:15:51+06:10";
      var expected = "\"2011-01-23T04:05:51.000Z\"";
      assert.equal(JSON.stringify(parse(actual)),expected);
    });

    it("negative HH:mm offset", function() {
      var actual = "2011-01-23 10:15:51-06:10";
      var expected = "\"2011-01-23T16:25:51.000Z\"";
      assert.equal(JSON.stringify(parse(actual)),expected);
    });

    it("positive HH:mm:ss offset", function() {
      var actual = "0005-02-03 10:53:28+01:53:28";
      var expected = "\"0005-02-03T09:00:00.000Z\"";
      assert.equal(JSON.stringify(parse(actual)),expected);
    });

    it("negative HH:mm:ss offset", function() {
      var actual = "0005-02-03 09:58:45-02:01:15";
      var expected = "\"0005-02-03T12:00:00.000Z\"";
      assert.equal(JSON.stringify(parse(actual)),expected);
    });
  });

});
