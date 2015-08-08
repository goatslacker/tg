/*jshint asi: true */
tg(Function, tg)
function tg() {
  (function () {
    var hasOwn = Object.prototype.hasOwnProperty
    var slice = Array.prototype.slice

    function Maybe(type) {
      this.t = type
    }

    function Or(types) {
      this.t = types
    }

    function Any() { }

    function Obj(type) {
      this.t = type
    }

    function Custom(f, args) {
      this.f = f
      this.a = args
    }

    Custom.prototype.check = function (actual) {
      var result = this.f.apply(this.f, this.a.concat(actual))
      if (result === true) {
        return actual
      }
      throw new TypeError(
        'Expected the result of ' + this.f + ' to be true when ' +
        actual + ' was passed but instead received false.'
      )
    }

    function sign(args, ret, fn) {
      return function () {
        tg(args, slice.call(arguments))
        return tg(ret, fn.apply(fn, arguments))
      }
    }

    function disambiguateObjectType(x) {
      if (Array.isArray(x)) {
        return 'array'
      }

      if (x === null) {
        return 'null'
      }

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
      return typeof f == 'string'
        ? f.toLowerCase()
        : f.name.toLowerCase()
    }

    function makeError(expected, actual, type) {
      return 'Expected ' + expected +
      ' but received ' + type +
      ' (' + actual + ')'
    }

    function assert(expected, actual) {
      var type = typeOf(actual)
      if (type !== expected) {
        throw new TypeError(makeError(expected, actual, type))
      }
      return actual
    }

    function compareOptionalTypes(expected, actual) {
      var doesItWork = expected.some(function (x) {
        try { tg(x, actual) } catch (err) { return false }
        return true
      })

      if (!doesItWork) {
        throw new TypeError(makeError(
          expected.map(getTypeFunctionName),
          actual,
          typeOf(actual)
        ))
      }

      return actual
    }

    function typecheckArray(expected, actual) {
      tg(Array, actual)
      if (expected.length === 1) {
        actual.forEach(function (x) {
          tg(expected[0], x)
        })
      } else {
        if (expected.length !== actual.length) {
          throw new TypeError(
            'Function signature defines ' + expected.length + ' arguments ' +
            'but the function was passed ' + actual.length + ' arguments'
          )
        } else {
          expected.forEach(function (x, i) {
            tg(x, actual[i])
          })
        }
      }
      return actual
    }

    function typecheckObject(expected, actual) {
      tg(Object, actual)
      Object.keys(expected).forEach(function (x) {
        if (hasOwn.call(actual, x)) {
          tg(expected[x], actual[x])
        } else if (!(expected[x] instanceof Maybe)) {
          throw new TypeError('Expected key `' + x + '` but it is not defined')
        }
      })
      return actual
    }


    // API
    tg = function (expected, actual) {
      if (expected instanceof Maybe) {
        if (actual == null) {
          return actual
        }
        expected = expected.t
      } else if (expected instanceof Or) {
        return compareOptionalTypes(expected.t, actual)
      } else if (expected instanceof Any) {
        return actual
      } else if (expected instanceof Custom) {
        return expected.check(actual)
      } else if (expected instanceof Obj) {
        tg(Object, actual)
        Object.keys(actual).forEach(function (x) {
          tg(expected.t, actual[x])
        })
        return actual
      }

      var _t = typeOf(expected)
      switch (_t) {
        case 'string':
        case 'function':
          return assert(getTypeFunctionName(expected), actual)
        case 'array':
          return typecheckArray(expected, actual)
        case 'object':
          return typecheckObject(expected, actual)
        case 'null':
        case 'undefined':
          return assert(_t, actual)
      }
    }

    tg.Maybe = function (type) {
      return new Maybe(type)
    }

    tg.Or = function () {
      return new Or(slice.call(arguments))
    }

    tg.Any = new Any()

    tg.Obj = function (type) {
      return new Obj(type)
    }

    tg.sign = sign([[tg.Any], tg.Any, Function], Function, sign)

    tg.assert = function (f) {
      var args = slice.call(arguments, 1)
      return new Custom(f, args)
    }

    if (typeof exports !== 'undefined') {
      exports.tg = tg
    }
  }());

  return tg.apply(tg, arguments)
}
