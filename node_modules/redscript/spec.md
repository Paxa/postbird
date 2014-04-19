# RedScript Spec Sheet

If you have suggestions on different syntax, please create
an issue: [here](https://github.com/AdamBrodzinski/RedScript/issues).

<br>

#### Variables & automatic semi-colon insertion  
*Status*: **Partially implemented, known bug**

Variables are automatically declared. Using the var keyword is optional and allowed.  
Constants are pre-processed at compile time. This allows some memory savings in certain cases where itcan be utilized.
Semi-colons are automatically inserted as needed (currently not implemented).


*Currently RedScript does not take function scope into account. Any
variables that are declared inside of a function multiple times can
lead to unintended global leaks. To disable auto declaration pass `no--declare`. Another workaround is
to manually declare variables with the var keyword.*

```ruby
foo = 12                 var foo = 12;
foo = 20                 foo = 20;

# Constants are preprocessed
AMOUNT = 233            
puts AMOUNT             console.log(233)

# !! Lexical scoping bug in current version !!
func foo                var foo = function() {
  baz = 20                var baz = 20;       
end                     };                    

func bar                var bar = function() {
  baz = 30                baz = 30;       
end                     };                     
```
<br>

#### Convenience method aliases for puts & printf

*Status:* **Working**  
`puts` and `printf` are aliases to `console.log` and `process.stdout.write`. `printf` is only available with node enviroments. These are the only methods that have optional parens at this time. If parens are omitted a closing paren will be appended to the end of the line. Parenless multi lines are not possible.

```ruby
puts "Hello there"                      console.log("Hello there");
puts("Hai!")                            console.log("Hai")
printf "Hola"                           process.stdout.write("Hola")
printf("Hola")                          process.stdout.write("Hola")
```
<br>

#### Optional Parenthesis

*Status:* **Implemented with RedScript constructs only**

Currently I cannot implement this until I can create a proper lexer. Pull requests welcome ;-) For the time being you have to include parens. A temporary kludgey alias for `end)` is `end-`. This is slightly easier to look at for the short run, but expect this to be dropped in the future.

```ruby
alert 'Hello World!'

getUser '/users/1', do
  alert user
end

# Currently you still have to use parens for anything that's not a RedScript construct.
getUser( '/users/1', do
  alert(user)
end)

# A kludgey alias for `end)` is `end-`
getUser( '/users/1', do
  alert(user)
end-
```
<br>


#### Ruby flavored functions

`Func [name]` declares the function as an expression and sets `[name]` to a variable. Parens are optional if no arguments are being passed. If arguments are passed braces must be used. Anonymous functions are declared as `func`, parens are also optional. This type of anonymous function should only be used when using `do |x|` would be awkward, such as in an [async](https://github.com/caolan/async)'s array of parallel functions.

*Status:* **Working**

```ruby
func say(msg)                            var say = function(msg) {
  puts "Message: #{msg}"                   console.log("Message: " + msg);
end                                      };

# Optional function parens
func sayHello
  puts "Hello"
end

# anonymous function
func                                    function() {
  # do stuff                              // do stuff
end                                     }

func(a,b)                               function(a,b) {
  # do stuff                              // do stuff
end                                     }
```
<br>

#### Comments

*Status*: *Working*

Line comments are made with a `#`. RedScript currently does not have multi-line comments but `/*...*/` can be used if needed.

```coffeescript
# I'm a comment                          // I'm a comment
$('#someID').html(foo)                   $('#someID').html(foo) # No worries here
```
<br>

#### Alias @ with this

*Status:* Working

```ruby
function FooClass(name, age) {           function FooClass(name, age){
  @name = name                             this.name = name;
  @age = age                               this.age = age;
}                                        }
```
<br>


#### Loops

*Status:* **Working**

*Note*, for loops only support `0..3`, `0...3` or variables e.g. `begin...ending`. Using two dots will loop up until that number, and using 3 dots will loop up to and including the end number.  
Using `for in [2,4,6]` or `for in myArray` will not work at this time. See next section for more info on arrays.  
To prevent confusion until loops have a `//until` comment next to the compiled output.

```ruby
while foo < 200                        while (foo < 200) {
  puts "I'm looping forever"              console.log("I'm looping forever");
end                                     }


# loops until a condition is true
until i == 5                            while (!(i == 5)) { // loop until  
   puts i                                  console.log(i);                
   i += 1                                  i += 1;                        
end                                     }                                 
                                        
                                        
# prints 5x, 0,1,2,3,4                  
for i in 0..5                           for (var i=0; i < 5; i++) {    
  puts i                                  console.log(i);           
end                                     }                             
                                        
                                        
# prints 6x, 0,1,2,3,4,5                
for i in 0...5                          for (var i=0; i <= 5; i++) {
  puts i                                  console.log(i)       
end                                     }                          
```
<br>


#### Iterating over arrays and objects

*Status:* **Working**

```
# Iterate over arrays
basket = ['lemon', 'pear', 'apple']     var basket = ['lemon', 'pear', 'apple'];

for fruit inArr basket                  for (var _i=0, _len=basket.length; _i < _len; _i++) { var fruit = basket[_i];    
  puts fruit                              console.log(fruit);                                                            
end                                     }                                                                                


for key in obj                          for (var key in obj) {
   alert(key)                             alert(key);
end                                     }


for key,val in obj                      for (var key in obj) { var val = obj[key];
  puts 'My key is: #{key}'                console.log('My key is: ' + key);
  puts 'My value is: #{val}'              console.log('My value is: ' + val);
end                                     }
```
<br>

#### If/else/else if

*Status:* **Partially implemented**

If statements currently are multi-line. If you would like to use a one liner, you can still use vanilla js `if (err) throw err;`.

```ruby
if foo == 10                            if (foo === 10) {
  bar("do stuff")                         bar("do stuff");
else if foo == 20                       } else if (foo === 20) {
  bar("do stuff")                         bar("do stuff");
else                                    } else {
  bar("do stuff")                         bar("do stuff");
end                                     }

throw err if err                        if (err) { throw err; }
```
<br>

#### Methods & Object Literal

*Status:* **Working**

An optional way to declare an object literal. The idea is to make it read a bit nicer.  
Methods are declared using the def keyword and parens are optional *if* they're not used.  
Attaching a method to an object's prototype be defined using `def objName >>> mthdName`.

```ruby
object auto                                   var auto = {
  wheels: 4,                                    wheels: 4,
  engine: true,                                 engine: true,

  def honk                                      honk: function() {
    puts "hoooonk"                                console.log("hooooonk");
  end,                                          },

  def sayHi(msg)                                sayHi: function(msg) {
    puts msg                                      console.log(msg);
  end                                           }
end                                           }

# Define outside of object literal
def auto.add(x, y)                            auto.add = function(x,y) {
  return x + @wheels                            return x + this.wheels;
end                                           };

# Define method attached to prototype
def Car >>> sub(x,y)                          Car.prototype.sub = function(x, y) {
  return x - y                                  return x - y;
end                                           };
```
<br>

#### Block-like Syntax for Anonymous Functions

*Status:* **Working**

Block like syntax is a shorter way to write an anonymous function. The preceding comma is optional. However, including it may be easier to understand if it's included. Once we have optional parens working this will look *much* nicer! 
```ruby

app.get('/users/:user', do |req|        app.get('/users/:user', function(req) {
  puts req.params.name                    console.log(req.params.name);
end)                                    });

# no params
$myBtn.click( do                        $myBtn.click( function() {
  alert("hi")                             alert("hi");
end)                                    });
```
<br>

#### RequireJS Module Sugar 

*Status:* **Not Implemented**  

Using `define module` wraps the current file in a new anonymous RequireJS module. Exports can either be exported in a export object literal or by using `export foo` to export the foo variable only. Any dependencies can be declared by using `require 'foo' as foo` which sets up foo's returned value in a variable called `foo`.

```ruby

define module                                                   define([ 'jquery',
require 'jquery' as $                                                    './views/widget'],
require './views/widget' as Widget                                function($, Widget) {        

options = {                                                        var options = {
  moonRoof: true,                                                    moonRoof: true,   
  seats: 5                                                           seats: 5      
}                                                                  }          

getCost = 16899                                                    var getCost = 16899;
wheels = 4                                                         var wheels = 4;
 
# export literal compiles to an object that gets returned
export                                                              return {   
  getCost                                                               getCost : getCost,
  hasMoonRoof from options.moonRoof                                     hasMoonRoof : options.moonRoof,   
  getWheels from wheels                                                 getWheels : wheels     
end                                                                 }           
                                                                }); 
# --------------------------------------  new file  -------------------------------------------
define module                                                  define(function() {

func foo(x)                                                      var foo = function(x) {
  puts x                                                           console.log(x);
end                                                              }

export foo                                                       return foo; });
```
<br>

#### Ruby / Coffee style case switch statement

*Status:* **Working**

Switch statements still need `break` inserted to prevent falling through. The exception is one liners, then it's appened to the line.

```ruby
switch fruit                                             switch (fruit) {
when "apple"                                               case "apple":
  puts "it's an appppple"                                    console.log("it's an appppple");
  break                                                      break;
when "bannana" then puts("bannana")                        case "bannana": console.log("bannana"); break;
when "orange"                                              case "orange":
  puts "it's an orange"                                      console.log("it's an orange");
  break                                                      break;
default                                                    default:
  puts "uh oh, bummer"                                       console.log("uh oh, bummer");
end                                                      }
```
<br>

#### Private Blocks

*Status:* **Working**

Private blocks keep variables scoped inside the block using function scope. There is a slight performance hit due to the IIFE. Again, due to the lack of proper lexing/parsing I can't yet use an `end` block. A workaround is `endPriv`, this calls the IIFE. Also due to the variable declaration bug mention above, variables like the example below will currently need var manually inserted to keep `foo` from leaking out and changing global `foo` to `10`. The beginning of the IIFE is nerfed with a semi-colon to prevent any potential errors (especially with the current state of RedScript not having automatic semi-colon insertion). 

```ruby                                                   
foo = 200                                                 var foo = 200; 

private                                                  (function(){
  var foo = 10                                              var foo = 10;
endPriv                                                   })();

alert(foo) #alerts 200                                    alert(foo);
```
<br>

#### Classical Inheritance

*Status*: **Working**

RedScript classes are currently using John Resig's simple inheritance. In the future a solution closer to coffeescript would be ideal, allowing one to inherit from any constructor and still have the correct syntax. The current implementation will not inherit unless the base class is created with RedScript. However, backbone and ember both use the `.extend` method which is convenient since using `class Foo < Backbone.Model.extend(` will call their own extend implementation. Backbone does not have a `this._super` method so if you want to call super you would need to use a backbone plugin for that. Ember uses the same `this._super` syntax as RedScript so calling super will call Ember's implementation.

If you're only using their inheritance implementation you can disable the insertion of RedScript's inheritance by passing the `--no-class` flag.

```ruby
class Animal                                          var Animal = Class.extend({           
  def init(name)                                        init: function(name) {              
    @name = name                                          this.name = name;                 
  end,                                                  },                                  
                                                                                            
  def sayHi                                             sayHi: function() {                 
    puts "Hello"                                          console.log("Hello");             
  end                                                   }                                   
end                                                   });                                   
                                                                                            
class Duck < Animal                                   var Duck = Animal.extend({            
  def init                                              init: function(name) {              
    alert("#{@name} is alive!")                           alert(this.name + " is alive!")   
  end,                                                  },                                  
                                                                                            
  def sayHi                                             sayHi: function() {                 
    super                                                 this._super();                    
    puts "Quack"                                          console.log("Quack");             
  end                                                   }                                   
end                                                   });                                   

duck = new Duck('Darick')                             var duck = new Duck('Darick');
duck.sayHi()                                          duck.sayHi();
```
<br>

#### Prototypal Inheritance

*Status*: **Partially Implemented**

This is an experiment to try and bring out JavaScripts true prototypal nature. The goal is to be able to *easily* inherit without using constructors or faux classes. Vanilla JS makes it very difficult to inherit from another object, unlike [self](http://en.wikipedia.org/wiki/Self_programming_language#Inheritance.2FDelegation), JavaScript's inheritance inspiration. One of the drawbacks to property delegation is keeping state in an object. Using `object myDuck clones duck` will copy all of the properties from duck into myDuck, ensuring it won't grab it's parents property by accident. Currently `clones` is not implemeneted yet.

```ruby
object animal
  name: null,
  
  def sayHi
    puts "Hello"
  end
end

object duck
  parent*: animal,
  name: null,

  def sayHi
    puts "Quack"
  end
end

# this duck's attr's are cloned instead of deligated
# with `parent*`, usefull for statefull objects
#
object myDuck clones duck
  name: 'Darick'
end
```
