require('./ruby_stacktrace');

var Classy = require('./classy');
require('./object_ls');

var Cat = Classy.build('Cat', {
  initialized: false,
  time: new Date(),
  nullProperty: null,
  undProperty: undefined,

  initialize: function() {
    this.child = new Cat.Kitten();
    this.family = {
      older: this.child,
      younger: new Cat.Kitten(),
      totalCount: 2
    };
  },

  doSomething: function() {
    
  }
});

Cat.Kitten = Classy.build('Kitten', function () {
  //this.klass.include(Cat);
});

Object.ls(new Cat);

process.exit();

var func2 = Object.create(Function, {
  name: {
    value: 'Object.name',
    writable: false,
    enumerable: false,
    configurable: false
  }
});

console.log(func2, func2.name, func2());

func.name = "NewName";

delete func.name;

Object.defineProperty(func, 'name', {
  value: 'NewName',
  writable: false,
  enumerable: false,
  configurable: false
});

console.log(Object.getOwnPropertyDescriptor(func, 'name'));
console.log(func, func.name);

console.log(Object.ls(Object));