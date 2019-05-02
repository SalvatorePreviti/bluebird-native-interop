const { assert } = require('chai')

describe('some', () => {
  it('should reject on negative number', () => {
    return Promise.resolve([1, 2, 3])
      .some(-1)
      .then(assert.fail)
      .caught(Promise.TypeError, () => {})
  })

  it('should reject on NaN', () => {
    return Promise.resolve([1, 2, 3])
      .some(-0 / 0)
      .then(assert.fail)
      .caught(Promise.TypeError, () => {})
  })

  it('should reject on non-array', () => {
    return Promise.resolve({})
      .some(2)
      .then(assert.fail)
      .caught(Promise.TypeError, () => {})
  })

  it('should reject with rangeerror when impossible to fulfill', () => {
    return Promise.resolve([1, 2, 3])
      .some(4)
      .then(assert.fail)
      .caught(Promise.RangeError, () => {})
  })

  it('should fulfill with empty array with 0', () => {
    return Promise.resolve([1, 2, 3])
      .some(0)
      .then(result => {
        assert.deepEqual(result, [])
      })
  })
})
