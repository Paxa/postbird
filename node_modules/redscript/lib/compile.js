/**
 * RedScript compiler
 * Copyright(c) 2013 Adam Brodzinski <adambrodzinski@gmail.com>
 * MIT Licensed
 */

var transform = require('./transform');

/** Export compile function
 * Takes a multi line string and splits each line into array lines.
 * Each line is processed and transformed if it matches the criteria.
 * Final array of strings are joined and returned.
 * @param  {string} file
 * @return {string}
 * @api    public
 */
module.exports = function(file) {
    var lines = file.split('\n')
      , debug = false
      , declaredVars = [];
    
    // reset state object for each file
    process.emit('state:reset');

    // Iterate through each line and transform text
    lines = lines.map(function(line, index) {

        // normalize # comments to //
        line = transform.comments(line);

        // if line begins with a comment, return
        if (/^\/\//.test(line.trimLeft())) return line;

        // insert var keyword where needed (currently buggy)
        line = transform.insertVars(line, declaredVars);

        // setup 'class' constructors and inherit if necessary
        line = transform.classes(line);

        // transform super call from a class method
        line = transform.callSuper(line);

        // transform a while loop
        line = transform.whileLoop(line);

        // until loop with comment
        line = transform.untilLoop(line);

        // for loop with range e.g. `0..20`
        line = transform.forLoopRange(line);

        // Bracketless for in statement
        line = transform.forIn(line);

        line = transform.forInArr(line);

        // For key,val in object
        line = transform.forKeyVal(line);

        // Function shorthand, func, or func foo
        line = transform.func(line);

        // Private block
        line = transform.privateBlock(line);

        // Transform require calls to CommonJS
        if (options.moduleType === 'commonjs') {
          line = transform.cjsRequire(line);
        } else if (options.moduleType === 'requirejs') {
          // TODO implement requirejs transform
        }

// ------------------  refactor below into transform.js ---------------


        // Matches an @foo or @. or @
        var atSymbol = /@(?=[\w$])|@\.|@/g
        

        /**
         * Matches `when` OR `when` and `then`.
         * @type {RegExp} See function for more info
         */
          , switchWhenThen = /(when)\s(.+)(then)(.+)|(when)\s(.+)/


        /**
         * Matches string interpolation inside double quotes
         * $1 captures left of `#{`, inc double quote
         * $3 captures interpolation inside of `#{  }`
         * $5 captures right of `}`, inc double quote
         * @type {RegExp}
         */
          , strInt = /(".*)(#\{)([^\{\}]+)(\})(.*")/

        /**
         * Matches an anonymous function 'block'
         * $0 examp: `on(foo, do |x,y|`
         * $1 `on(foo, `
         * $2 `x,y`
         * @type {RegExp}
         */
          , anonBlock = /(\(.*)\bdo\b(?:\s\|([\w_$$,\s]*)\|)?/

        /**
         * Matches a RedScript object literal declaration
         * $0 `object foo inherits bar`
         * $1 `foo`
         * $2 `bar`
         */
          , objLit = /object ([\$\w]+)(?: inherits ([\$\w]+))?/

        /**
         * Matches a `def` inside of an object literal
         * $0 `def foo(p1)
         * $1 `foo`
         * $2 `(p1)`
         */
          , objLitDef = /\bdef\b ([\$\w]+)(\([\$\w, ]*\))?/

        /**
         * Matches `def foo.bar` methods
         * $0 matches `def foo.bar(p1)`
         * $1 matches `foo.bar`
         * $2 matches `(p1)`
         */
          , dotDef = /\bdef\b ([\$\w]+\.[\$\w]+)(\([\$\w, ]*\))?/

         /**
          * Matches `def` methods attached to prototype
          * $0 `def foo >> bar(p1)
          * $1 `foo`
          * $2 `bar`
          * $3 `(p1)`
          */
          , protoDef = /\bdef\b ([\$\w]+) >> ([\$\w]+)(\([\$\w, ]*\))?/;


        /**
         * Alias `do` with `{`
         * fakes negative lookbehind for { or word char, this
         * prevents aliasing a properly formated do loop
         * @return {string} returns `}` if lookbehind is false
         */
        /*
         *line = line.replace(/(\w)?do(?! \{|\{|\w)/g, function($0, $1) {
         *    return $1 ? $0 : '{';
         *});
         */


        /**
         * Alias `end-` with `end);` or `});`
         */
        line = line.replace(/\bend\b-/g, '});');

        /**
         * Alias `end` with `}`
         * fakes a negative lookbehind for a word char
         * @return {string} returns `}` if lookbehind is false
         */
        line = line.replace(/(\w)?end(?!\w)/g, function($0, $1) {
            return $1 ? $0 : '}';
        });


        /**
         * Find any instance of @ and replace it with the
         * appropriate this.
         */
        line = line.replace(atSymbol, function(match) {
            // if line contains @foo, @_foo or @$foo
            if (/@(?=[\w$])/.test(line)) return 'this.';
            // else if matches @.foo, @._foo or @.$foo
            else if (match === '@.') return "this.";
            else return "this";
        });


        /**
         * Alias puts with console.log
         * if it's bracketless, insert bracket and close at EOL
         */
        line = line.replace(/puts\(/, "console.log(");
         // if bracketless puts, replace puts & append );
        if (/puts /.test(line)) {
            line = line.replace(/puts /, "console.log(") + ");";
        }


        /**
         * Alias printf with process.stdout.write
         * if it's bracketless, insert bracket and close EOL
         */
        line = line.replace(/printf\(/, "process.stdout.write(");
         // if bracketless puts, replace puts & append );
        if (/printf /.test(line)) {
            line = line.replace(/printf /, "process.stdout.write(") + ");";
        }


        /**
         * Inserts brackets into switch statement
         * @param  {string} $0  Entire match
         * @param  {string} $1  Matches switch
         * @param  {string} $2  Matches expression
         * @return {string}     Processed switch line
         */
        line = line.replace(/(switch) (.+)/, function($0, $1, $2) {
            return $1 + " (" + $2 + ") {";
        });


        /**
         * Replaces when with case. If then is found a one line
         * statement is assumed. This currently inserts a semicolon to prevent
         * errors with appended break.
         * @param  {string} $0  Entire match
         * @param  {string} $1  Matches `when`
         * @param  {string} $2  Label
         * @param  {string} $3  Matches `then`
         * @param  {string} $4  clause (after then)
         *                  OR
         * @param  {string} $5  Matches `when`
         * @param  {string} $6  Label
         * @return {string}     Processed when line
         */
        line = line.replace(switchWhenThen, function($0, $1 ,$2 ,$3 ,$4 ,$5 ,$6) {
            // has `when` and `then` one liner
            if ($1 && $3) {
                return "case " + $2 + ":" + $4 + ' ; break;';
            // line just has `when`
            } else if ($5) {
                return "case " + $6 + ":";
            }
        });


        /**
         * Replaces default with default: in a switch statement
         */
        line = line.replace(/\bdefault\b(?!\:)/, function($0, $1) {
          // if entire line is just default
          if (line.trim() === 'default') return 'default:';
          // else it's prob something else like `def default`
          else return $0;
        });


        /**
         * Replaces an `else if` with `} else if () {`
         * @param  {string} $0  Entire match
         * @param  {string} $1  Matches `condition`
         */
        line = line.replace(/else if (?!\s*\()(.+)/, function($0, $1) {
            // if `else if` is inside a string, bail out
            if (insideString("else if", line)) return $0;
            return '} else if (' + $1 + ') {';
        });


        /**
         * Replaces an `else` with `} else {`
         * @param  {string} $0  Entire match
         */
        line = line.replace(/else(?!(?:\s*\{)| if)/, function($0) {
            // if `else` is inside a string, bail out
            if (insideString("else", line)) return $0;
            return '} else {';
        });


        /**
         * Replaces an `if condition` with `if (condition) {`
         * @param  {string} $0  Entire match
         * @param  {string} $1  Matches `condition`
         */
        line = line.replace(/if (?!\s*\()(.+)/, function($0, $1) {
            // if `if` is inside a string, bail out
            if (insideString("if", line)) return $0;
            return 'if (' + $1 + ') {';
        });

        /**
         * Replaces text inside string interpolation brackets `#{ }`
         * @return {string} transformed string
         */
        line = line.replace(strInt, function($0, $1 ,$2 ,$3 ,$4 ,$5) {
            var left = $1   // left of `#{`, inc double quote
              , right = $5  // right of `}`, inc double quote
              , middle = $3; // inside of `#{  }`

            // if middle contains scary chars like +*-% etc, wrap in parens
            if (/[^\w\s$$]/.test(middle)) {
                middle = '(' + middle + ')';
            }
            // if interp is to the far left/right, don't add extra quotes
            if (left === '"')  return middle + ' + "' + right;
            if (right === '"') return left + '" + ' + middle;
            
            return left + '" + ' + middle + ' + "' + right;
        });


        /**
         * Replaces an anonymous function block
         * Matches an anonymous function 'block'
         * $0 examp: `on(foo, do |x,y|`
         * $1 `on(foo, `
         * $2 `x,y`
         * @return {string} transformed funciton
         */
        line = line.replace(anonBlock, function($0, $1, $2) {
            var $1tr = $1.trimRight();
            var insertComma = /\(.*[^,]$/.test($1tr);
            // if line has params, insert them
            if ($2) {
                // if comma wasn't inserted between block and params
                if ( insertComma ) {
                    return $1 + ', ' + 'function(' + $2 + ') {';
                }
                return $1 + 'function(' + $2 + ') {';
            // else no params
            } else {
                // if comma wasn't inserted between block and params
                if ( insertComma ) {
                    return $1 + ', ' + 'function() {';
                }
                return $1 + 'function() {';
            }
        });


        line = transform.objLiteral(line);

        /**
         * Replaces `def foo.bar` methods with vanilla methods
         * $0 matches `def foo.bar(p1)`
         * $1 matches `foo.bar`
         * $2 matches `(p1)`
         */
        line = line.replace(dotDef, function($0, $1, $2) {
            if (insideString("def", line)) return $0;
            // if def declaration has parens
            if ($2)
                return $1 + ' = function' + $2 + ' {';
            else
                return $1 + ' = function() {';
        });


        /**
         * Replaces `def foo >> bar` methods with vanilla methods
         * $0 matches `def foo >> bar(p1)`
         * $1 matches `foo`
         * $2 matches `bar`
         * $3 matches `(p1)
         */
        line = line.replace(protoDef, function($0, $1, $2, $3) {
            if (insideString("def", line)) return $0;
            // if def declaration has parens
            if ($3)
                return $1 + '.prototype.' + $2 + ' = function' + $3 + ' {';
            else
                return $1 + '.prototype.' + $2 + ' = function() {';
        });


        /**
         * Replaces `def` methods with vanilla methods inside
         * of an object literal.
         * $0 matches `def foo(p1)`
         * $1 matches `foo`
         * $2 matches `(p1)`
         */
        line = line.replace(objLitDef, function($0, $1, $2) {
            if (insideString("def", line)) return $0;
            // if def declaration has parens
            if ($2)
              return $1 + ': ' + 'function' + $2 + ' {';
            else
              return $1 + ': ' + 'function() {';
        });


        /**
         * Conditional assignment operator
         * $0 matches `foo =|| bar`
         * $1 matches `foo`
         * $2 matches `bar`
         * @return {String} transformed line
         */
        var condAssignment = /([\w\$]+)\s*\|\|=\s*(.+)/;
        line = line.replace(condAssignment, function($0, $1, $2) {
            //if (insideString("||=", line)) return $0;
            return $1 + ' = ' + $1 + ' || ' + $2;
        });

        // Transform `parent*` to `__proto__`
        line = transform.parentProperty(line);
        if (debug) console.log(index + "  " + line);
        return line;
    });

    // add classical inheritence methods to the top of the file
    // if we used a class & insertion isn't disabled with flag
    if (options.classInsertion === true && state.hasClass === true) {
      var classLine = '(function(){var e=false,t=/xyz/.test(function(){xyz})?/\\b_super\\b/:/.*/;this.Class=function(){};Class.extend=function(n){function o(){if(!e&&this.init)this.init.apply(this,arguments)}var r=this.prototype;e=true;var i=new this;e=false;for(var s in n){i[s]=typeof n[s]=="function"&&typeof r[s]=="function"&&t.test(n[s])?function(e,t){return function(){var n=this._super;this._super=r[e];var i=t.apply(this,arguments);this._super=n;return i}}(s,n[s]):n[s]}o.prototype=i;o.prototype.constructor=o;o.extend=arguments.callee;return o}})()';
      lines.unshift(classLine);
    }

    return lines.join('\n');
};


/**
 * #lastChar - Finds the last character in a string.
 * @return {string} - char
 */
String.prototype.lastChar = function(){
 return this[this.length - 1];
};


/**
 * Checks to see if keyword is used inside a string
 * @param  {string} match keyword to match
 * @param  {string} ln    line to match against
 * @return {bool}         true if match is found
 */
function insideString(match, ln) {
    var regex = "['\"][\\w\\s]*[^\\w]" + match + "[^\\w][\\w\\s]*['\"]";
    var insideStr = new RegExp(regex, "g");
    return insideStr.test(ln);
}

