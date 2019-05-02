const { assert } = require('chai')

describe('tapCatch', () => {
  function rejection() {
    const error = new Error('test')
    const r = Promise.reject(error)
    r.err = error
    return r
  }

  it('passes through rejection reason', () => {
    return rejection()
      .tapCatch(() => {
        return 3
      })
      .caught(value => {
        assert.equal(value.message, 'test')
      })
  })

  it('passes through reason after returned promise is fulfilled', () => {
    let async = false
    return rejection()
      .tapCatch(() => {
        return new Promise(r => {
          setTimeout(() => {
            async = true
            r(3)
          }, 1)
        })
      })
      .caught(value => {
        assert(async)
        assert.equal(value.message, 'test')
      })
  })

  it('is not called on fulfilled promise', () => {
    let called = false
    return Promise.resolve('test')
      .tapCatch(() => {
        called = true
      })
      .then(() => {
        assert(!called)
      }, assert.fail)
  })

  it('passes immediate rejection', () => {
    const err = new Error()
    return rejection()
      .tapCatch(() => {
        throw err
      })
      .tap(assert.fail)
      .then(assert.fail, e => {
        assert(err === e)
      })
  })

  it('passes eventual rejection', () => {
    const err = new Error()
    return rejection()
      .tapCatch(() => {
        return new Promise((_, rej) => {
          setTimeout(() => {
            rej(err)
          }, 1)
        })
      })
      .tap(assert.fail)
      .then(assert.fail, e => {
        assert(err === e)
      })
  })

  it('passes reason', () => {
    return rejection()
      .tapCatch(a => {
        assert(a === rejection)
      })
      .then(assert.fail, () => {})
  })

  it('Works with predicates', () => {
    let called = false
    return Promise.reject(new TypeError())
      .tapCatch(TypeError, err => {
        called = true
        assert(err instanceof TypeError)
      })
      .then(assert.fail, err => {
        assert(called === true)
        assert(err instanceof TypeError)
      })
  })
  it("Does not get called on predicates that don't match", () => {
    let called = false
    return Promise.reject(new TypeError())
      .tapCatch(ReferenceError, () => {
        called = true
      })
      .then(assert.fail, err => {
        assert(called === false)
        assert(err instanceof TypeError)
      })
  })

  it('Supports multiple predicates', () => {
    let calledA = false
    let calledB = false
    let calledC = false

    const promiseA = Promise.reject(new ReferenceError())
      .tapCatch(ReferenceError, TypeError, e => {
        assert(e instanceof ReferenceError)
        calledA = true
      })
      .catch(() => {})

    const promiseB = Promise.reject(new TypeError())
      .tapCatch(ReferenceError, TypeError, e => {
        assert(e instanceof TypeError)
        calledB = true
      })
      .catch(() => {})

    const promiseC = Promise.reject(new SyntaxError())
      .tapCatch(ReferenceError, TypeError, () => {
        calledC = true
      })
      .catch(() => {})

    return Promise.join(promiseA, promiseB, promiseC, () => {
      assert(calledA === true)
      assert(calledB === true)
      assert(calledC === false)
    })
  })
})
