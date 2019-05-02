// Based on Bluebird tests (MIT License). see https://github.com/petkaantonov/bluebird and http://bluebirdjs.com and LICENSE file

const { assert } = require('chai')

describe('filter', () => {
  function ThrownError() {}

  const arr = [1, 2, 3]

  function assertArr(a) {
    assert(a.length === 2)
    assert(a[0] === 1)
    assert(a[1] === 3)
  }

  function assertErr(e) {
    assert(e instanceof ThrownError)
  }

  function assertFail() {
    assert.fail()
  }

  describe('should accept eventual booleans', () => {
    it('immediately fulfilled', () => {
      return Promise.resolve(arr)
        .filter(v => {
          return new Promise(r => {
            r(v !== 2)
          })
        })
        .then(assertArr)
    })

    it('already fulfilled', () => {
      return Promise.resolve(arr)
        .filter(v => {
          return Promise.resolve(v !== 2)
        })
        .then(assertArr)
    })

    it('eventually fulfilled', () => {
      return Promise.resolve(arr)
        .filter(v => {
          return new Promise(r => {
            setTimeout(() => {
              r(v !== 2)
            }, 1)
          })
        })
        .then(assertArr)
    })

    it('immediately rejected', () => {
      return Promise.resolve(arr)
        .filter(() => {
          return new Promise((_resolve, r) => {
            r(new ThrownError())
          })
        })
        .then(assertFail, assertErr)
    })
    it('already rejected', () => {
      return Promise.resolve(arr)
        .filter(() => {
          return Promise.reject(new ThrownError())
        })
        .then(assertFail, assertErr)
    })
    it('eventually rejected', () => {
      return Promise.resolve(arr)
        .filter(() => {
          return new Promise((_resolve, r) => {
            setTimeout(() => {
              r(new ThrownError())
            }, 1)
          })
        })
        .then(assertFail, assertErr)
    })

    it('immediately fulfilled thenable', () => {
      return Promise.resolve(arr)
        .filter(v => {
          return {
            then(f) {
              f(v !== 2)
            }
          }
        })
        .then(assertArr)
    })
    it('eventually fulfilled thenable', () => {
      return Promise.resolve(arr)
        .filter(v => {
          return {
            then(f) {
              setTimeout(() => {
                f(v !== 2)
              }, 1)
            }
          }
        })
        .then(assertArr)
    })

    it('immediately rejected thenable', () => {
      return Promise.resolve(arr)
        .filter(() => {
          return {
            then(f, r) {
              r(new ThrownError())
            }
          }
        })
        .then(assertFail, assertErr)
    })
    it('eventually rejected thenable', () => {
      return Promise.resolve(arr)
        .filter(() => {
          return {
            then(f, r) {
              setTimeout(() => {
                r(new ThrownError())
              }, 1)
            }
          }
        })
        .then(assertFail, assertErr)
    })
  })
})
