// Simple ORM based on nedb

var Classy = require("../classy");

global.Fiber = require('fibers');

Object.prototype.wrapSync = function(methodName) {
  var _this = this;

  return function () {
    var fiber = Fiber.current;
    var newValue;
    var args = Array.prototype.slice.call(arguments);
    args.push(function(data) {
      newValue = data;
      fiber.run();
    });

    if (typeof methodName == 'string') {
      _this[methodName].apply(_this, args);
    } else if (typeof methodName == 'function') {
      methodName.apply(_this, args);
    }

    Fiber.yield();
    return newValue;
  };
};


var Datastore = require('nedb');
var db = new Datastore();

var ClassPersistance = {
  create: function (attributes) {
    var obj = new this(attributes);
    obj.save();
  },

  findById: function (id, callback) {
    db.findOne({ _id: id }, function (err, doc) {
      callback(doc && this.initFromDbRow(doc));
    }.bind(this));
  },

  findAll: function (options, callback) {
    if (callback === undefined) {
      callback = options;
      options = {};
    }

    var _this = this;
    db.find(options, function (err, docs) {
      callback(docs.map(function (doc) {
        return _this.initFromDbRow(doc);
      }));
    });
  },

  initFromDbRow: function (data) {
    var klass = Classy.constantize(data.type);
    var record = klass.allocate();
    record.persisted = true;
    record.id = data['_id'];
    delete data._id;
    delete data.type;

    record.assignAttributes(data);
    return record;
  },

  defineAttributes: function (attrNames) {
    var proto = this.prototype;
    if (!proto.attributes) proto.attributes = {};
    if (!proto.attributeNames) proto.attributeNames = [];

    attrNames.forEach(function(attrName) {
      proto.attributeNames.push(attrName);
      Object.defineProperty(proto, attrName, {
        get: function() {
          return this.attributes[attrName];
        },
        set: function(value) {
          return this.attributes[attrName] = value;
        }
      });
    }.bind(this));
  }
};

var InstancePersistence = {
  persisted: false,

  initialize: function (attrs) {
    this.assignAttributes(attrs);
  },

  save: function (callback) {
    if (this.persisted) {
      this.saveChanges(callback);
    } else {
      this.insertNew(callback);
    }
  },

  insertNew: function (callback) {
    db.insert(this.toDbHash(), function(err, newDoc) {
      if (!err) {
        this.persisted = true;
        this.id = newDoc._id;
      }
      callback && callback(this);
    }.bind(this));
  },

  saveChanges: function () {
    db.update({ _id: this.id }, { $push: this.toDbHash() }, {}, function (err, numReplaced) {
      console.log(numReplaced);
      // Now the fruits array is ['apple', 'orange', 'pear', 'banana']
    });
  },

  toDbHash: function () {
    return Classy.extend({ type: this.klassName }, this.attributes);
  },

  assignAttributes: function (attrs) {
    for (var key in attrs) {
      if (attrs.hasOwnProperty(key)) {
        if (this.attributeNames.indexOf(key) == -1) {
          throw new Error("Unknown attribute " + key);
        }
        this[key] = attrs[key];
      }
    }
  },

  inspect: function () {
    var ivars = [], _this = this;
    this.attributeNames.forEach(function(key) {
      ivars.push("" + key + "=" + 
        ((key in _this.attributes) ? JSON.stringify(_this.attributes[key]) : "null")
      );
    });

    return "<" + this.klassName + ":" + this.id + " " + ivars.join(", ") + ">";
  }
};

var syncMutator = function (object, method) {
  var fn = object[method];
  object['_origin_async_' + method] = fn;
  var wrapped = object.wrapSync(fn);

  object[method] = function () {
    if (Fiber.current) {
      return wrapped.apply(object, arguments);
    } else {
      return fn.apply(object, arguments);
    }
  };
};


var Vehicle = Classy.new('Vehicle', function (p, mod) {
  this.klass.extend(  ClassPersistance);
  this.klass.include( InstancePersistence);

  this.klass.defineAttributes([
    'name',
    'year',
    'country'
  ]);
});

syncMutator(Vehicle.prototype, 'save');
syncMutator(Vehicle, 'findById');
syncMutator(Vehicle, 'findAll');

Fiber(function () {
  var car = new Vehicle({name: "car", year: 1998});

  car.save();
  console.log('saved');

  var car2 = Vehicle.findById(car.id);
  console.log(car2);

  var cars = Vehicle.findAll();
  console.log(cars);

}).run();


//Classy.ls(Vehicle);