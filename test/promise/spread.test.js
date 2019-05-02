// Based on Bluebird tests (MIT License). see https://github.com/petkaantonov/bluebird and http://bluebirdjs.com and LICENSE file

const { assert, expect } = require('chai')

describe('spread', () => {
  it('spreads values across arguments', () => {
    return Promise.resolve([1, 2, 3]).spread((a, b) => {
      assert.equal(b, 2)
    })
  })

  it('spreads promises for arrays across arguments', () => {
    return Promise.resolve([Promise.resolve(10)])
      .all()
      .spread(value => {
        assert.equal(value, 10)
      })
  })

  it('spreads arrays of promises across arguments', () => {
    const deferredA = Promise.defer()
    const deferredB = Promise.defer()

    const promise = Promise.resolve([deferredA.promise, deferredB.promise])
      .all()
      .spread((a, b) => {
        assert.equal(a, 10)
        assert.equal(b, 20)
      })

    Promise.delay(1).then(() => {
      deferredA.resolve(10)
    })
    Promise.delay(1).then(() => {
      deferredB.resolve(20)
    })

    return promise
  })

  it('spreads arrays of thenables across arguments', () => {
    const p1 = {
      then(v) {
        v(10)
      }
    }
    const p2 = {
      then(v) {
        v(20)
      }
    }

    const promise = Promise.resolve([p1, p2])
      .all()
      .spread((a, b) => {
        assert.equal(a, 10)
        assert.equal(b, 20)
      })
    return promise
  })

  it('should wait for promises in the returned array even when not calling .all', () => {
    const d1 = Promise.defer()
    const d2 = Promise.defer()
    const d3 = Promise.defer()
    setTimeout(() => {
      d1.resolve(1)
      d2.resolve(2)
      d3.resolve(3)
    }, 1)
    return Promise.resolve()
      .then(() => {
        return [d1.promise, d2.promise, d3.promise]
      })
      .all()
      .spread((a, b, c) => {
        assert(a === 1)
        assert(b === 2)
        assert(c === 3)
      })
  })

  it('should wait for thenables in the returned array even when not calling .all', () => {
    const t1 = {
      then(fn) {
        setTimeout(() => {
          fn(1)
        }, 1)
      }
    }
    const t2 = {
      then(fn) {
        setTimeout(() => {
          fn(2)
        }, 1)
      }
    }
    const t3 = {
      then(fn) {
        setTimeout(() => {
          fn(3)
        }, 1)
      }
    }
    return Promise.resolve()
      .then(() => {
        return [t1, t2, t3]
      })
      .all()
      .spread((a, b, c) => {
        assert(a === 1)
        assert(b === 2)
        assert(c === 3)
      })
  })

  it('should wait for promises in an array that a returned promise resolves to even when not calling .all', () => {
    const d1 = Promise.defer()
    const d2 = Promise.defer()
    const d3 = Promise.defer()
    const defer = Promise.defer()

    setTimeout(() => {
      defer.resolve([d1.promise, d2.promise, d3.promise])
      setTimeout(() => {
        d1.resolve(1)
        d2.resolve(2)
        d3.resolve(3)
      }, 1)
    }, 1)

    return Promise.resolve()
      .then(() => {
        return defer.promise
      })
      .all()
      .spread((a, b, c) => {
        assert(a === 1)
        assert(b === 2)
        assert(c === 3)
      })
  })

  it('should wait for thenables in an array that a returned thenable resolves to even when not calling .all', () => {
    const t1 = {
      then(fn) {
        setTimeout(() => {
          fn(1)
        }, 1)
      }
    }
    const t2 = {
      then(fn) {
        setTimeout(() => {
          fn(2)
        }, 1)
      }
    }
    const t3 = {
      then(fn) {
        setTimeout(() => {
          fn(3)
        }, 1)
      }
    }

    const thenable = {
      then(fn) {
        setTimeout(() => {
          fn([t1, t2, t3])
        }, 1)
      }
    }

    return Promise.resolve()
      .then(() => {
        return thenable
      })
      .all()
      .spread((a, b, c) => {
        assert(a === 1)
        assert(b === 2)
        assert(c === 3)
      })
  })

  it('should reject with error when non array is the ultimate value to be spread', () => {
    return Promise.resolve()
      .then(() => {
        return 3
      })
      .spread(() => {
        assert.fail()
      })
      .then(assert.fail)
      .catch(e => {
        expect(e).to.be.an.instanceOf(TypeError)
      })
  })

  it('gh-235', () => {
    const P = Promise
    return P.resolve(1)
      .then(x => {
        return [x, P.resolve(2)]
      })
      .spread(() => {
        return P.all([P.resolve(3), P.resolve(4)])
      })
      .then(a => {
        assert.deepEqual([3, 4], a)
      })
  })

  it('error when passed non-function', () => {
    return Promise.resolve(3)
      .spread()
      .then(assert.fail)
      .caught(Promise.TypeError, () => {})
  })

  it('error when resolution is non-spredable', () => {
    return Promise.resolve(3)
      .spread(() => {})
      .then(assert.fail)
      .caught(Promise.TypeError, () => {})
  })

  it('should return a promise', () => {
    assert(typeof Promise.defer().promise.spread(() => {}).then === 'function')
  })

  it('should apply onFulfilled with array as argument list', () => {
    return Promise.resolve([1, 2, 3]).spread((...args) => {
      expect(args).to.deep.equal([1, 2, 3])
    })
  })

  it('should resolve array contents', () => {
    const expected = [Promise.resolve(1), 2, Promise.resolve(3)]
    return Promise.resolve(expected)
      .all()
      .spread((...args) => {
        assert.deepEqual(args, [1, 2, 3])
      })
  })

  it('should reject if any item in array rejects', () => {
    const expected = [Promise.resolve(1), 2, Promise.reject(3)]
    return Promise.resolve(expected)
      .all()
      .spread(assert.fail)
      .then(assert.fail, () => {})
  })

  it('should apply onFulfilled with array as argument list', () => {
    const expected = [1, 2, 3]
    return Promise.resolve(Promise.resolve(expected)).spread((...args) => {
      expect(args).to.deep.equal([1, 2, 3])
    })
  })

  it('should resolve array contents', () => {
    const expected = [Promise.resolve(1), 2, Promise.resolve(3)]
    return Promise.resolve(Promise.resolve(expected))
      .all()
      .spread((...args) => {
        assert.deepEqual(args, [1, 2, 3])
      })
  })

  it('should reject if input is a rejected promise', () => {
    const expected = Promise.reject([1, 2, 3])
    return Promise.resolve(expected)
      .spread(assert.fail)
      .then(assert.fail, () => {})
  })
})
