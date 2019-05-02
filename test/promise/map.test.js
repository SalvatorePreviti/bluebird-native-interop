// Based on Bluebird tests (MIT License). see https://github.com/petkaantonov/bluebird and http://bluebirdjs.com and LICENSE file

const { assert } = require('chai')

describe('map', () => {
  const concurrency = { concurrency: 2 }

  function mapper(val) {
    return val * 2
  }

  function deferredMapper(val) {
    return Promise.delay(1, mapper(val))
  }

  it('should map input values array', () => {
    const input = [1, 2, 3]
    return Promise.resolve(input)
      .map(mapper)
      .then(results => {
        assert.deepEqual(results, [2, 4, 6])
      }, assert.fail)
  })

  it('should map input promises array', () => {
    const input = [Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)]
    return Promise.resolve(input)
      .map(mapper)
      .then(results => {
        assert.deepEqual(results, [2, 4, 6])
      }, assert.fail)
  })

  it('should map mixed input array', () => {
    const input = [1, Promise.resolve(2), 3]
    return Promise.resolve(input)
      .map(mapper)
      .then(results => {
        assert.deepEqual(results, [2, 4, 6])
      }, assert.fail)
  })

  it('should map input when mapper returns a promise', () => {
    const input = [1, 2, 3]
    return Promise.resolve(input)
      .map(deferredMapper)
      .then(results => {
        assert.deepEqual(results, [2, 4, 6])
      }, assert.fail)
  })

  it('should accept a promise for an array', () => {
    return Promise.resolve([1, Promise.resolve(2), 3])
      .map(mapper)
      .then(result => {
        assert.deepEqual(result, [2, 4, 6])
      }, assert.fail)
  })

  it('should throw a TypeError when input promise does not resolve to an array', () => {
    return Promise.resolve(123)
      .map(mapper)
      .caught(TypeError, () => {})
  })

  it('should map input promises when mapper returns a promise', () => {
    const input = [Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)]
    return Promise.resolve(input)
      .map(mapper)
      .then(results => {
        assert.deepEqual(results, [2, 4, 6])
      }, assert.fail)
  })

  it('should reject when input contains rejection', () => {
    const input = [Promise.resolve(1), Promise.reject(2), Promise.resolve(3)]
    return Promise.resolve(input)
      .map(mapper)
      .then(assert.fail, result => {
        assert(result === 2)
      })
  })

  it('should call mapper asynchronously on values array', () => {
    let calls = 0

    function mapper2() {
      calls++
    }

    const input = [1, 2, 3]
    const p = Promise.resolve(input).map(mapper2)
    assert(calls === 0)
    return p.then(() => {
      assert(calls === 3)
    })
  })

  it('should call mapper asynchronously on promises array', () => {
    let calls = 0

    function mapper2() {
      calls++
    }

    const input = [Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)]
    const p = Promise.resolve(input).map(mapper2)
    assert(calls === 0)
    return p.then(() => {
      assert(calls === 3)
    })
  })

  it('should call mapper asynchronously on mixed array', () => {
    let calls = 0

    function mapper2() {
      calls++
    }

    const input = [1, Promise.resolve(2), 3]
    const p = Promise.resolve(input).map(mapper2)
    assert(calls === 0)
    return p.then(() => {
      assert(calls === 3)
    })
  })

  it('should map input values array with concurrency', () => {
    const input = [1, 2, 3]
    return Promise.resolve(input)
      .map(mapper, concurrency)
      .then(results => {
        assert.deepEqual(results, [2, 4, 6])
      }, assert.fail)
  })

  it('should map input promises array with concurrency', () => {
    const input = [Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)]
    return Promise.resolve(input)
      .map(mapper, concurrency)
      .then(results => {
        assert.deepEqual(results, [2, 4, 6])
      }, assert.fail)
  })

  it('should map mixed input array with concurrency', () => {
    const input = [1, Promise.resolve(2), 3]
    return Promise.resolve(input)
      .map(mapper, concurrency)
      .then(results => {
        assert.deepEqual(results, [2, 4, 6])
      }, assert.fail)
  })

  it('should map input when mapper returns a promise with concurrency', () => {
    const input = [1, 2, 3]
    return Promise.resolve(input)
      .map(deferredMapper, concurrency)
      .then(results => {
        assert.deepEqual(results, [2, 4, 6])
      }, assert.fail)
  })

  it('should accept a promise for an array with concurrency', () => {
    return Promise.resolve([1, Promise.resolve(2), 3])
      .map(mapper, concurrency)
      .then(result => {
        assert.deepEqual(result, [2, 4, 6])
      }, assert.fail)
  })

  it('should resolve to empty array when input promise does not resolve to an array with concurrency', () => {
    return Promise.resolve(123)
      .map(mapper, concurrency)
      .caught(TypeError, () => {})
  })

  it('should map input promises when mapper returns a promise with concurrency', () => {
    const input = [Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)]
    return Promise.resolve(input)
      .map(mapper, concurrency)
      .then(results => {
        assert.deepEqual(results, [2, 4, 6])
      }, assert.fail)
  })

  it('should reject when input contains rejection with concurrency', () => {
    const input = [Promise.resolve(1), Promise.reject(2), Promise.resolve(3)]
    return Promise.resolve(input)
      .map(mapper, concurrency)
      .then(assert.fail, result => {
        assert(result === 2)
      })
  })

  it('should not have more than {concurrency} promises in flight', () => {
    const array = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const b = []

    const immediates = []

    function immediate(index) {
      let r
      const ret = new Promise(resolve => {
        r = resolve
      })
      immediates.push([ret, r, index])
      return ret
    }

    const lates = []

    function late(index) {
      let r
      const ret = new Promise(resolve => {
        r = resolve
      })
      lates.push([ret, r, index])
      return ret
    }

    function promiseByIndex(index) {
      return index < 5 ? immediate(index) : late(index)
    }

    function doResolve(item) {
      item[1](item[2])
    }

    const ret1 = Promise.resolve(array).map(
      (value, index) => {
        return promiseByIndex(index).then(() => {
          b.push(value)
        })
      },
      { concurrency: 5 }
    )

    const ret2 = Promise.delay(100)
      .then(() => {
        assert.strictEqual(0, b.length)
        immediates.forEach(doResolve)
        return immediates.map(item => {
          return item[0]
        })
      })
      .delay(100)
      .then(() => {
        assert.deepEqual(b, [0, 1, 2, 3, 4])
        lates.forEach(doResolve)
      })
      .delay(100)
      .then(() => {
        assert.deepEqual(b, [0, 1, 2, 3, 4, 10, 9, 8, 7, 6])
        lates.forEach(doResolve)
      })
      .thenReturn(ret1)
      .then(() => {
        assert.deepEqual(b, [0, 1, 2, 3, 4, 10, 9, 8, 7, 6, 5])
      })
    return Promise.all([ret1, ret2])
  })
})
