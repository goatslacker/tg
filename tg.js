function disambiguateObjectType(x) {
  if (Array.isArray(x)) {
    return 'array'
  }

  if (x === null) {
    return 'null'
  }

//  console.log('@', typeof x, x, Object.prototype.toString.call(x))

  return Object.prototype.toString.call(x)
    .toLowerCase()
    .replace(/\[object (.*)\]/, function (a, b) { return b })
}

function typeOf(x) {
  var type = typeof x

  switch (type) {
    case 'object':
      return disambiguateObjectType(x)
    default:
      return type
  }
}

function getTypeFunctionName(f) {
  return f.name.toLowerCase()
}

function assert(expected, actual) {
  var type = typeOf(actual)
  if (type !== expected) {
    throw new TypeError(
      'Expected ' + expected +
      ' but received ' + type +
      ' (' + actual + ')'
    )
  }
  return actual
}

function tg(expected, actual) {
  var _t = typeOf(expected)
  switch (_t) {
    case 'function':
      if (actual instanceof expected) { // XXX ?
        return actual
      } else {
        return assert(getTypeFunctionName(expected), actual)
      }
    case 'array':
      return
    case 'object':
      return
    case 'null':
    case 'undefined':
      return assert(_t, actual)
  }
}

//function CustomType() {
//}

//console.log(typeOf(new CustomType()))

//tg(Boolean, 4)
//tg(RegExp, function (x) { return x })
//tg(Error, new Error('yay'))
//console.log(4 instanceof Number)
//tg(Array, { key: 1 })
//tg(Object, [1, 2, 3])
//tg(CustomType, new CustomType)
//tg(Boolean, true)
tg([Number, Number], [1, 2])
//tg(undefined, undefined)
//tg(null, null)
//tg(Date, new Date())
//tg(RegExp, /hello/)

//console.log(typeOf({ a: 1}))

module.exports = tg
