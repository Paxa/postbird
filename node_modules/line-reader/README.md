Line Reader
===========

Asynchronous line-by-line file reader.

Install
-------

`npm install line-reader`

Usage
-----

The `eachLine` function reads each line of the given file.  Upon each new line,
the given callback function is called with two parameters: the line read and a
boolean value specifying whether the line read was the last line of the file.
If the callback returns `false`, reading will stop and the file will be closed.

    var lineReader = require('line-reader');

    lineReader.eachLine('file.txt', function(line, last) {
      console.log(line);

      if (/* done */) {
        return false; // stop reading
      }
    });

`eachLine` can also be used in an asynchronous manner by providing a third
callback parameter like so:

    var lineReader = require('line-reader');

    lineReader.eachLine('file.txt', function(line, last, cb) {
      console.log(line);

      if (/* done */) {
        cb(false); // stop reading
      } else {
        cb();
      }
    });

The `eachLine` function also returns an object with one property, `then`.  If a
callback is provided to `then`, it will be called once all lines have been read.

    var lineReader = require('line-reader');

    // read all lines:
    lineReader.eachLine('file.txt', function(line) {
      console.log(line);
    }).then(function () {
      console.log("I'm done!!");
    });


For more granular control, `open`, `hasNextLine`, and `nextLine` maybe be used
to iterate a file:

    // or read line by line:
    lineReader.open('file.txt', function(reader) {
      if (reader.hasNextLine()) {
        reader.nextLine(function(line) {
          console.log(line);
        });
      }
    });

Contributors
------------

* Nick Ewing
* Jameson Little (beatgammit)

Copyright 2011 Nick Ewing.
