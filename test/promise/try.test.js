// Based on Bluebird tests (MIT License). see https://github.com/petkaantonov/bluebird and http://bluebirdjs.com and LICENSE file

const assert = require('assert')

describe('Promise.attempt', () => {
  const error = new Error()
  const thrower = function() {
    throw error
  }

  const tryy = Promise.try

  it('should reject when the function throws', () => {
    let async = false
    const ret = tryy(thrower).then(assert.fail, e => {
      assert(async)
      assert(e === error)
    })
    async = true
    return ret
  })

  it('should reject when the function is not a function', () => {
    let async = false
    const ret = tryy(null).then(assert.fail, e => {
      assert(async)
      assert(e instanceof Promise.TypeError)
    })
    async = true
    return ret
  })

  it('should unwrap returned promise', () => {
    const d = Promise.defer()

    const ret = tryy(() => {
      return d.promise
    }).then(v => {
      assert(v === 3)
    })

    setTimeout(() => {
      d.fulfill(3)
    }, 1)
    return ret
  })
  it('should unwrap returned thenable', () => {
    return tryy(() => {
      return {
        then(f) {
          f(3)
        }
      }
    }).then(v => {
      assert(v === 3)
    })
  })
})
