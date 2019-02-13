const Benchmark = require('benchmark');
const ViewHelpers = require('./app/view_helpers');
const moment = require('moment');

var suite = new Benchmark.Suite({
  maxTime: 3,
  minSamples: 3,
  onError: event => {
    console.error(event.target.error);
  }
});

var val = '2017-09-16 07:33:11.640783+02'
var date = moment.parseZone(val);
date.origValueString = val;

// add tests
//suite.add('betterDateTimeZ', () => {
//  ViewHelpers.betterDateTimeZ(date);
//})
//suite.add('betterDateTimeZ2', () => {
//  ViewHelpers.betterDateTimeZ2(date);
//})
//suite.add('betterDateTimeZ3', () => {
//  ViewHelpers.betterDateTimeZ3(date);
//})

suite.on('cycle', event => {
  //console.log(event);
  console.log(String(event.target));
})
.on('complete', function () {
  //console.log(this);
  console.log(`Fastest is ${this.filter('fastest').map('name')}`);
})
// run async
.run({ 'async': true });
