const { assert } = require('chai')

describe('tap', () => {
  it('passes through value', () => {
    return Promise.resolve('test')
      .tap(() => {
        return 3
      })
      .then(value => {
        assert.equal(value, 'test')
      })
  })

  it('passes through value after returned promise is fulfilled', () => {
    let async = false
    return Promise.resolve('test')
      .tap(() => {
        return new Promise(r => {
          setTimeout(() => {
            async = true
            r(3)
          }, 1)
        })
      })
      .then(value => {
        assert(async)
        assert.equal(value, 'test')
      })
  })

  it('is not called on rejected promise', () => {
    let called = false
    return Promise.reject('test')
      .tap(() => {
        called = true
      })
      .then(assert.fail, () => {
        assert(!called)
      })
  })

  it('passes immediate rejection', () => {
    const err = new Error()
    return Promise.resolve('test')
      .tap(() => {
        throw err
      })
      .tap(assert.fail)
      .then(assert.fail, e => {
        assert(err === e)
      })
  })

  it('passes eventual rejection', () => {
    const err = new Error()
    return Promise.resolve('test')
      .tap(() => {
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

  it('passes value', () => {
    return Promise.resolve(123).tap(a => {
      assert(a === 123)
    })
  })
})
