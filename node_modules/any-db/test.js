var test = require('tape')

test('API test', function (t) {
  t.plan(4)
  var anyDB = require('./')

  t.pass('require("any-db") works')

  t.test('exports.createConnection', function (t) {
    t.plan(1)
    anyDB.createConnection('fake://hostname/dbname', function (err, conn) {
      if (err) throw err
      t.pass('Created connection')
    })
  })

  t.test('exports.createPool', function (t) {
    t.plan(1)
    anyDB.createPool('fake://hostname/dbname')
    t.pass('Created pool')
  })

  t.throws(function () {
    anyDB.adapters.fake
  }, 'accessing exports.adapters throws')
})
