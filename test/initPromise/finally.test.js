const { assert } = require('chai')

describe('finally', () => {
  const exception1 = new Error('boo!')
  const exception2 = new Promise.TypeError('evil!')

  describe('when nothing is passed', () => {
    it('should do nothing', () => {
      return Promise.resolve('foo')
        .lastly()
        .lastly()
        .lastly()
        .lastly()
        .then(val => {
          assert(val === 'foo')
        })
    })
  })

  describe('when the promise is fulfilled', () => {
    it('should call the callback', () => {
      let called = false

      return Promise.resolve('foo')
        .lastly(() => {
          called = true
        })
        .then(() => {
          assert.equal(called, true)
        })
    })

    it('should fulfill with the original value', () => {
      return Promise.resolve('foo')
        .lastly(() => {
          return 'bar'
        })
        .then(result => {
          assert.equal(result, 'foo')
        })
    })

    describe('when the callback returns a promise', () => {
      describe('that is fulfilled', () => {
        it('should fulfill with the original reason after that promise resolves', () => {
          const promise = Promise.delay(1)

          return Promise.resolve('foo')
            .lastly(() => {
              return promise
            })
            .then(result => {
              assert.equal(promise.isPending(), false)
              assert.equal(result, 'foo')
            })
        })
      })

      describe('that is rejected', () => {
        it('should reject with this new rejection reason', () => {
          return Promise.resolve('foo')
            .lastly(() => {
              return Promise.reject(exception1)
            })
            .then(
              () => {
                assert.equal(false, true)
              },
              exception => {
                assert.equal(exception, exception1)
              }
            )
        })
      })
    })

    describe('when the callback throws an exception', () => {
      it('should reject with this new exception', () => {
        return Promise.resolve('foo')
          .lastly(() => {
            throw exception1
          })
          .then(
            () => {
              assert.equal(false, true)
            },
            exception => {
              assert.equal(exception, exception1)
            }
          )
      })
    })
  })

  describe('when the promise is rejected', () => {
    it('should call the callback', () => {
      let called = false

      return Promise.reject(exception1)
        .lastly(() => {
          called = true
        })
        .then(
          () => {
            assert.fail()
          },
          () => {
            assert.equal(called, true)
          }
        )
    })

    it('should reject with the original reason', () => {
      return Promise.reject(exception1)
        .lastly(() => {
          return 'bar'
        })
        .then(
          () => {
            assert.equal(false, true)
          },
          exception => {
            assert.equal(exception, exception1)
          }
        )
    })

    describe('when the callback returns a promise', () => {
      describe('that is fulfilled', () => {
        it('should reject with the original reason after that promise resolves', () => {
          const promise = Promise.delay(1)

          return Promise.reject(exception1)
            .lastly(() => {
              return promise
            })
            .then(
              () => {
                assert.equal(false, true)
              },
              exception => {
                assert.equal(exception, exception1)
                assert.equal(promise.isPending(), false)
              }
            )
        })
      })

      describe('that is rejected', () => {
        it('should reject with the new reason', () => {
          return Promise.reject(exception1)
            .lastly(() => {
              return Promise.reject(exception2)
            })
            .then(
              () => {
                assert.equal(false, true)
              },
              exception => {
                assert.equal(exception, exception2)
              }
            )
        })
      })
    })

    describe('when the callback throws an exception', () => {
      it('should reject with this new exception', () => {
        return Promise.reject(exception1)
          .lastly(() => {
            throw exception2
          })
          .then(
            () => {
              assert.equal(false, true)
            },
            exception => {
              assert.equal(exception, exception2)
            }
          )
      })
    })
  })

  describe('when the callback returns a thenable', () => {
    describe('that will fulfill', () => {
      it('should reject with the original reason after that', () => {
        const promise = {
          then(fn) {
            setTimeout(() => {
              fn(15)
            }, 1)
          }
        }

        return Promise.reject(exception1)
          .lastly(() => {
            return promise
          })
          .then(
            () => {
              assert.equal(false, true)
            },
            exception => {
              assert.equal(exception, exception1)
            }
          )
      })
    })

    describe('that is rejected', () => {
      it('should reject with the new reason', () => {
        const promise = {
          then(f, fn) {
            setTimeout(() => {
              fn(exception2)
            }, 1)
          }
        }

        return Promise.reject(exception1)
          .lastly(() => {
            return promise
          })
          .then(
            () => {
              assert.equal(false, true)
            },
            exception => {
              assert.equal(exception, exception2)
            }
          )
      })
      it('should reject with the new primitive reason', () => {
        const primitive = 3
        const promise = {
          then(f, fn) {
            setTimeout(() => {
              fn(primitive)
            }, 1)
          }
        }

        return Promise.reject(exception1)
          .lastly(() => {
            return promise
          })
          .then(
            () => {
              assert.equal(false, true)
            },
            exception => {
              assert.strictEqual(exception, primitive)
            }
          )
      })
    })
  })
})
