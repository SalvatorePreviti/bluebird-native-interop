'use strict'

const { assert, expect } = require('chai')

describe('bind', () => {
  const defaultThis = (function() {
    return this
  })()

  function timedThenableOf(value) {
    return {
      then(onFulfilled) {
        setTimeout(() => {
          onFulfilled(value)
        }, 1)
      }
    }
  }

  function timedPromiseOf(value) {
    return Promise.delay(1, value)
  }

  function immediatePromiseOf(value) {
    return Promise.resolve(value)
  }

  function immediateThenableOf(value) {
    return {
      then(onFulfilled) {
        onFulfilled(value)
      }
    }
  }

  function timedRejectedThenableOf(value) {
    return {
      then(onFulfilled, onRejected) {
        setTimeout(() => {
          onRejected(value)
        }, 1)
      }
    }
  }

  function timedRejectedPromiseOf(value) {
    return Promise.delay(1).then(() => {
      throw value
    })
  }

  function immediateRejectedPromiseOf(value) {
    return Promise.reject(value)
  }

  function immediateRejectedThenableOf(value) {
    return {
      then(onFulfilled, onRejected) {
        onRejected(value)
      }
    }
  }

  const THIS = { name: 'this' }

  function CustomError1() {}

  CustomError1.prototype = Object.create(Error.prototype)

  function CustomError2() {}

  CustomError2.prototype = Object.create(Error.prototype)

  describe('when using .bind', () => {
    describe('with finally', () => {
      describe('this should refer to the bound object', () => {
        it('in straight-forward handler', () => {
          return Promise.resolve()
            .bind(THIS)
            .lastly(function() {
              assert(this === THIS)
            })
        })

        it('after promise returned from finally resolves', () => {
          const d = Promise.defer()
          const promise = d.promise
          let waited = false

          setTimeout(() => {
            waited = true
            d.fulfill()
          }, 1)

          return Promise.resolve()
            .bind(THIS)
            .lastly(() => {
              return promise
            })
            .lastly(function() {
              assert(waited)
              assert(this === THIS)
            })
        })
      })
    })

    describe('with tap', () => {
      describe('this should refer to the bound object', () => {
        it('in straight-forward handler', () => {
          return Promise.resolve()
            .bind(THIS)
            .tap(function() {
              assert(this === THIS)
            })
        })

        it('after promise returned from tap resolves', () => {
          const d = Promise.defer()
          const promise = d.promise
          let waited = false
          setTimeout(() => {
            waited = true
            d.fulfill()
          }, 1)

          return Promise.resolve()
            .bind(THIS)
            .tap(() => {
              return promise
            })
            .tap(function() {
              assert(waited)
              assert(this === THIS)
            })
        })
      })
    })

    describe('with timeout', () => {
      describe('this should refer to the bound object', () => {
        it('in straight-forward handler', () => {
          return Promise.resolve(3)
            .bind(THIS)
            .timeout(500)
            .then(function(v) {
              assert(v === 3)
              assert(this === THIS)
            })
        })
        it('in rejected handler', () => {
          return Promise.reject(3)
            .bind(THIS)
            .timeout(500)
            .then(assert.fail, function(v) {
              assert(v === 3)
              assert(this === THIS)
            })
        })

        it('in rejected handler after timeout', () => {
          return new Promise(() => {})
            .bind(THIS)
            .timeout(10)
            .caught(Promise.TimeoutError, function() {
              assert(this === THIS)
            })
        })
      })
    })

    describe('With catch filters', () => {
      describe('this should refer to the bound object', () => {
        it('in an immediately trapped catch handler', () => {
          return Promise.resolve()
            .bind(THIS)
            .then(function() {
              assert(THIS === this)
              let a
              a.b()
            })
            .caught(Error, function() {
              assert(THIS === this)
            })
        })
        it('in a later trapped catch handler', () => {
          return Promise.resolve()
            .bind(THIS)
            .then(() => {
              throw new CustomError1()
            })
            .caught(CustomError2, assert.fail)
            .caught(CustomError1, function() {
              assert(THIS === this)
            })
        })
      })
    })

    describe('With .get promises', () => {
      it('this should refer to the bound object', () => {
        return Promise.resolve({ key: 'value' })
          .bind(THIS)
          .get('key')
          .then(function(val) {
            assert(val === 'value')
            assert(this === THIS)
          })
      })
    })

    describe('With .call promises', () => {
      it('this should refer to the bound object', () => {
        return Promise.resolve({
          key() {
            return 'value'
          }
        })
          .bind(THIS)
          .call('key')
          .then(function(val) {
            assert(val === 'value')
            assert(this === THIS)
          })
      })
    })

    describe('With .done promises', () => {
      describe('this should refer to the bound object', () => {
        it('when rejected', () => {
          return Promise.reject()
            .bind(THIS)
            .done(assert.fail, function() {
              assert(this === THIS)
            })
        })
        it('when fulfilled', () => {
          return Promise.resolve()
            .bind(THIS)
            .done(function() {
              assert(this === THIS)
            })
        })
      })
    })

    describe('With .spread promises', () => {
      describe('this should refer to the bound object', () => {
        it('when spreading immediate array', () => {
          return Promise.resolve([1, 2, 3])
            .bind(THIS)
            .spread(function(a, b, c) {
              assert(c === 3)
              assert(this === THIS)
            })
        })
        it('when spreading eventual array', () => {
          const d = Promise.defer()
          const promise = d.promise

          setTimeout(() => {
            d.fulfill([1, 2, 3])
          }, 1)

          return promise.bind(THIS).spread(function(a, b, c) {
            assert(c === 3)
            assert(this === THIS)
          })
        })

        it('when spreading eventual array of eventual values', () => {
          const d = Promise.defer()
          const promise = d.promise
          setTimeout(() => {
            const d1 = Promise.defer()
            const p1 = d1.promise

            const d2 = Promise.defer()
            const p2 = d2.promise

            const d3 = Promise.defer()
            const p3 = d3.promise
            d.fulfill([p1, p2, p3])

            setTimeout(() => {
              d1.fulfill(1)
              d2.fulfill(2)
              d3.fulfill(3)
            }, 3)
          }, 1)
          return promise
            .bind(THIS)
            .all()
            .spread(function(a, b, c) {
              assert(c === 3)
              assert(this === THIS)
            })
        })
      })
    })

    describe('With map', () => {
      describe('this should refer to the bound object', () => {
        it('inside the mapper with immediate values', () => {
          return Promise.resolve([1, 2, 3])
            .bind(THIS)
            .map(function(v, i) {
              if (i === 2) {
                assert(this === THIS)
              }
              return v
            })
        })
        it('inside the mapper with eventual values', () => {
          const d1 = Promise.defer()
          const p1 = d1.promise

          const d2 = Promise.defer()
          const p2 = d2.promise

          const d3 = Promise.defer()
          const p3 = d3.promise

          setTimeout(() => {
            d1.fulfill(1)
            d2.fulfill(2)
            d3.fulfill(3)
          }, 1)

          return Promise.resolve([p1, p2, p3])
            .bind(THIS)
            .map(function(v, i) {
              if (i === 2) {
                assert(this === THIS)
              }
              return v
            })
        })

        it('after the mapper with immediate values', () => {
          return Promise.resolve([1, 2, 3])
            .bind(THIS)
            .map(() => {
              return 1
            })
            .then(function() {
              assert(this === THIS)
            })
        })

        it('after the mapper with eventual values', () => {
          const d1 = Promise.defer()
          const p1 = d1.promise

          const d2 = Promise.defer()
          const p2 = d2.promise

          const d3 = Promise.defer()
          const p3 = d3.promise

          setTimeout(() => {
            d1.fulfill(1)
            d2.fulfill(2)
            d3.fulfill(3)
          }, 1)

          return Promise.resolve([p1, p2, p3])
            .bind(THIS)
            .map(() => {
              return 1
            })
            .then(function() {
              assert(this === THIS)
            })
        })

        it('after the mapper with immediate values when the map returns promises', () => {
          const d1 = Promise.defer()
          const p1 = d1.promise

          setTimeout(() => {
            d1.fulfill(1)
          }, 1)

          return Promise.resolve([1, 2, 3])
            .bind(THIS)
            .map(() => {
              return p1
            })
            .then(function() {
              assert(this === THIS)
            })
        })
      })

      describe('this should not refer to the bound object', () => {
        it('in the promises created within the handler', () => {
          const d1 = Promise.defer()
          const p1 = d1.promise

          setTimeout(() => {
            d1.fulfill(1)
          }, 1)

          return Promise.resolve([1, 2, 3])
            .bind(THIS)
            .map(() => {
              return p1.then(function() {
                assert(this !== THIS)
                return 1
              })
            })
            .then(function() {
              assert(this === THIS)
            })
        })
      })
    })

    describe('With reduce', () => {
      describe('this should refer to the bound object', () => {
        it('inside the reducer with immediate values', () => {
          return Promise.resolve([1, 2, 3])
            .bind(THIS)
            .reduce(function(_prev, v, i) {
              if (i === 2) {
                assert(this === THIS)
              }
              return v
            })
        })
        it('inside the reducer with eventual values', () => {
          const d1 = Promise.defer()
          const p1 = d1.promise

          const d2 = Promise.defer()
          const p2 = d2.promise

          const d3 = Promise.defer()
          const p3 = d3.promise

          setTimeout(() => {
            d1.fulfill(1)
            d2.fulfill(2)
            d3.fulfill(3)
          }, 1)

          return Promise.resolve([p1, p2, p3])
            .bind(THIS)
            .reduce(function(_prev, _v, i) {
              if (i === 2) {
                assert(this === THIS)
              }
              return 0
            })
        })

        it('after the reducer with immediate values', () => {
          return Promise.resolve([1, 2, 3])
            .bind(THIS)
            .reduce(() => {
              return 1
            })
            .then(function() {
              assert(this === THIS)
            })
        })

        it('after the reducer with eventual values', () => {
          const d1 = Promise.defer()
          const p1 = d1.promise

          const d2 = Promise.defer()
          const p2 = d2.promise

          const d3 = Promise.defer()
          const p3 = d3.promise
          setTimeout(() => {
            d1.fulfill(1)
            d2.fulfill(2)
            d3.fulfill(3)
          }, 1)
          return Promise.resolve([p1, p2, p3])
            .bind(THIS)
            .reduce(() => {
              return 1
            })
            .then(function() {
              assert(this === THIS)
            })
        })

        it('after the reducer with immediate values when the reducer returns promise', () => {
          const d1 = Promise.defer()
          const p1 = d1.promise

          setTimeout(() => {
            d1.fulfill(1)
          }, 1)

          return Promise.resolve([1, 2, 3])
            .bind(THIS)
            .reduce(() => {
              return p1
            })
            .then(function() {
              assert(this === THIS)
            })
        })
      })

      describe('this should not refer to the bound object', () => {
        it('in the promises created within the handler', () => {
          const d1 = Promise.defer()
          const p1 = d1.promise

          setTimeout(() => {
            d1.fulfill(1)
          }, 1)

          return Promise.resolve([1, 2, 3])
            .bind(THIS)
            .reduce(() => {
              return p1.then(function() {
                assert(this !== THIS)
                return 1
              })
            })
            .then(function() {
              assert(this === THIS)
            })
        })
      })
    })

    describe('With filter', () => {
      describe('this should refer to the bound object', () => {
        it('inside the filterer with immediate values', () => {
          return Promise.resolve([1, 2, 3])
            .bind(THIS)
            .filter(function(v, i) {
              if (i === 2) {
                assert(this === THIS)
              }
              return v
            })
        })
        it('inside the filterer with eventual values', () => {
          const d1 = Promise.defer()
          const p1 = d1.promise

          const d2 = Promise.defer()
          const p2 = d2.promise

          const d3 = Promise.defer()
          const p3 = d3.promise

          setTimeout(() => {
            d1.fulfill(1)
            d2.fulfill(2)
            d3.fulfill(3)
          }, 1)

          return Promise.resolve([p1, p2, p3])
            .bind(THIS)
            .filter(function(v, i) {
              if (i === 2) {
                assert(this === THIS)
              }
              return v
            })
        })

        it('after the filterer with immediate values', () => {
          return Promise.resolve([1, 2, 3])
            .bind(THIS)
            .filter(() => {
              return 1
            })
            .then(function() {
              assert(this === THIS)
            })
        })

        it('after the filterer with eventual values', () => {
          const d1 = Promise.defer()
          const p1 = d1.promise

          const d2 = Promise.defer()
          const p2 = d2.promise

          const d3 = Promise.defer()
          const p3 = d3.promise

          setTimeout(() => {
            d1.fulfill(1)
            d2.fulfill(2)
            d3.fulfill(3)
          }, 1)

          return Promise.resolve([p1, p2, p3])
            .bind(THIS)
            .filter(() => {
              return 1
            })
            .then(function() {
              assert(this === THIS)
            })
        })

        it('after the filterer with immediate values when the filterer returns promises', () => {
          const d1 = Promise.defer()
          const p1 = d1.promise

          setTimeout(() => {
            d1.fulfill(1)
          }, 1)

          return Promise.resolve([1, 2, 3])
            .bind(THIS)
            .filter(() => {
              return p1
            })
            .then(function() {
              assert(this === THIS)
            })
        })
      })

      describe('this should not refer to the bound object', () => {
        it('in the promises created within the handler', () => {
          const d1 = Promise.defer()
          const p1 = d1.promise

          setTimeout(() => {
            d1.fulfill(1)
          }, 1)

          return Promise.resolve([1, 2, 3])
            .bind(THIS)
            .filter(() => {
              return p1.then(function() {
                assert(this !== THIS)
                return 1
              })
            })
            .then(function() {
              assert(this === THIS)
            })
        })
      })
    })

    describe('With all', () => {
      describe('this should refer to the bound object', () => {
        it('after all with immediate values', () => {
          return Promise.resolve([1, 2, 3])
            .bind(THIS)
            .all()
            .then(function(v) {
              assert(v.length === 3)
              assert(this === THIS)
            })
        })
        it('after all with eventual values', () => {
          const d1 = Promise.defer()
          const p1 = d1.promise

          const d2 = Promise.defer()
          const p2 = d2.promise

          const d3 = Promise.defer()
          const p3 = d3.promise

          setTimeout(() => {
            d1.fulfill(1)
            d2.fulfill(2)
            d3.fulfill(3)
          }, 1)

          return Promise.resolve([p1, p2, p3])
            .bind(THIS)
            .all()
            .then(function(v) {
              assert(v.length === 3)
              assert(this === THIS)
            })
        })
      })

      describe('this should not refer to the bound object', () => {
        it('in the promises created within the handler', () => {
          const d1 = Promise.defer()
          const p1 = d1.promise

          setTimeout(() => {
            d1.fulfill(1)
          }, 1)

          return Promise.resolve([1, 2, 3])
            .bind(THIS)
            .filter(() => {
              return Promise.all([p1]).then(function() {
                assert(this !== THIS)
                return 1
              })
            })
            .then(function() {
              assert(this === THIS)
            })
        })
      })
    })

    describe('With any', () => {
      describe('this should refer to the bound object', () => {
        it('after any with immediate values', () => {
          Promise.resolve([1, 2, 3])
            .bind(THIS)
            .any()
            .then(function(v) {
              assert(v === 1)
              assert(this === THIS)
            })
        })
        it('after any with eventual values', () => {
          const d1 = Promise.defer()
          const p1 = d1.promise

          const d2 = Promise.defer()
          const p2 = d2.promise

          const d3 = Promise.defer()
          const p3 = d3.promise

          setTimeout(() => {
            d1.fulfill(1)
            d2.fulfill(2)
            d3.fulfill(3)
          }, 1)

          return Promise.resolve([p1, p2, p3])
            .bind(THIS)
            .any()
            .then(function(v) {
              assert(v === 1)
              assert(this === THIS)
            })
        })
      })

      describe('this should not refer to the bound object', () => {
        it('in the promises created within the handler', () => {
          const d1 = Promise.defer()
          const p1 = d1.promise

          setTimeout(() => {
            d1.fulfill(1)
          }, 1)

          return Promise.resolve([1, 2, 3])
            .bind(THIS)
            .filter(() => {
              return Promise.any([p1]).then(function() {
                assert(this !== THIS)
                return 1
              })
            })
            .then(function() {
              assert(this === THIS)
            })
        })
      })
    })

    describe('With race', () => {
      describe('this should refer to the bound object', () => {
        it('after race with immediate values', () => {
          Promise.resolve([1, 2, 3])
            .bind(THIS)
            .race()
            .then(function(v) {
              assert(v === 1)
              assert(this === THIS)
            })
        })
        it('after race with eventual values', () => {
          const d1 = Promise.defer()
          const p1 = d1.promise

          const d2 = Promise.defer()
          const p2 = d2.promise

          const d3 = Promise.defer()
          const p3 = d3.promise

          setTimeout(() => {
            d1.fulfill(1)
            d2.fulfill(2)
            d3.fulfill(3)
          }, 1)

          return Promise.resolve([p1, p2, p3])
            .bind(THIS)
            .race()
            .then(function(v) {
              assert(v === 1)
              assert(this === THIS)
            })
        })
      })

      describe('this should not refer to the bound object', () => {
        it('in the promises created within the handler', () => {
          const d1 = Promise.defer()
          const p1 = d1.promise

          setTimeout(() => {
            d1.fulfill(1)
          }, 1)

          return Promise.resolve([1, 2, 3])
            .bind(THIS)
            .filter(() => {
              return Promise.race([p1]).then(function() {
                assert(this !== THIS)
                return 1
              })
            })
            .then(function() {
              assert(this === THIS)
            })
        })
      })
    })

    describe('With delay', () => {
      describe('this should refer to the bound object', () => {
        it('after race with immediate values', () => {
          Promise.resolve([1, 2, 3])
            .bind(THIS)
            .delay(1)
            .then(function(v) {
              assert(v[0] === 1)
              assert(this === THIS)
            })
        })
        it('after race with eventual values', () => {
          const d1 = Promise.defer()
          const p1 = d1.promise

          const d2 = Promise.defer()
          const p2 = d2.promise

          const d3 = Promise.defer()
          const p3 = d3.promise

          setTimeout(() => {
            d1.fulfill(1)
            d2.fulfill(2)
            d3.fulfill(3)
          }, 1)

          return Promise.resolve([p1, p2, p3])
            .bind(THIS)
            .delay(1)
            .all()
            .then(function(v) {
              assert(v[0] === 1)
              assert(this === THIS)
            })
        })
      })

      describe('this should not refer to the bound object', () => {
        it('in the promises created within the handler', () => {
          const d1 = Promise.defer()

          setTimeout(() => {
            d1.fulfill(1)
          }, 1)

          return Promise.resolve([1, 2, 3])
            .delay(1)
            .bind(THIS)
            .delay(1)
            .filter(function() {
              assert(this === THIS)
              return Promise.delay(1).then(function() {
                assert(this !== THIS)
                return 1
              })
            })
            .then(function() {
              assert(this === THIS)
            })
        })
      })
    })

    describe('With settle', () => {
      describe('this should refer to the bound object', () => {
        it('after settle with immediate values', () => {
          return Promise.resolve([1, 2, 3])
            .bind(THIS)
            .settle()
            .then(function(v) {
              assert(v.length === 3)
              assert(this === THIS)
            })
        })
        it('after settle with eventual values', () => {
          const d1 = Promise.defer()
          const p1 = d1.promise

          const d2 = Promise.defer()
          const p2 = d2.promise

          const d3 = Promise.defer()
          const p3 = d3.promise

          setTimeout(() => {
            d1.fulfill(1)
            d2.fulfill(2)
            d3.fulfill(3)
          }, 1)

          return Promise.resolve([p1, p2, p3])
            .bind(THIS)
            .settle()
            .then(function(v) {
              assert(v.length === 3)
              assert(this === THIS)
            })
        })
      })

      describe('this should not refer to the bound object', () => {
        it('in the promises created within the handler', () => {
          const d1 = Promise.defer()
          const p1 = d1.promise

          setTimeout(() => {
            d1.fulfill(1)
          }, 1)

          return Promise.resolve([1, 2, 3])
            .bind(THIS)
            .filter(() => {
              return Promise.settle([p1]).then(function() {
                assert(this !== THIS)
                return 1
              })
            })
            .then(function() {
              assert(this === THIS)
            })
        })
      })
    })

    describe('With some', () => {
      describe('this should refer to the bound object', () => {
        it('after some with immediate values', () => {
          return Promise.resolve([1, 2, 3])
            .bind(THIS)
            .some(2)
            .then(function(v) {
              expect(v).to.deep.equal([1, 2])
              assert(this === THIS)
            })
        })
        it('after some with eventual values', () => {
          const d1 = Promise.defer()
          const p1 = d1.promise

          const d2 = Promise.defer()
          const p2 = d2.promise

          const d3 = Promise.defer()
          const p3 = d3.promise

          setTimeout(() => {
            d1.fulfill(1)
            d2.fulfill(2)
            d3.fulfill(3)
          }, 1)

          return Promise.resolve([p1, p2, p3])
            .bind(THIS)
            .some(2)
            .then(function(v) {
              assert.deepEqual(v, [1, 2])
              assert(this === THIS)
            })
        })

        it('after some with eventual array for eventual values', () => {
          const d1 = Promise.defer()
          const p1 = d1.promise

          const d2 = Promise.defer()
          const p2 = d2.promise

          const d3 = Promise.defer()
          const p3 = d3.promise

          const dArray = Promise.defer()
          const arrayPromise = dArray.promise

          setTimeout(() => {
            dArray.fulfill([p1, p2, p3])
            setTimeout(() => {
              d1.fulfill(1)
              d2.fulfill(2)
              d3.fulfill(3)
            }, 1)
          }, 1)

          return arrayPromise
            .bind(THIS)
            .some(2)
            .then(function(v) {
              assert.deepEqual(v, [1, 2])
              assert(this === THIS)
            })
        })
      })

      describe('this should not refer to the bound object', () => {
        it('in the promises created within the handler', () => {
          const d1 = Promise.defer()
          const p1 = d1.promise

          setTimeout(() => {
            d1.fulfill(1)
          }, 1)

          return Promise.resolve([1, 2, 3])
            .bind(THIS)
            .filter(() => {
              return Promise.some([p1], 1).then(function() {
                assert(this !== THIS)
                return 1
              })
            })
            .then(function() {
              assert(this === THIS)
            })
        })
      })
    })

    describe('With props', () => {
      describe('this should refer to the bound object', () => {
        it('after props with immediate values', () => {
          return Promise.resolve([1, 2, 3])
            .bind(THIS)
            .props()
            .then(function(v) {
              assert(v[2] === 3)
              assert(this === THIS)
            })
        })
        it('after props with eventual values', () => {
          const d1 = Promise.defer()
          const p1 = d1.promise

          const d2 = Promise.defer()
          const p2 = d2.promise

          const d3 = Promise.defer()
          const p3 = d3.promise

          setTimeout(() => {
            d1.fulfill(1)
            d2.fulfill(2)
            d3.fulfill(3)
          }, 1)

          return Promise.resolve([p1, p2, p3])
            .bind(THIS)
            .props()
            .then(function(v) {
              assert(v[2] === 3)
              assert(this === THIS)
            })
        })
      })

      describe('this should not refer to the bound object', () => {
        it('in the promises created within the handler', () => {
          const d1 = Promise.defer()
          const p1 = d1.promise
          setTimeout(() => {
            d1.fulfill(1)
          }, 1)
          return Promise.resolve([1, 2, 3])
            .bind(THIS)
            .props(() => {
              return Promise.settle([p1]).then(function() {
                assert(this !== THIS)
                return 1
              })
            })
            .then(function() {
              assert(this === THIS)
            })
        })
      })
    })
  })

  describe('When using .bind to gratuitously rebind', () => {
    const a = { value: 1 }
    const b = { value: 2 }
    const c = { value: 3 }

    function makeTest(xa, xb, xc) {
      return function() {
        return Promise.bind(xa)
          .then(function() {
            assert(this.value === 1)
          })
          .bind(xb)
          .then(function() {
            assert(this.value === 2)
          })
          .bind(xc)
          .then(function() {
            assert(this.value === 3)
          })
      }
    }

    it('should not get confused immediately', makeTest(a, b, c))
    it(
      'should not get confused immediate thenable',
      makeTest(immediateThenableOf(a), immediateThenableOf(b), immediateThenableOf(c))
    )
    it(
      'should not get confused immediate promise',
      makeTest(immediatePromiseOf(a), immediatePromiseOf(b), immediatePromiseOf(c))
    )
    it('should not get confused timed thenable', makeTest(timedThenableOf(a), timedThenableOf(b), timedThenableOf(c)))
    it('should not get confused timed promise', makeTest(timedPromiseOf(a), timedPromiseOf(b), timedPromiseOf(c)))
  })

  describe('Promised thisArg', () => {
    const e = { value: 1 }

    it('basic case, this first', done => {
      const thisPromise = Promise.delay(1, 1)
      const promise = thisPromise.delay(1).thenReturn(2)
      promise.bind(thisPromise).then(function(val) {
        assert(+this === 1)
        assert(+val === 2)
        done()
      })
    })

    it('bound value is not changed by returned promise', () => {
      return Promise.resolve()
        .then(() => {
          return new Promise(resolve => {
            resolve()
          })
            .bind(THIS)
            .then(() => {})
        })
        .then(function() {
          assert.strictEqual(this, defaultThis)
        })
    })

    it('basic case, main promise first', () => {
      const promise = Promise.delay(1, 2)
      const thisPromise = promise.thenReturn(1)
      return promise.bind(thisPromise).then(function(val) {
        assert.strictEqual(+this, 1)
        assert.strictEqual(+val, 2)
      })
    })

    it('both reject, this rejects first', done => {
      const e1 = new Error()
      const e2 = new Error()
      const thisPromise = Promise.delay(1, 0).thenThrow(e1)
      const promise = Promise.delay(2, 56).thenThrow(e2)
      promise.bind(thisPromise).then(null, function(reason) {
        assert(this === defaultThis)
        assert(reason === e1)
        done()
      })
    })

    it('both reject, main promise rejects first', done => {
      const e1 = new Error('first')
      const e2 = new Error('second')
      const thisPromise = Promise.delay(56, 1).thenThrow(e1)
      const promise = Promise.delay(2, 0).thenThrow(e2)
      promise.bind(thisPromise).then(null, function(reason) {
        assert(this === defaultThis)
        assert(reason === e2)
        done()
      })
    })

    it('Immediate value waits for deferred this', () => {
      const t = Promise.delay(1, THIS)
      const t2 = {}
      return Promise.resolve(t2)
        .bind(t)
        .then(function(value) {
          assert.strictEqual(this, THIS)
          assert.strictEqual(t2, value)
        })
    })

    it('Immediate error waits for deferred this', () => {
      const t = Promise.delay(1, THIS)
      const error = new Error()
      return Promise.reject(error)
        .bind(t)
        .then(assert.fail, function(err) {
          assert.strictEqual(this, THIS)
          assert.strictEqual(error, err)
        })
    })

    function makeThisArgRejectedTest(reason) {
      return function() {
        return Promise.bind(reason()).then(assert.fail, function(err) {
          assert(this === defaultThis)
          assert(err.value === 1)
        })
      }
    }

    it(
      'if thisArg is rejected timed promise, returned promise is rejected',
      makeThisArgRejectedTest(() => {
        return timedRejectedPromiseOf(e)
      })
    )
    it(
      'if thisArg is rejected immediate promise, returned promise is rejected',
      makeThisArgRejectedTest(() => {
        return immediateRejectedPromiseOf(e)
      })
    )
    it(
      'if thisArg is rejected timed thenable, returned promise is rejected',
      makeThisArgRejectedTest(() => {
        return timedRejectedThenableOf(e)
      })
    )
    it(
      'if thisArg is rejected immediate thenable, returned promise is rejected',
      makeThisArgRejectedTest(() => {
        return immediateRejectedThenableOf(e)
      })
    )

    function makeThisArgRejectedTestMethod(reason) {
      return function() {
        return Promise.resolve()
          .bind(reason())
          .then(assert.fail, function(err) {
            assert(this === defaultThis)
            assert(err.value === 1)
          })
      }
    }

    it(
      'if thisArg is rejected timed promise, returned promise is rejected',
      makeThisArgRejectedTestMethod(() => {
        return timedRejectedPromiseOf(e)
      })
    )
    it(
      'if thisArg is rejected immediate promise, returned promise is rejected',
      makeThisArgRejectedTestMethod(() => {
        return immediateRejectedPromiseOf(e)
      })
    )
    it(
      'if thisArg is rejected timed thenable, returned promise is rejected',
      makeThisArgRejectedTestMethod(() => {
        return timedRejectedThenableOf(e)
      })
    )
    it(
      'if thisArg is rejected immediate thenable, returned promise is rejected',
      makeThisArgRejectedTestMethod(() => {
        return immediateRejectedThenableOf(e)
      })
    )
  })

  describe('github issue', () => {
    it('gh-426', () => {
      return Promise.all([Promise.delay(10)])
        .bind(THIS)
        .spread(function() {
          assert.equal(this, THIS)
        })
    })

    it('gh-702-1', () => {
      return Promise.bind(Promise.delay(1, THIS))
        .then(function() {
          assert.equal(this, THIS)
        })
        .then(function() {
          assert.equal(this, THIS)
        })
    })

    it('gh-702-2', () => {
      return Promise.resolve()
        .bind(Promise.delay(1, THIS))
        .then(function() {
          assert.equal(this, THIS)
        })
        .then(function() {
          assert.equal(this, THIS)
        })
    })
  })

  describe('promised bind', () => {
    it('works after following', () => {
      return Promise.bind(Promise.delay(1, THIS))
        .then(function() {
          assert.equal(this, THIS)
          return Promise.delay(1)
        })
        .then(function() {
          assert.equal(this, THIS)
          return Promise.delay(1)
        })
        .then(function() {
          assert.equal(this, THIS)
        })
    })

    it('works with spread', () => {
      return Promise.bind(Promise.delay(1, THIS), [1, 2, 3])
        .spread(function(...args) {
          assert.equal(this, THIS)
          expect(args).to.deep.equal([1, 2, 3])
          return Promise.delay(1, args)
        })
        .spread(function(...args) {
          expect(args).to.deep.equal([1, 2, 3])
          assert.equal(this, THIS)
          return Promise.delay(1, args)
        })
        .spread(function(...args) {
          expect(args).to.deep.equal([1, 2, 3])
          assert.equal(this, THIS)
        })
    })

    it('works with immediate finally', () => {
      return Promise.bind(Promise.delay(1, THIS), [1, 2, 3])
        .lastly(function() {
          assert.equal(this, THIS)
        })
        .then(function() {
          assert.equal(this, THIS)
        })
    })

    it('works with delayed finally', () => {
      return Promise.bind(Promise.delay(1, THIS), [1, 2, 3])
        .lastly(function() {
          assert.equal(this, THIS)
          return Promise.delay(1)
        })
        .then(function() {
          assert.equal(this, THIS)
        })
    })

    it('works with immediate tap', () => {
      return Promise.bind(Promise.delay(1, THIS), [1, 2, 3])
        .tap(function() {
          assert.equal(this, THIS)
        })
        .then(function() {
          assert.equal(this, THIS)
        })
    })

    it('works with delayed tap', () => {
      return Promise.bind(Promise.delay(1, THIS), [1, 2, 3])
        .tap(function() {
          assert.equal(this, THIS)
          return Promise.delay(1)
        })
        .then(function() {
          assert.equal(this, THIS)
        })
    })
  })
})
