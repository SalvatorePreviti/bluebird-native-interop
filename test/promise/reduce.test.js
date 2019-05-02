'use strict'

const { assert } = require('chai')

describe('Promise.prototype.reduce', () => {
  function promised(val) {
    return new Promise(f => {
      setTimeout(() => {
        f(val)
      }, 1)
    })
  }

  function thenabled(val) {
    return {
      then(f) {
        setTimeout(() => {
          f(val)
        }, 1)
      }
    }
  }

  it('works with no values', () => {
    return Promise.resolve([])
      .reduce((total, value) => {
        return total + value + 5
      })
      .then(total => {
        assert.strictEqual(total, undefined)
      })
  })

  it('works with a single value', () => {
    return Promise.resolve([1])
      .reduce((total, value) => {
        return total + value + 5
      })
      .then(total => {
        assert.strictEqual(total, 1)
      })
  })

  it('works when the iterator returns a value', () => {
    return Promise.resolve([1, 2, 3])
      .reduce((total, value) => {
        return total + value + 5
      })
      .then(total => {
        assert.strictEqual(total, 1 + 2 + 5 + 3 + 5)
      })
  })

  it('works when the iterator returns a Promise', () => {
    return Promise.resolve([1, 2, 3])
      .reduce((total, value) => {
        return promised(5).then(bonus => {
          return total + value + bonus
        })
      })
      .then(total => {
        assert.strictEqual(total, 1 + 2 + 5 + 3 + 5)
      })
  })

  it('works when the iterator returns a thenable', () => {
    return Promise.resolve([1, 2, 3])
      .reduce((total, value) => {
        return thenabled(total + value + 5)
      })
      .then(total => {
        assert.strictEqual(total, 1 + 2 + 5 + 3 + 5)
      })
  })
})
