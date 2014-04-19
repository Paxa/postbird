/**
 * RedScript compiler
 * Copyright(c) 2013 Adam Brodzinski <adambrodzinski@gmail.com>
 * MIT Licensed
 */

/* Checks to see if keyword is used inside a string
 * @param  {string} match - keyword to match
 * @param  {string} ln    - line to match against
 * @return {bool}         - true if match is found
 */
function insideString(match, ln) {
    var regex = "['\"][\\w\\s]*[^\\w]" + match + "[^\\w][\\w\\s]*['\"]";
    var insideStr = new RegExp(regex, "g");
    return insideStr.test(ln);
}

Array.prototype.contains = function(str) {
    var i = this.length;
    while (i--) {
        if (this[i] === str) {
            return true;
        }
    }
    return false;
};




module.exports = {

    /* Transforms a `parent*` property to `__proto__`
     *
     * @param  {string} - accepts line as a string
     * @return {string} - transformed line
     * @api public
     */
    parentProperty: function(line) {
        var regex = /\bparent\b\*/;
        return line.replace(regex, function() {
            return '__proto__';
        });
    },


    /* Transforms a RedScript object liters to a JS one.
     * Optionally an inherits keyword can be used to inherit from
     * another object.
     *
     * @param  {string} - accepts line as a string
     * @return {string} - transformed line
     * @api public
     */
    objLiteral: function(line) {
        // $0 `object foo inherits bar`
        // $1 `foo`
        // $2 `bar`
        var regex = /object ([\$\w]+)(?: < ([\$\w]+))?/;
        return line.replace(regex, function($0, $1, $2) {
            if (insideString("object", line)) return $0;
            if ($1 && $2) {
                return 'var ' + $1 + ' = { __proto__: ' + $2 + ',';
            } else {
                return 'var ' + $1 + ' = {';
            }
        });
    },


    /** Inserts `var` keyword if it's not already there
     *
     * @param  {string} line     - accepts line as a string
     * @param  {array}  declared - an array to store declared vars
     * @return {string}          - transformed line
     * @api public
     */
    insertVars: function(line, declared) {
      //   (?:
      //     (\bvar\b)    # $1 var keyword
      //     \s*          # 0+ spaces
      //     |
      //     (\.)         # $2 dot, e.g. foo.bar = baz
      //     |
      //     (@)          # $3 un-aliased `this`
      //   )?
      //   (              # $4
      //     [\w\$]+      # variable name
      //   )
      //   \s*
      //   =              # literal equals sign
      //   (?!=)          # is not a `==` or `===`
      var regexGlobal = /(?:(\bvar\b)\s*|(\.)|(@))?([\w\$]+)\s*=(?!=)/g,
          regexSingle = /(?:(\bvar\b)\s*|(\.)|(@))?([\w\$]+)\s*=(?!=)/,
          hasMultAssign = /(=\s*[\w\.]+\s*=)/;
      // if line has a mult assignment, only check the first match
      var regex = (hasMultAssign.test(line)) ? regexSingle : regexGlobal;

      return line.replace(regex, function($0, $1, $2, $3, $4) {
        // if variable name is already declared return match
        if (declared.contains($4)) {
          return $0;
        // if var keyword exists, add to declared list and return match
        } else if ($1 && $4) {
          declared.push($4);
          return $0;
        // if not declared, and variable name exists, add var keyword
        } else if (!$1 && !$2 && !$3 && $4) {
          declared.push($4);
          return 'var ' + $4 + ' =';
        } else {
          return $0;
        }
      });
    },


    /* Creates a class based constructor
     *
     * @param  {string} - accepts line as a string
     * @return {string} - transformed line
     * @api public
     */
    classes: function(line) {
        // $0 - `class Bar < Foo`
        // $1 - `Bar`
        // $2 - `<`
        // $3 - `Foo`
        var regex = /\bclass\b\s+([\w\$\.]+)(?:\s*(<)\s*([\w\$\.]+))?/,
            // $0 - `class App.Model`
            // matches variable & dot
            hasDotNot = /\bclass\b\s+([\w\$]+)\./;


        if (hasDotNot.test(line)) {
            return line.replace(regex, function($0, $1, $2, $3) {
                // update state so we know to insert inheritance
                process.emit('state:update', { hasClass: true });
                if ($1 && $2 && $3) {
                    return $1 + ' = ' + $3 + '.extend({';
                } else if ($1) {
                    return $1 + ' = Class.extend({';
                }
            });
        } else {
            return line.replace(regex, function($0, $1, $2, $3) {
                // update state so we know to insert inheritance
                process.emit('state:update', { hasClass: true });
                if ($1 && $2 && $3) {
                    return 'var ' + $1 + ' = ' + $3 + '.extend({';
                } else if ($1) {
                    return 'var '+ $1 +' = Class.extend({';
                }
            });
        }
    },


    /* Sets up super for classical methods
     *
     * @param  {string} - accepts line as a string
     * @return {string} - transformed line
     * @api public
     */
    callSuper: function(line) {
        // $0 - `super foo`
        // $1 - `super`
        // $2 - `foo`
        var regex = /(\bsuper\b)(?:\s+([\w\$,\s]+))?$/;
        return line.replace(regex, function($0, $1, $2) {
          if ($2) {
            return 'this._super(' + $2 + ');';
          } else if (!$2) {
            return 'this._super();';
          }
        });
    },


    /* While loop
     *
     * @param  {string} - accepts line as a string
     * @return {string} - transformed line
     * @api public
     */
    whileLoop: function(line) {
        // $0 - `while foo < bar`
        // $1 - `foo < bar`, condition
        // $2 - `{` , a bracket preceding condition
        var regex = /\bwhile\b\s+([^{}]+)(\{)?/;
        return line.replace(regex, function($0, $1, $2) {
            if ($2) return $0;
            else if ($1) {
              return "while (" + $1 + ") {";
            }
        });
    },


    /* Until Loop
     *
     * @param  {string} - accepts line as a string
     * @return {string} - transformed line
     * @api public
     */
    untilLoop: function(line) {
        // $0 - `until foo < bar`
        // $1 - `foo < bar`, condition
        // $2 - `{` , a bracket preceding condition
        var regex = /\buntil\b\s+([^{}]+)(\{)?/;
        return line.replace(regex, function($0, $1, $2) {
            if ($2) return $0;
            else if ($1) {
                return 'while (!( ' + $1 + ' )) { //until';
            }

        });
    },


    /* for in loop using range operator
     *
     * @param  {string} - accepts line as a string
     * @return {string} - transformed line
     * @api public
     */
    forLoopRange: function(line) {
        // $0 - `for i in 0..5`
        // $1 - `i`
        // $2 - `0`
        // $3 - `..` or `...`
        // $4 - `5`
        var regex = /for\s+([\w\$]+)\s+in\s+([\w\$]+)(..|...)([\w\$]+)/;
        return line.replace(regex, function($0, $1, $2, $3, $4) {
            if ($3 === '..') {
              //      for (var    i  =   0  ;    i   <     5   ;    i  ++) {
              return 'for (var '+$1+'='+$2+'; '+$1+' < '+ $4 +'; '+$1+'++) {';
          } else if ($3 === '...') {
              //      for (var    i  =   0  ;    i   <=    5   ;     i  ++) {
              return 'for (var '+$1+'='+$2+'; '+$1+' <= '+ $4 +'; '+$1+'++) {';
          } else { // else it might be something else, eg `for key in bar`
            return $0;
          }
        });
    },


    /* Regular for in
     *
     * @param  {string} - accepts line as a string
     * @return {string} - transformed line
     * @api public
     */
    forIn: function(line) {
       // $0 - `for key in obj`
       // $1 - `key`
       // $2 - `obj`
        var regex = /for\s+([\w$]+)\s+in\s+(\{.+\}|[\w\$]+)/;
        return line.replace(regex, function($0, $1, $2) {
            return 'for (var ' + $1 + ' in ' + $2 + ') {';
        });
    },


    /* For in array
     * Itterator value automatically increases for ever use, appends
     * the current itterator index to i to avoid conflicts
     *
     * @param  {string} - accepts line as a string
     * @return {string} - transformed line
     * @api public
     */
    forInArr: function(line) {
      // $0 - `for fruit inArr basket'
      // $1 - `fruit`
      // $2 - `basket`
      var regex = /for\s+([\w\$]+)\s+(?:\binArr\b|\binStr\b)\s+([\w\$]+)/;
      return line.replace(regex, function($0, $1, $2) {
        var itt;

        // listen once for state status & store itteration count
        process.once('state:send', function(count) { itt = count; });
        // increment itterator index by one
        process.emit('ittIndex:inc');
        // if event fails, fallback to using `_`
        if (!itt) {
          itt = '_';
          console.log("✖ warning, auto itteration failed, using `i_`".red);
        }
        //      for (var iX      =0, len=basket.length; iX
        return 'for (var i'+itt+'=0, len'+itt+'='+$2+'.length; i'+itt+
          //<   lenX;     iX      ++) { var fruit  = basket[iX      ];
          ' < len'+itt+'; i'+itt+'++) { var '+$1+' = '+$2+'[i'+itt+'];';
      });
    },


    /** For key,val in object
     * Sets up variable for value
     * @param  {string} - accepts line as a string
     * @return {string} - transformed line
     * @api public
     */
    forKeyVal: function(line) {
      // $0 - `for key,val in obj`
      // $1 - `key`
      // $2 - `val`
      // $3 - `obj`
      var regex = /\bfor\b\s+([\w\$]+)\s*,\s*([\w\$]+)\s+in\s([\w\$]+)/;
      return line.replace(regex, function($0, $1, $2, $3) {
        //      for (var   key  in   obj ) { var   val  =   obj [  key ];
        return 'for (var '+$1+' in '+$3+') { var '+$2+' = '+$3+'['+$1+'];';
      });
    },

    /* Function shorthand
     *
     * Func keyword transforms into either an anonymous
     * function or a function expression, depending on the
     * presence of the function name ($2).
     *
     * @param  {string} - accepts line as a string
     * @return {string} - transformed line
     * @api public
     */
    func: function(line){
      // $0 - `func foo(a, b)`
      // $1 - `func`
      // $2 - `foo`
      // $3 - `(a, b)`
      var regex = /(\bfunc\b)\s*([\w\$]+)?\s*(\([\w\$\s,]*\))?/;
      return line.replace(regex, function($0, $1, $2, $3) {
        if ($1 && $2 && $3)
          //      var foo = function(a, b) {
          return 'var '+$2+' = function'+$3+' {';
        else if ($1 && $2 && !$3)
          //      var   foo  = function() {
          return 'var '+$2+' = function() {';
        else if ($1 && !$2 && $3)
          //      function   (a, b)  {
          return 'function' + $3 + ' {';
        else if ($1 && !$2 && !$3)
          return 'function() {';
        else
          throw new Error("Can not compile function");
      });
    },

    /** Convert Comments from # to //
     * @param  {string} - accepts line as a string
     * @return {string} - transformed line
     * @api public
     */
    comments: function(line) {
      var regex = /(['"].*)?#([^'"]*['"])?/g;
      // $0 - `"this is a # ssstring"`
      // $1 - `"`
      // $2 - `"` or ` ssstring"` (includes preceeding chars)
      return line.replace(regex, function($0, $1, $2){
        // if `#` is between quotes, pass it back
        return ($1 && $2) ? $0 : '//';
      });
    },

    /** Private block
     *  converts a `private` block into an iife
     *
     * @param  {string} - accepts line as a string
     * @return {string} - transformed line
     * @api public
     */
    privateBlock: function(line) {
      var privBeg = /^\bprivate\b$/;
      var privEnd = /^\bendPriv\b$/;
      
      if (privBeg.test(line.trim())) {
        return line.replace(/private/, function() {
          return ';(function() {';
        });
      // else if there is a privEnd, transform it
      } else if (privEnd.test(line.trim())) {
        return line.replace(/endPriv/, function() {
          return '})();';
        });
      } else {
        return line;
      }
    },


    /** CommonJS Require
     *
     * @param  {string} - accepts line as a string
     * @return {string} - transformed line
     * @api public
     */
    cjsRequire: function(line) {
      // $0 - `require 'http'.prop as myHttp
      // $1 - `http`
      // $2 - `.prop`
      // $3 - `myHttp`
      var regex = /^\s*\brequire\b (["'][^'"]+['"])(\.[\w\$]+)?(?:\s+(?:\bas\b)\s+([\w\$]+))?/;
      return line.replace(regex, function($0, $1, $2, $3) {
        if ($1 && !$2 && !$3) {
          // trim off quotes and make this the new $3
          $3 = $1.slice(1, -1);
          // if $1 has a filepath, use filename as variable
          var hasFilepath = /([^'"]+\/)([\w]+)/;
          if (hasFilepath.test($1)) {
            $3 = $3.replace(hasFilepath, "$2");
          }
          //      var  http  = require("http");
          return 'var '+$3+' = require('+$1+');';
        } else if ($1 && !$2 && $3) {
          //      var myHttp = require("http");
          return 'var '+$3+' = require('+$1+');';
        } else if ($1 && $2 && $3) {
          //      var myHttp = require("http").prop ;
          return 'var '+$3+' = require('+$1+')'+$2+';';
        } else {
          return $0;
        }
      });
    },

    /** Method_Description
     *
     * @param  {string} - accepts line as a string
     * @return {string} - transformed line
     * @api public
     */
    boilerplate: function(line) {
        var regex = /foobar/;
        return line.replace(regex, function($0, $1) {

        });
    }
};

