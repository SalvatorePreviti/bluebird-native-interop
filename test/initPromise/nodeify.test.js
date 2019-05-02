'use strict'

const assert = require('assert')

const sinon = require('sinon')

function getSpy() {
  let resolve
  let reject
  const promise = new Promise((...args) => {
    resolve = args[0]
    reject = args[1]
  }).timeout(500)
  const ret = function(fn) {
    ret.callback = fn
    return ret.node
  }
  ret.promise = promise
  ret.node = function(...args) {
    try {
      ret.callback.apply(this, args)
      resolve()
    } catch (er) {
      reject(er)
    }
  }
  return ret
}

function awaitGlobalException(fn) {
  function replaceListeners(by) {
    const single = typeof by === 'function'
    const original = process.listeners('uncaughtException')
    process.removeAllListeners('uncaughtException')
    if (single) by = [by]
    by.forEach(listener => {
      process.on('uncaughtException', listener)
    })
    return original
  }

  return new Promise((resolve, reject) => {
    const listeners = replaceListeners(e => {
      let err
      let ret
      try {
        ret = fn(e)
      } catch (er) {
        err = er
      }
      if (!err && ret === false) return
      replaceListeners(listeners)
      Promise.delay(1).then(() => {
        if (err) reject(err)
        resolve()
      })
    })
  })
}

describe('nodeify', () => {
  it('calls back with a resolution', () => {
    const spy = sinon.spy()
    Promise.resolve(10).nodeify(spy)
    setTimeout(() => {
      sinon.assert.calledOnce(spy)
      sinon.assert.calledWith(spy, null, 10)
    }, 1)
  })

  it('calls back with an undefined resolution', () => {
    const spy = sinon.spy()
    Promise.resolve().nodeify(spy)
    setTimeout(() => {
      sinon.assert.calledOnce(spy)
      sinon.assert.calledWithExactly(spy, null)
    }, 1)
  })

  it('calls back with an error', () => {
    const spy = sinon.spy()
    Promise.reject(10).nodeify(spy)
    setTimeout(() => {
      sinon.assert.calledOnce(spy)
      sinon.assert.calledWith(spy, 10)
    }, 5)
  })

  it('forwards a promise', () => {
    return Promise.resolve(10)
      .nodeify()
      .then(ten => {
        assert(ten === 10)
      })
  })

  it('returns undefined when a callback is passed', () => {
    return typeof Promise.resolve(10).nodeify(() => {}) === 'undefined'
  })

  const e = new Error()

  function thrower() {
    throw e
  }

  it('throws normally in the node process if the function throws', () => {
    const promise = Promise.resolve(10)
    let turns = 0
    process.nextTick(() => {
      turns++
    })
    promise.nodeify(thrower)
    return awaitGlobalException(err => {
      assert(err === e)
      assert(turns === 1)
    })
  })

  it('should spread arguments with spread option', () => {
    const spy = getSpy()
    Promise.resolve([1, 2, 3]).nodeify(
      spy((err, a, b, c) => {
        assert(err === null)
        assert(a === 1)
        assert(b === 2)
        assert(c === 3)
      }),
      { spread: true }
    )
    return spy.promise
  })

  describe('promise rejected with falsy values', () => {
    it('no reason', () => {
      const spy = getSpy()
      Promise.reject().nodeify(
        spy(function(err) {
          assert.strictEqual(arguments.length, 1)
          assert.strictEqual(err.cause, undefined)
        })
      )
      return spy.promise
    })
    it('null reason', () => {
      const spy = getSpy()
      Promise.reject(null).nodeify(
        spy(function(err) {
          assert.strictEqual(arguments.length, 1)
          assert.strictEqual(err.cause, null)
        })
      )
      return spy.promise
    })
    it('nodefying a follewer promise', () => {
      const spy = getSpy()
      new Promise(resolve => {
        resolve(
          new Promise((_resolve, reject) => {
            setTimeout(() => {
              reject()
            }, 1)
          })
        )
      }).nodeify(
        spy(function(err) {
          assert.strictEqual(arguments.length, 1)
          assert.strictEqual(err.cause, undefined)
        })
      )
      return spy.promise
    })
    it('nodefier promise becomes follower', () => {
      const spy = getSpy()
      Promise.resolve(1)
        .then(() => {
          return new Promise((_, reject) => {
            setTimeout(() => {
              reject()
            }, 1)
          })
        })
        .nodeify(
          spy(function(err) {
            assert.strictEqual(arguments.length, 1)
            assert.strictEqual(err.cause, undefined)
          })
        )
      return spy.promise
    })
  })
  it('should wrap arguments with spread option', () => {
    const spy = getSpy()
    Promise.resolve([1, 2, 3]).nodeify(
      spy((err, a, b, c) => {
        assert(err === null)
        assert(a === 1)
        assert(b === 2)
        assert(c === 3)
      }),
      { spread: true }
    )
    return spy.promise
  })

  it('should work then result is not an array', () => {
    const spy = getSpy()
    Promise.resolve(3).nodeify(
      spy((err, a) => {
        assert(err === null)
        assert(a === 3)
      }),
      { spread: true }
    )
    return spy.promise
  })

  it('should work if the callback throws when spread', () => {
    const err = new Error()
    Promise.resolve([1, 2, 3]).nodeify(
      () => {
        throw err
      },
      { spread: true }
    )

    return awaitGlobalException(er => {
      assert.strictEqual(err, er)
    })
  })

  it('should work if the callback throws when rejected', () => {
    const err = new Error()
    Promise.reject(new Error()).nodeify(() => {
      throw err
    })

    return awaitGlobalException(er => {
      assert.strictEqual(err, er)
    })
  })
})
