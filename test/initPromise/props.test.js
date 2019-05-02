'use strict'

const { assert } = require('chai')

describe('Promise.props', () => {
  it('should reject undefined', () => {
    return Promise.props().caught(TypeError, () => {})
  })

  it('should reject primitive', () => {
    return Promise.props('str').caught(TypeError, () => {})
  })

  it('should resolve to new object', () => {
    const o = {}
    return Promise.props(o).then(v => {
      assert(v !== o)
      assert.deepEqual(o, v)
    })
  })

  it('should resolve value properties', () => {
    const o = {
      one: 1,
      two: 2,
      three: 3
    }
    return Promise.props(o).then(v => {
      assert.deepEqual(
        {
          one: 1,
          two: 2,
          three: 3
        },
        v
      )
    })
  })

  it('should resolve immediate properties', () => {
    const o = {
      one: Promise.resolve(1),
      two: Promise.resolve(2),
      three: Promise.resolve(3)
    }
    return Promise.props(o).then(v => {
      assert.deepEqual(
        {
          one: 1,
          two: 2,
          three: 3
        },
        v
      )
    })
  })

  it('should resolve eventual properties', () => {
    const d1 = Promise.defer()
    const d2 = Promise.defer()
    const d3 = Promise.defer()
    const o = {
      one: d1.promise,
      two: d2.promise,
      three: d3.promise
    }

    setTimeout(() => {
      d1.fulfill(1)
      d2.fulfill(2)
      d3.fulfill(3)
    }, 1)

    return Promise.props(o).then(v => {
      assert.deepEqual(
        {
          one: 1,
          two: 2,
          three: 3
        },
        v
      )
    })
  })

  it('should reject if any input promise rejects', () => {
    const o = {
      one: Promise.resolve(1),
      two: Promise.reject(2),
      three: Promise.resolve(3)
    }
    return Promise.props(o).then(assert.fail, v => {
      assert(v === 2)
    })
  })

  it('should accept a promise for an object', () => {
    const o = {
      one: Promise.resolve(1),
      two: Promise.resolve(2),
      three: Promise.resolve(3)
    }
    const d1 = Promise.defer()
    setTimeout(() => {
      d1.fulfill(o)
    }, 1)
    return Promise.props(d1.promise).then(v => {
      assert.deepEqual(
        {
          one: 1,
          two: 2,
          three: 3
        },
        v
      )
    })
  })

  it('should reject a promise for a primitive', () => {
    const d1 = Promise.defer()
    setTimeout(() => {
      d1.fulfill('text')
    }, 1)
    return Promise.props(d1.promise).caught(TypeError, () => {})
  })

  it('should accept thenables in properties', () => {
    const t1 = {
      then(cb) {
        cb(1)
      }
    }
    const t2 = {
      then(cb) {
        cb(2)
      }
    }
    const t3 = {
      then(cb) {
        cb(3)
      }
    }
    const o = {
      one: t1,
      two: t2,
      three: t3
    }
    return Promise.props(o).then(v => {
      assert.deepEqual(
        {
          one: 1,
          two: 2,
          three: 3
        },
        v
      )
    })
  })

  it('should accept a thenable for thenables in properties', () => {
    const o = {
      then(f) {
        f({
          one: {
            then(cb) {
              cb(1)
            }
          },
          two: {
            then(cb) {
              cb(2)
            }
          },
          three: {
            then(cb) {
              cb(3)
            }
          }
        })
      }
    }
    return Promise.props(o).then(v => {
      assert.deepEqual(
        {
          one: 1,
          two: 2,
          three: 3
        },
        v
      )
    })
  })

  it('treats arrays for their properties', () => {
    const o = [1, 2, 3]

    return Promise.props(o).then(v => {
      assert.deepEqual(
        {
          0: 1,
          1: 2,
          2: 3
        },
        v
      )
    })
  })

  if (typeof Map !== 'undefined') {
    it('works with es6 maps', () => {
      return Promise.props(
        new Map([['a', Promise.resolve(1)], ['b', Promise.resolve(2)], ['c', Promise.resolve(3)]])
      ).then(result => {
        assert.strictEqual(result.get('a'), 1)
        assert.strictEqual(result.get('b'), 2)
        assert.strictEqual(result.get('c'), 3)
      })
    })

    it("doesn't await promise keys in es6 maps", () => {
      const a = new Promise(() => {})
      const b = new Promise(() => {})
      const c = new Promise(() => {})

      return Promise.props(new Map([[a, Promise.resolve(1)], [b, Promise.resolve(2)], [c, Promise.resolve(3)]])).then(
        result => {
          assert.strictEqual(result.get(a), 1)
          assert.strictEqual(result.get(b), 2)
          assert.strictEqual(result.get(c), 3)
        }
      )
    })

    it('empty map should resolve to empty map', () => {
      return Promise.props(new Map()).then(result => {
        assert(result instanceof Map)
      })
    })
  }
})
