var assert = require('assert')
var tg = require('../tg.min.js').tg

var fails = function () {
  try {
    tg.apply(tg, arguments)
    assert.ok(false)
  } catch (err) {
    assert.ok(err instanceof TypeError)
  }
}

var ok = function () {
  try {
    tg.apply(tg, arguments)
  } catch (err) {
    throw err
  }
  assert.ok(true)
}


fails(Boolean, 4)

fails(RegExp, function (x) { return x })

ok(Error, new Error('yay'))

fails(Array, { length: 1 })

fails(Object, [1, 2, 3])

function CustomType() { }
ok(tg.assert(function (x) { return x instanceof CustomType }), new CustomType)

ok(Boolean, true)

fails([Number], [1, 2, 'yes'])

ok({ key: [{ wtf: String }, Number] }, { key: [{ wtf: 'hey' }, 2] })

ok(undefined, undefined)

tg(null, null)

ok(Date, new Date())

ok(RegExp, /hello/)

ok(Number, 4)

fails(tg.Or(Number, String), false)

ok(tg.Or(Number, undefined), undefined)

ok(tg.Maybe(Number), 4)
ok(tg.Maybe(Number), null)
fails(tg.Maybe(Number), 'four')
ok(tg.Maybe(Number), undefined)

ok(tg.Or(String, Number), '2')
ok(tg.Or(String, Number), 2)
fails(tg.Or(String, Number), /2/)

ok(tg.Any, /yes/)
ok(tg.Any, 9)
ok(tg.Any, 'sojfoesf')
ok(tg.Any, {})
ok(tg.Any, [])
ok(tg.Any, null)

ok(tg.Obj(Number), { a: 1, b: 2, c: 3 })
fails(tg.Obj(String), { a: '1', b: '2', c: 3, d: '4' })

ok(tg.Obj(tg.Or(Number, String)), { a: 1, b: '2' })
fails(tg.Obj(tg.Or(Number, String)), { a: true, b: '2' })

ok(tg.Obj(tg.Maybe(Boolean)), { a: true, b: null })
fails(tg.Obj(tg.Maybe(Boolean)), { a: true, b: 'true' })

var foo = tg.sign([Number], Number, function (x) { return x })
foo(2)

var Even = function(x) { return x % 2 === 0 }
fails(tg.assert(Even), 3)
ok(tg.assert(Even), 6)

ok('number', 3)
ok('String', 'hello')
fails('regexp', null)

fails(tg.Obj(Number), /a/)

ok({
  optionalField: tg.Maybe(String)
}, {})

ok({
  optionalField: tg.Maybe(String)
}, { optionalField: 'hello' })

fails({
  optionalField: tg.Maybe(String)
}, { optionalField: 2 })
