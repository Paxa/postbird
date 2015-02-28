var fs = require('fs');
var lru = require('lru-cache');
var util = require('util');

var linesOfContext = 3;
var tracePattern = /^\s*at (?:([^(]+(?: \[\w\s+\])?) )?\(?(.+?)(?::(\d+):(\d+)(?:, <js>:(\d+):(\d+))?)?\)?$/;

var jadeTracePattern = /^\s*at .+ \(.+ (at[^)]+\))\)$/;
var jadeFramePattern = /^\s*(>?) [0-9]+\|(\s*.+)$/m;

exports.parseException = function(exc, callback) {
  var multipleErrs = getMultipleErrors(exc.errors);

  return exports.parseStack(exc.stack, function(err, stack) {
    if (err) {
      console.error('could not parse exception, err: ' + err);
      return callback(err);
    } else {
      var message = exc.message || '<no message>';
      var ret = {
        class: exc.name,
        message: message,
        frames: stack
      };

      if (multipleErrs && multipleErrs.length) {
        var firstErr = multipleErrs[0];
        ret = {
          class: exc.name,
          message: firstErr.message,
          frames: stack
        };
      }

      var jadeMatch = message.match(jadeFramePattern);
      if (jadeMatch) {
        jadeData = parseJadeDebugFrame(message);
        ret.message = jadeData.message;
        ret.frames.push(jadeData.frame);
      }
      return callback(null, ret);
    }
  });
};

var cache = lru({max: 100});
var pendingReads = {};

exports.cache = cache;
exports.pendingReads = pendingReads;

exports.parseStack = function(stack, callback) {
  // grab all lines except the first
  var lines = (stack || '').split('\n').slice(1);
  var frames = [];
  var curLine;

  var looper = function(err) {
    if (err) {
      console.error('error while parsing the stack trace, err: ' + err);
      return callback(err);
    } else if (lines.length) {
      curLine = lines.shift();

      var matched = curLine.match(jadeTracePattern);
      if (matched) {
        curLine = matched[1];
      }
      matched = curLine.match(tracePattern);
      if (!matched) {
        return looper(null);
      }

      var data = matched.slice(1);
      var frame = {
        method: data[0] || '<unknown>',
        filename: data[1],
        lineno: ~~data[2],
        colno: ~~data[3]
      };
      // For coffeescript, lineno and colno refer to the .coffee positions
      // The .js lineno and colno will be stored in compiled_*
      if (data[4]) {
        frame.compiled_lineno = ~~data[4];
      }
      if (data[5]) {
        frame.compiled_colno = ~~data[5];
      }

      var pendingCallback = function(err) {
        // internal Node files are not full path names. Ignore them.
        if (frame.filename[0] === '/' || frame.filename[0] === '.') {

          // There was an error reading the file, just push the frame and
          // move on.
          if (err) {
            frames.push(frame);
          } else {
            // check if it has been read in first
            var cachedFileLines = cache.get(frame.filename);
            if (cachedFileLines) {
              extractContextLines(frame, cachedFileLines);
              frames.push(frame);
            } else {
              // If it has not been read yet, check to see if the file is pending
              // any reads from other callbacks. If so, queue up pendingCallback to
              // be called once the read is complete. If not, read the file async.
              if (pendingReads[frame.filename]) {
                pendingReads[frame.filename].push(pendingCallback);
                return;
              }

              pendingReads[frame.filename] = pendingReads[frame.filename] || [];
              return fs.readFile(frame.filename, 'utf8', function(err2, fileData) {
                try {
                  if (err2) {
                    console.error('could not read in file ' + frame.filename + ' for context');
                    return pendingCallback(err2);
                  } else {
                    var fileLines = fileData.split('\n');
                    cache.set(frame.filename, fileLines);
                    extractContextLines(frame, fileLines);
                    frames.push(frame);
                    return looper(null);
                  }
                } finally {
                  var pendingReadCallbacks = pendingReads[frame.filename];

                  // Check for any pending reads and call their callbacks
                  if (pendingReadCallbacks) {
                    var cb;
                    while (cb = pendingReadCallbacks.shift()) {
                      cb(err2);
                    }
                    delete pendingReads[frame.filename];
                  }
                }
              });
            }
          }
        } else {
          frames.push(frame);
        }
        return looper(null);
      };
      return pendingCallback();
    } else {
      frames.reverse();
      return callback(null, frames);
    }
  };
  return looper(null);
};

var getMultipleErrors = function(errors) {
  if (errors == null || errors == undefined) {
    return null;
  }

  if (typeof errors !== "object") {
    return null;
  }

  if (util.isArray(errors)) {
    return errors;
  }

  var errArray = [];

  for (var key in errors) {
    if (errors.hasOwnProperty(key)) {
      errArray.push(errors[key]);
    }
  }
  return errArray;
}

var parseJadeDebugFrame = function(body) {
  // Given a Jade exception body, return a frame object
  var lines = body.split('\n');
  var lineNumSep = lines[0].indexOf(':');
  var filename = lines[0].slice(0, lineNumSep);
  var lineno = parseInt(lines[0].slice(lineNumSep + 1));
  var numLines = lines.length;
  var msg = lines[numLines - 1];

  lines = lines.slice(1, numLines - 1);

  var i;
  var contextLine;
  var preContext = [];
  var postContext = [];
  var line;
  for (i = 0; i < numLines - 2; ++i) {
    line = lines[i];
    jadeMatch = line.match(jadeFramePattern);
    if (jadeMatch) {
      if (jadeMatch[1] === '>') {
        contextLine = jadeMatch[2];
      } else {
        if (!contextLine) {
          if (jadeMatch[2]) {
            preContext.push(jadeMatch[2]);
          }
        } else {
          if (jadeMatch[2]) {
            postContext.push(jadeMatch[2]);
          }
        }
      }
    }
  }

  preContext = preContext.slice(0, Math.min(preContext.length, linesOfContext));
  postContext = postContext.slice(0, Math.min(postContext.length, linesOfContext));

  return {frame: {method: '<jade>',
                  filename: filename,
                  lineno: lineno,
                  code: contextLine,
                  context: {
                    pre: preContext,
                    post: postContext
                  }},
          message: msg};

};

var extractContextLines = function(frame, fileLines) {
  frame.code = fileLines[frame.lineno - 1];
  frame.context = {
    pre: fileLines.slice(Math.max(0, frame.lineno - (linesOfContext + 1)), frame.lineno - 1),
    post: fileLines.slice(frame.lineno, frame.lineno + linesOfContext)
  };
};
