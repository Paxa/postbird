/*jslint devel: true, nomen: true, plusplus: true, regexp: true, indent: 2, maxlen: 100 */

"use strict";

var async = require('async');
var fs = require('fs');
var lru = require('lru-cache');
var util = require('util');

var linesOfContext = 3;
var tracePattern =
  /^\s*at (?:([^(]+(?: \[\w\s+\])?) )?\(?(.+?)(?::(\d+):(\d+)(?:, <js>:(\d+):(\d+))?)?\)?$/;

var jadeTracePattern = /^\s*at .+ \(.+ (at[^)]+\))\)$/;
var jadeFramePattern = /^\s*(>?) [0-9]+\|(\s*.+)$/m;


var cache = lru({max: 100});
var pendingReads = {};

exports.cache = cache;
exports.pendingReads = pendingReads;


/*
 * Internal
 */


function getMultipleErrors(errors) {
  var errArray, key;

  if (errors === null || errors === undefined) {
    return null;
  }

  if (typeof errors !== "object") {
    return null;
  }

  if (util.isArray(errors)) {
    return errors;
  }

  errArray = [];

  for (key in errors) {
    if (errors.hasOwnProperty(key)) {
      errArray.push(errors[key]);
    }
  }
  return errArray;
}


function parseJadeDebugFrame(body) {
  var lines, lineNumSep, filename, lineno, numLines, msg, i,
    contextLine, preContext, postContext, line, jadeMatch;

  // Given a Jade exception body, return a frame object
  lines = body.split('\n');
  lineNumSep = lines[0].indexOf(':');
  filename = lines[0].slice(0, lineNumSep);
  lineno = parseInt(lines[0].slice(lineNumSep + 1), 10);
  numLines = lines.length;
  msg = lines[numLines - 1];

  lines = lines.slice(1, numLines - 1);

  preContext = [];
  postContext = [];
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

  return {
    frame: {
      method: '<jade>',
      filename: filename,
      lineno: lineno,
      code: contextLine,
      context: {
        pre: preContext,
        post: postContext
      }
    },
    message: msg
  };
}


function extractContextLines(frame, fileLines) {
  frame.code = fileLines[frame.lineno - 1];
  frame.context = {
    pre: fileLines.slice(Math.max(0, frame.lineno - (linesOfContext + 1)), frame.lineno - 1),
    post: fileLines.slice(frame.lineno, frame.lineno + linesOfContext)
  };
}


function parseFrameLine(line, callback) {
  var matched, curLine, data, frame;

  curLine = line;
  matched = curLine.match(jadeTracePattern);
  if (matched) {
    curLine = matched[1];
  }
  matched = curLine.match(tracePattern);
  if (!matched) {
    return callback(null, null);
  }

  data = matched.slice(1);
  frame = {
    method: data[0] || '<unknown>',
    filename: data[1],
    lineno: Math.floor(data[2]),
    colno: Math.floor(data[3])
  };

  // For coffeescript, lineno and colno refer to the .coffee positions
  // The .js lineno and colno will be stored in compiled_*
  if (data[4]) {
    frame.compiled_lineno = Math.floor(data[4]);
  }

  if (data[5]) {
    frame.compiled_colno = Math.floor(data[5]);
  }

  callback(null, frame);
}


function shouldReadFrameFile(frameFilename, callback) {
  var isValidFilename, isCached, isPending;

  isValidFilename = frameFilename[0] === '/' || frameFilename[0] === '.';
  isCached = !!cache.get(frameFilename);
  isPending = !!pendingReads[frameFilename];

  callback(isValidFilename && !isCached && !isPending);
}


function readFileLines(filename, callback) {
  try {
    fs.readFile(filename, function (err, fileData) {
      var fileLines;
      if (err) {
        return callback(err);
      }

      fileLines = fileData.toString('utf8').split('\n');
      return callback(null, fileLines);
    });
  } catch (e) {
    console.log(e);
  }
}


/* Older versions of node do not have fs.exists so we implement our own */
function checkFileExists(filename, callback) {
  if (fs.exists !== undefined) {
    fs.exists(filename, callback);
  } else {
    fs.stat(filename, function (err) {
      callback(!err);
    });
  }
}


function gatherContexts(frames, callback) {
  var frameFilenames = [];

  frames.forEach(function (frame) {
    if (frameFilenames.indexOf(frame.filename) === -1) {
      frameFilenames.push(frame.filename);
    }
  });

  async.filter(frameFilenames, shouldReadFrameFile, function (results) {
    var tempFileCache;

    tempFileCache = {};

    function gatherFileData(filename, callback) {
      readFileLines(filename, function (err, lines) {
        if (err) {
          return callback(err);
        }

        // Cache this in a temp cache as well as the LRU cache so that
        // we know we will have all of the necessary file contents for
        // each filename in tempFileCache.
        tempFileCache[filename] = lines;
        cache.set(filename, lines);

        return callback(null);
      });
    }

    function gatherContextLines(frame, callback) {
      var lines = tempFileCache[frame.filename] || cache.get(frame.filename);

      if (lines) {
        extractContextLines(frame, lines);
      }
      callback(null);
    }

    async.filter(results, checkFileExists, function (filenames) {
      async.each(filenames, gatherFileData, function (err) {
        if (err) {
          return callback(err);
        }
        async.eachSeries(frames, gatherContextLines, function (err) {
          if (err) {
            return callback(err);
          }
          callback(null, frames);
        });
      });
    });

  });
}

/*
 * Public API
 */


exports.parseException = function (exc, callback) {
  var multipleErrs = getMultipleErrors(exc.errors);

  return exports.parseStack(exc.stack, function (err, stack) {
    var message, ret, firstErr, jadeMatch, jadeData;

    if (err) {
      console.error('could not parse exception, err: ' + err);
      return callback(err);
    }
    message = String(exc.message) || '<no message>';
    ret = {
      class: exc.name,
      message: message,
      frames: stack
    };

    if (multipleErrs && multipleErrs.length) {
      firstErr = multipleErrs[0];
      ret = {
        class: exc.name,
        message: String(firstErr.message),
        frames: stack
      };
    }

    jadeMatch = message.match(jadeFramePattern);
    if (jadeMatch) {
      jadeData = parseJadeDebugFrame(message);
      ret.message = jadeData.message;
      ret.frames.push(jadeData.frame);
    }
    return callback(null, ret);
  });
};


exports.parseStack = function (stack, callback) {
  var lines;

  // grab all lines except the first
  lines = (stack || '').split('\n').slice(1);

  // Parse out all of the frame and filename info
  async.map(lines, parseFrameLine, function (err, frames) {
    if (err) {
      return callback(err);
    }
    frames.reverse();
    async.filter(frames, function (frame, callback) { callback(!!frame); }, function (results) {
      gatherContexts(results, callback);
    });
  });
};
