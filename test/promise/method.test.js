'use strict'

const { expect, assert } = require('chai')

const obj = {}
const error = new Error()
const thrower = Promise.method(() => {
  throw error
})

const identity = Promise.method(val => {
  return val
})

const array = Promise.method((...args) => {
  return args
})

const receiver = Promise.method(function() {
  return this
})

describe('Promise.method', () => {
  it('should reject when the function throws', () => {
    let async = false
    const ret = thrower().then(assert.fail, e => {
      assert(async)
      assert(e === error)
    })
    async = true
    return ret
  })
  it('should throw when the function is not a function', () => {
    try {
      Promise.method(null)
    } catch (e) {
      assert(e instanceof TypeError)
      return
    }
    assert.fail()
  })
  it('should call the function with the given receiver', () => {
    let async = false
    const ret = receiver.call(obj).then(val => {
      assert(async)
      assert(val === obj)
    }, assert.fail)
    async = true
    return ret
  })
  it('should call the function with the given value', () => {
    let async = false
    const ret = identity(obj).then(val => {
      assert(async)
      assert(val === obj)
    }, assert.fail)
    async = true
    return ret
  })
  it('should apply the function if given value is array', () => {
    let async = false
    const ret = array(1, 2, 3).then(val => {
      assert(async)
      expect(val).to.deep.equal([1, 2, 3])
    }, assert.fail)
    async = true
    return ret
  })

  it('should unwrap returned promise', () => {
    const d = Promise.defer()

    const ret = Promise.method(() => {
      return d.promise
    })().then(v => {
      assert(v === 3)
    })

    setTimeout(() => {
      d.fulfill(3)
    }, 1)
    return ret
  })
  it('should unwrap returned thenable', () => {
    return Promise.method(() => {
      return {
        then(f) {
          f(3)
        }
      }
    })().then(v => {
      assert(v === 3)
    })
  })

  it('should unwrap a following promise', () => {
    let resolveF
    const f = new Promise(resolve => {
      resolveF = resolve
    })
    const v = new Promise(resolve => {
      setTimeout(() => {
        resolve(3)
      }, 1)
    })
    resolveF(v)
    return Promise.method(() => {
      return f
    })().then(value => {
      assert(value === 3)
    })
  })

  it('zero arguments length should remain zero', () => {
    return Promise.method(function() {
      assert(arguments.length === 0)
    })()
  })
  it('should retain binding from returned promise', () => {
    const THIS = {}
    return Promise.method(() => {
      return Promise.bind(THIS, 1)
    })().then(function(value) {
      assert.strictEqual(THIS, this)
      assert.strictEqual(1, value)
    })
  })
})
