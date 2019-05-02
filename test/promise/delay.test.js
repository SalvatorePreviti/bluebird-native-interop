// Based on Bluebird tests (MIT License). see https://github.com/petkaantonov/bluebird and http://bluebirdjs.com and LICENSE file

const { assert } = require('chai')

describe('delay', () => {
  it('should not delay rejection', () => {
    const promise = Promise.reject(5).delay(15)

    promise.then(assert.fail, () => {})

    return Promise.resolve()
      .delay(5)
      .then(() => {
        assert(!promise.isPending())
      })
  })

  it('should delay after resolution', () => {
    const promise1 = Promise.delay(1, 'what')
    const promise2 = promise1.delay(1)

    return promise2.then(value => {
      assert(value === 'what')
    })
  })

  it("should resolve follower promise's value", () => {
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
    return Promise.resolve(f)
      .delay(1)
      .then(value => {
        assert.equal(value, 3)
      })
  })

  it('should reject with a custom error if an error was provided as a parameter', () => {
    const err = Error('Testing Errors')
    return Promise.resolve()
      .delay(1)
      .timeout(10, err)
      .caught(e => {
        assert(e === err)
      })
  })
})
