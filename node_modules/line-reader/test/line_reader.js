var lineReader             = require('../lib/line_reader'),
    assert                 = require('assert'),
    testFilePath           = __dirname + '/data/normal_file.txt',
    separatorFilePath      = __dirname + '/data/separator_file.txt',
    multiSeparatorFilePath = __dirname + '/data/multi_separator_file.txt',
    multibyteFilePath      = __dirname + '/data/multibyte_file.txt',
    emptyFilePath          = __dirname + '/data/empty_file.txt',
    oneLineFilePath        = __dirname + '/data/one_line_file.txt',
    threeLineFilePath      = __dirname + '/data/three_line_file.txt',
    testSeparatorFile      = ['foo', 'bar\n', 'baz\n'],
    testFile = [
      'Jabberwocky',
      '',
      '’Twas brillig, and the slithy toves',
      'Did gyre and gimble in the wabe;',
      '',
      ''
    ];

describe("lineReader", function() {
  describe("eachLine", function() {
    it("should read lines using the defalut separator", function(done) {
      var i = 0;

      lineReader.eachLine(testFilePath, function(line, last) {
        assert.equal(testFile[i], line, 'Each line should be what we expect');
        i += 1;

        if (i === 6) {
          assert.ok(last);
        } else {
          assert.ok(!last);
        }
      }).then(function() {
        assert.equal(6, i);
        done();
      });
    });

    it("should allow continuation of line reading via a callback", function(done) {
      var i = 0;

      lineReader.eachLine(testFilePath, function(line, last, cb) {
        assert.equal(testFile[i], line, 'Each line should be what we expect');
        i += 1;

        if (i === 6) {
          assert.ok(last);
        } else {
          assert.ok(!last);
        }

        process.nextTick(cb);
      }).then(function() {
        assert.equal(6, i);
        done();
      });
    });

    it("should separate files using given separator", function(done) {
      var i = 0;
      lineReader.eachLine(separatorFilePath, function(line, last) {
        assert.equal(testSeparatorFile[i], line);
        i += 1;
      
        if (i === 3) {
          assert.ok(last);
        } else {
          assert.ok(!last);
        }
      }, ';').then(function() {
        assert.equal(3, i);
        done();
      });
    });

    it("should separate files using given separator with more than one character", function(done) {
      var i = 0;
      lineReader.eachLine(multiSeparatorFilePath, function(line, last) {
        assert.equal(testSeparatorFile[i], line);
        i += 1;
      
        if (i === 3) {
          assert.ok(last);
        } else {
          assert.ok(!last);
        }
      }, '||').then(function() {
        assert.equal(3, i);
        done();
      });
    });

    it("should allow early termination of line reading", function(done) {
      var i = 0;
      lineReader.eachLine(testFilePath, function(line, last) {
        assert.equal(testFile[i], line, 'Each line should be what we expect');
        i += 1;

        if (i === 2) {
          return false;
        }
      }).then(function() {
        assert.equal(2, i);
        done();
      });
    });

    it("should allow early termination of line reading via a callback", function(done) {
      var i = 0;
      lineReader.eachLine(testFilePath, function(line, last, cb) {
        assert.equal(testFile[i], line, 'Each line should be what we expect');
        i += 1;

        if (i === 2) {
          cb(false);
        } else {
          cb();
        }

      }).then(function() {
        assert.equal(2, i);
        done();
      });
    });

    it("should not call callback on empty file", function(done) {
      lineReader.eachLine(emptyFilePath, function(line) {
        assert.ok(false, "Empty file should not cause any callbacks");
      }).then(function() {
        done()
      });
    });

    it("should work with a file containing only one line", function(done) {
      lineReader.eachLine(oneLineFilePath, function(line, last) {
        done();
        return false;
      });
    });

  });

  describe("open", function() {
    it("should return a reader object and allow calls to nextLine", function(done) {
      lineReader.open(testFilePath, function(reader) {
        assert.ok(reader.hasNextLine());
      
        assert.ok(reader.hasNextLine(), 'Calling hasNextLine multiple times should be ok');
      
        reader.nextLine(function(line) {
          assert.equal('Jabberwocky', line);
          assert.ok(reader.hasNextLine());
          reader.nextLine(function(line) {
            assert.equal('', line);
            assert.ok(reader.hasNextLine());
            reader.nextLine(function(line) {
              assert.equal('’Twas brillig, and the slithy toves', line);
              assert.ok(reader.hasNextLine());
              reader.nextLine(function(line) {
                assert.equal('Did gyre and gimble in the wabe;', line);
                assert.ok(reader.hasNextLine());
                reader.nextLine(function(line) {
                  assert.equal('', line);
                  assert.ok(reader.hasNextLine());
                  reader.nextLine(function(line) {
                    assert.equal('', line);
                    assert.ok(!reader.hasNextLine());
      
                    assert.throws(function() {
                      reader.nextLine(function() {
                      });
                    }, Error, "Should be able to read next line at EOF");

                    done();
                  });
                });
              });
            });
          });
        });
      });
    });

    it("should work with a file containing only one line", function(done) {
      lineReader.open(oneLineFilePath, function(reader) {
        done();
      });
    });

    it("should read multibyte characters on the buffer boundary", function(done) {
      lineReader.open(multibyteFilePath, function(reader) {
        assert.ok(reader.hasNextLine());
        reader.nextLine(function(line) {
          assert.equal('ふうりうの初やおくの田植うた', line,
                       "Should read multibyte characters on buffer boundary");
          done();
        });
      }, '\n', 'utf8', 2);
    });

    describe("hasNextLine", function() {
      it("should return true when buffer is empty but not at EOF", function(done) {
        lineReader.open(threeLineFilePath, function(reader) {
          reader.nextLine(function(line) {
            assert.equal("This is line one.", line);
            assert.ok(reader.hasNextLine());
            reader.nextLine(function(line) {
              assert.equal("This is line two.", line);
              assert.ok(reader.hasNextLine());
              reader.nextLine(function(line) {
                assert.equal("This is line three.", line);
                assert.ok(!reader.hasNextLine());
                done();
              });
            });
          });
        }, '\n', 'utf-8', 36);
      });
    });
  });
});
