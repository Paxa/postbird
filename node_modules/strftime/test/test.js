#!/usr/bin/env node

// Based on CoffeeScript by andrewschaaf on github
//
// TODO:
// - past and future dates, especially < 1900 and > 2100
// - locales
// - look for edge cases

var assert = require('assert')
  , libFilename = process.argv[2] || '../strftime.js'
  , lib = require(libFilename)

    // Tue, 07 Jun 2011 18:51:45 GMT
  , Time = new Date(1307472705067)

assert.fn = function(value, msg) {
  assert.equal('function', typeof value, msg)
}

assert.format = function(format, expected, expectedUTC, time) {
  time = time || Time
  function _assertFmt(expected, name) {
    name = name || 'strftime'
    var actual = lib[name](format, time)
    assert.equal(expected, actual,
                 name + '("' + format + '", ' + time + ') is ' + JSON.stringify(actual)
                 + ', expected ' + JSON.stringify(expected))
  }

  if (expected) _assertFmt(expected)
  _assertFmt(expectedUTC || expected, 'strftimeUTC')
}

/// check exports
assert.fn(lib.strftime)
assert.fn(lib.strftimeUTC)
assert.fn(lib.localizedStrftime)
ok('Exports')

/// time zones
if (!process.env.TZ || process.env.TZ == 'America/Vancouver') {
  testTimezone('P[DS]T')
  assert.format('%C', '01', '01', new Date(100, 0, 1))
  assert.format('%j', '097', '098', new Date(1365390736236))
  ok('Time zones (' + process.env.TZ + ')')
}
else if (process.env.TZ == 'CET') {
  testTimezone('CES?T')
  assert.format('%C', '01', '00', new Date(100, 0, 1))
  assert.format('%j', '098', '098', new Date(1365390736236))
  ok('Time zones (' + process.env.TZ + ')')
}
else {
  console.log('(Current timezone has no tests: ' + process.env.TZ + ')')
}

/// check all formats in GMT, most coverage
assert.format('%A', 'Tuesday')
assert.format('%a', 'Tue')
assert.format('%B', 'June')
assert.format('%b', 'Jun')
assert.format('%C', '20')
assert.format('%D', '06/07/11')
assert.format('%d', '07')
assert.format('%-d', '7')
assert.format('%_d', ' 7')
assert.format('%0d', '07')
assert.format('%e', '7')
assert.format('%F', '2011-06-07')
assert.format('%H', null, '18')
assert.format('%h', 'Jun')
assert.format('%I', null, '06')
assert.format('%-I', null, '6')
assert.format('%_I', null, ' 6')
assert.format('%0I', null, '06')
assert.format('%j', null, '158')
assert.format('%k', null, '18')
assert.format('%L', '067')
assert.format('%l', null, ' 6')
assert.format('%-l', null, '6')
assert.format('%_l', null, ' 6')
assert.format('%0l', null, '06')
assert.format('%M', null, '51')
assert.format('%m', '06')
assert.format('%n', '\n')
assert.format('%o', '7th')
assert.format('%P', null, 'pm')
assert.format('%p', null, 'PM')
assert.format('%R', null, '18:51')
assert.format('%r', null, '06:51:45 PM')
assert.format('%S', '45')
assert.format('%s', '1307472705')
assert.format('%T', null, '18:51:45')
assert.format('%t', '\t')
assert.format('%U', '23')
assert.format('%U', '24', null, new Date(+Time + 5 * 86400000))
assert.format('%u', '2')
assert.format('%v', '7-Jun-2011')
assert.format('%W', '23')
assert.format('%W', '23', null, new Date(+Time + 5 * 86400000))
assert.format('%w', '2')
assert.format('%Y', '2011')
assert.format('%y', '11')
assert.format('%Z', null, 'GMT')
assert.format('%z', null, '+0000')
assert.format('%%', '%') // any other char
ok('GMT')


/// locales

var it_IT =
{ days: words('domenica lunedi martedi mercoledi giovedi venerdi sabato')
, shortDays: words('dom lun mar mer gio ven sab')
, months: words('gennaio febbraio marzo aprile maggio giugno luglio agosto settembre ottobre novembre dicembre')
, shortMonths: words('gen feb mar apr mag giu lug ago set ott nov dic')
, AM: 'it$AM'
, PM: 'it$PM'
, am: 'it$am'
, pm: 'it$pm'
, formats: {
    D: 'it$%m/%d/%y'
  , F: 'it$%Y-%m-%d'
  , R: 'it$%H:%M'
  , r: 'it$%I:%M:%S %p'
  , T: 'it$%H:%M:%S'
  , v: 'it$%e-%b-%Y'
  }
}

assert.format_it = function(format, expected, expectedUTC) {
  function _assertFmt(expected, name) {
    name = name || 'strftime'
    var actual = lib[name](format, Time, it_IT)
    assert.equal(expected, actual,
                 name + '("' + format + '", Time) is ' + JSON.stringify(actual)
                 + ', expected ' + JSON.stringify(expected))
  }

  if (expected) _assertFmt(expected)
  _assertFmt(expectedUTC || expected, 'strftimeUTC')
}

assert.format_it('%A', 'martedi')
assert.format_it('%a', 'mar')
assert.format_it('%B', 'giugno')
assert.format_it('%b', 'giu')
assert.format_it('%D', 'it$06/07/11')
assert.format_it('%F', 'it$2011-06-07')
assert.format_it('%p', null, 'it$PM')
assert.format_it('%P', null, 'it$pm')
assert.format_it('%R', null, 'it$18:51')
assert.format_it('%r', null, 'it$06:51:45 it$PM')
assert.format_it('%T', null, 'it$18:51:45')
assert.format_it('%v', 'it$7-giu-2011')
ok('Localization')


/// helpers

function words(s) { return (s || '').split(' '); }

function ok(s) { console.log('[ \033[32mOK\033[0m ] ' + s) }

// Pass a regex or string that matches the timezone abbrev, e.g. %Z above.
// Don't pass GMT! Every date includes it and it will fail.
// Be careful if you pass a regex, it has to quack like the default one.
function testTimezone(regex) {
  regex = typeof regex === 'string' ? RegExp('\\((' + regex + ')\\)$') : regex
  var match = Time.toString().match(regex)
  if (match) {
    var off = Time.getTimezoneOffset()
      , hourOff = off / 60
      , hourDiff = Math.floor(hourOff)
      , hours = 18 - hourDiff
      , padSpace24 = hours < 10 ? ' ' : ''
      , padZero24 = hours < 10 ? '0' : ''
      , hour24 = String(hours)
      , padSpace12 = (hours % 12) < 10 ? ' ' : ''
      , padZero12 = (hours % 12) < 10 ? '0' : ''
      , hour12 = String(hours % 12)
      , sign = hourDiff < 0 ? '+' : '-'
      , minDiff = Time.getTimezoneOffset() - (hourDiff * 60)
      , mins = String(51 - minDiff)
      , tz = match[1]
      , ampm = hour12 == hour24 ? 'AM' : 'PM'
      , R = hour24 + ':' + mins
      , r = padZero12 + hour12 + ':' + mins + ':45 ' + ampm
      , T = R + ':45'
    assert.format('%H', padZero24 + hour24, '18')
    assert.format('%I', padZero12 + hour12, '06')
    assert.format('%k', padSpace24 + hour24, '18')
    assert.format('%l', padSpace12 + hour12, ' 6')
    assert.format('%M', mins)
    assert.format('%P', ampm.toLowerCase(), 'pm')
    assert.format('%p', ampm, 'PM')
    assert.format('%R', R, '18:51')
    assert.format('%r', r, '06:51:45 PM')
    assert.format('%T', T, '18:51:45')
    assert.format('%Z', tz, 'GMT')
    assert.format('%z', sign + '0' + Math.abs(hourDiff) + '00', '+0000')
  }
}
