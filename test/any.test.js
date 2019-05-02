'use strict'

const { assert, expect } = require('chai')

describe('Promise.any-test', () => {
  const token = {}

  const RangeError = Promise.RangeError

  function contains(arr, result) {
    return arr.indexOf(result) > -1
  }

  function assertToken(val) {
    expect(token).to.equal(val)
  }

  function returnToken() {
    return token
  }

  it('should reject on empty input array', () => {
    return Promise.resolve([])
      .any()
      .caught(RangeError, returnToken)
      .then(assertToken)
  })

  it('should resolve with an input value', () => {
    const input = [1, 2, 3]
    return Promise.resolve(input)
      .any()
      .then(result => {
        assert(contains(input, result))
      }, assert.fail)
  })

  it('should resolve with a promised input value', () => {
    const input = [Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)]
    return Promise.resolve(input)
      .any()
      .then(result => {
        assert(contains([1, 2, 3], result))
      }, assert.fail)
  })

  it('should reject with all rejected input values if all inputs are rejected', () => {
    const input = [Promise.reject(1), Promise.reject(2), Promise.reject(3)]
    const promise = Promise.resolve(input).any()

    return promise.then(assert.fail, result => {
      //Cannot use deep equality in IE8 because non-enumerable properties are not
      //supported
      assert(result[0] === 1)
      assert(result[1] === 2)
      assert(result[2] === 3)
    })
  })

  it('should accept a promise for an array', () => {
    const expected = [1, 2, 3]
    const input = Promise.resolve(expected)

    return Promise.resolve(input)
      .any()
      .then(result => {
        assert.notDeepEqual(expected.indexOf(result), -1)
      }, assert.fail)
  })

  it('should allow zero handlers', () => {
    const input = [1, 2, 3]
    return Promise.resolve(input)
      .any()
      .then(result => {
        assert(contains(input, result))
      }, assert.fail)
  })

  it('should resolve to empty array when input promise does not resolve to array', () => {
    return Promise.resolve(1)
      .any()
      .caught(TypeError, returnToken)
      .then(assertToken)
  })

  it('should reject when given immediately rejected promise', () => {
    const err = new Error()
    return Promise.reject(err)
      .any()
      .then(assert.fail, e => {
        assert.strictEqual(err, e)
      })
  })
})
