strftime
========

strftime for JavaScript, works in Node.js and browsers, supports localization.
Most standard specifiers from C are supported as well as some other extensions
from Ruby.


Installation
============

npm install strftime


Usage
=====

    var strftime = require('strftime')
    console.log(strftime('%B %d, %y %H:%M:%S')) // => April 28, 2011 18:21:08
    console.log(strftime('%F %T', new Date(1307472705067))) // => 2011-06-07 18:51:45


If you want to localize it:

    var strftime = require('strftime')
    var it_IT = {
        days: [ 'domenica', 'lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi', 'sabato' ],
        shortDays: [ 'dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab' ],

        months: [ 'gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio',
                  'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre' ],

        shortMonths: [ 'gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago',
                       'set', 'ott', 'nov', 'dic' ],
        AM: 'AM',
        PM: 'PM'
    }
    console.log(strftime('%B %d, %y %H:%M:%S', it_IT)) // => aprile 28, 2011 18:21:08
    console.log(strftime('%B %d, %y %H:%M:%S', new Date(1307472705067), it_IT)) // => giugno 7, 2011 18:51:45

And if you don't want to pass a localization object every time you can get a localized `strftime` function like so:

    var strftime = require('strftime')
    var it_IT = { /* same as above */ }
    var strftime_IT = strftime.localizedStrftime(it_IT)
    console.log(strftime_IT('%B %d, %y %H:%M:%S')) // aprile 28, 2011 18:21:08


Supported Specifiers
====================

Extensions from Ruby are noted in the following list.

Unsupported specifiers are rendered without the percent sign.
e.g. `%q` becomes `q`. Use `%%` to get a literal `%` sign.

- A: full weekday name
- a: abbreviated weekday name
- B: full month name
- b: abbreviated month name
- C: AD century (year / 100), padded to 2 digits
- D: equivalent to `%m/%d/%y`
- d: day of the month, padded to 2 digits (01-31)
- e: day of the month, padded with a leading space for single digit values (1-31)
- F: equivalent to `%Y-%m-%d`
- H: the hour (24-hour clock), padded to 2 digits (00-23)
- h: the same as %b (abbreviated month name)
- I: the hour (12-hour clock), padded to 2 digits (01-12)
- j: day of the year, padded to 3 digits (001-366)
- k: the hour (24-hour clock), padded with a leading space for single digit values (0-23)
- L: the milliseconds, padded to 3 digits [Ruby extension]
- l: the hour (12-hour clock), padded with a leading space for single digit values (1-12)
- M: the minute, padded to 2 digits (00-59)
- m: the month, padded to 2 digits (01-12)
- n: newline character
- o: day of the month as an ordinal (without padding), e.g. 1st, 2nd, 3rd, 4th, ...
- P: "am" or "pm" in lowercase [Ruby extension]
- p: "AM" or "PM"
- R: equivalent to `%H:%M`
- r: equivalent to `%I:%M:%S %p`
- S: the second, padded to 2 digits (00-60)
- s: the number of seconds since the Epoch, UTC
- T: equivalent to `%H:%M:%S`
- t: tab character
- U: week number of the year, Sunday as the first day of the week, padded to 2 digits (00-53)
- u: the weekday, Monday as the first day of the week (1-7)
- v: equivalent to `%e-%b-%Y`
- W: week number of the year, Monday as the first day of the week, padded to 2 digits (00-53)
- w: the weekday, Sunday as the first day of the week (0-6)
- Y: the year with the century
- y: the year without the century (00-99)
- Z: the time zone name, replaced with an empty string if it is not found
- z: the time zone offset from UTC, with a leading plus sign for UTC and zones east
     of UTC and a minus sign for those west of UTC, hours and minutes follow each
     padded to 2 digits and with no delimiter between them

For more detail see `man 3 strftime` as the format specifiers should behave
identically. If behaviour differs please [file a bug](https://github.com/samsonjs/strftime/issues/new).

Any specifier can be modified with `-`, `_`, or `0` as well, as in Ruby.
Using `%-` will omit any leading zeroes or spaces, `%_` will force spaces
for padding instead of the default, and `%0` will force zeroes for padding.
There's some redundancy here as `%-d` and `%e` have the same result, but it
solves some awkwardness with formats like `%l`.

Contributors
============

* [Sami Samhuri](https://github.com/samsonjs)
* [Andrew Schaaf](https://github.com/andrewschaaf)
* [Rob Colburn](https://github.com/robcolburn)
* [Ryan Stafford](https://github.com/ryanstafford)


License
=======

Copyright 2010 - 2013 Sami Samhuri sami@samhuri.net

[MIT license](http://sjs.mit-license.org)

