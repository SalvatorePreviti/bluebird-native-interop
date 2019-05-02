// Based on Bluebird tests (MIT License). see https://github.com/petkaantonov/bluebird and http://bluebirdjs.com and LICENSE file

const { expect } = require('chai')
const Bluebird = require('bluebird')

describe('Promise static', () => {
  describe('bluebirdifyPromiseClass', () => {
    it('is defined both in Bluebird and in Promise', () => {
      expect(typeof Promise.bluebirdifyPromiseClass).to.equal('function')
      expect(Bluebird.bluebirdifyPromiseClass).to.equal(Promise.bluebirdifyPromiseClass)
    })

    it('can bluebirdify a promiselike class', () => {
      class DummyPromise {
        then() {}
      }

      const x = Promise.bluebirdifyPromiseClass(DummyPromise)
      expect(x).to.equal(DummyPromise)
      expect(typeof x.prototype.catch).to.equal('function')
    })
  })

  describe('is', () => {
    it('returns true for bluebird', () => {
      expect(Promise.is(Bluebird.resolve())).to.equal(true)
    })

    it('returns true for target class', () => {
      expect(Promise.is(new Promise(resolve => resolve()))).to.equal(true)
    })

    it('returns true for random object', () => {
      expect(Promise.is(() => {})).to.equal(false)
    })
  })

  it('has cast', () => {
    expect(Promise.cast).to.equal(Promise.resolve)
  })

  describe('defer', () => {
    it('returns a new deferred', () => {
      const deferred = Promise.defer()
      expect(deferred.promise).to.be.an.instanceOf(Promise)
      expect(typeof deferred.resolve).to.equal('function')
      expect(typeof deferred.reject).to.equal('function')
      expect(typeof deferred.fulfill).to.equal('function')
    })

    it('can resolve', () => {
      const deferred = Promise.defer()
      const promise = deferred.promise.then(x => {
        expect(x).to.equal(123)
      })
      deferred.resolve(123)
      return promise
    })

    it('can reject', () => {
      const deferred = Promise.defer()
      const promise = deferred.promise.then(
        () => Promise.reject('failure'),
        x => {
          expect(x).to.equal('rejected')
        }
      )
      deferred.reject('rejected')
      return promise
    })
  })

  it('has all', () => {
    expect(Promise.all).to.equal(Promise.all)
  })

  it('has race', () => {
    expect(Promise.race).to.equal(Promise.race)
  })

  it('has reject', () => {
    expect(Promise.reject).to.equal(Promise.reject)
  })

  it('has rejected', () => {
    expect(Promise.rejected).to.equal(Promise.reject)
  })

  it('has resolve', () => {
    expect(Promise.resolve).to.equal(Promise.resolve)
  })

  it('has fulfilled', () => {
    expect(Promise.fulfilled).to.equal(Promise.resolve)
  })

  it('has Promise', () => {
    expect(Promise.Promise).to.equal(Promise)
    expect(Object.getOwnPropertyDescriptor(Promise, 'Promise').enumerable).to.equal(false)
  })

  describe('copied functions', () => {
    it('has AggregateError', () => {
      expect(Promise.AggregateError).to.equal(Bluebird.AggregateError)
      expect(!!Promise.AggregateError.name).to.equal(true)
    })
    it('has CancellationError', () => {
      expect(Promise.CancellationError).to.equal(Bluebird.CancellationError)
      expect(!!Promise.CancellationError.name).to.equal(true)
    })
    it('has OperationalError', () => {
      expect(Promise.OperationalError).to.equal(Bluebird.OperationalError)
      expect(!!Promise.OperationalError.name).to.equal(true)
    })
    it('has PromiseInspection', () => {
      expect(Promise.PromiseInspection).to.equal(Bluebird.PromiseInspection)
      expect(!!Promise.PromiseInspection.name).to.equal(true)
    })
    it('has RangeError', () => {
      expect(Promise.RangeError).to.equal(Bluebird.RangeError)
      expect(!!Promise.RangeError.name).to.equal(true)
    })
    it('has RejectionError', () => {
      expect(Promise.RejectionError).to.equal(Bluebird.RejectionError)
      expect(!!Promise.RejectionError.name).to.equal(true)
    })
    it('has TimeoutError', () => {
      expect(Promise.TimeoutError).to.equal(Bluebird.TimeoutError)
      expect(!!Promise.TimeoutError.name).to.equal(true)
    })
    it('has TypeError', () => {
      expect(Promise.TypeError).to.equal(Bluebird.TypeError)
      expect(!!Promise.TypeError.name).to.equal(true)
    })
    it('has any', () => {
      expect(Promise.any).to.equal(Bluebird.any)
      expect(!!Promise.any.name).to.equal(true)
    })
    it('has attempt', () => {
      expect(Promise.attempt).to.equal(Bluebird.attempt)
      expect(!!Promise.attempt.name).to.equal(true)
    })
    it('has bind', () => {
      expect(Promise.bind).to.equal(Bluebird.bind)
      expect(!!Promise.bind.name).to.equal(true)
    })
    it('has config', () => {
      expect(Promise.config).to.equal(Bluebird.config)
      expect(!!Promise.config.name).to.equal(true)
    })
    it('has coroutine', () => {
      expect(Promise.coroutine).to.equal(Bluebird.coroutine)
      expect(!!Promise.coroutine.name).to.equal(true)
    })
    it('has delay', () => {
      expect(Promise.delay).to.equal(Bluebird.delay)
      expect(!!Promise.delay.name).to.equal(true)
    })
    it('has filter', () => {
      expect(Promise.filter).to.equal(Bluebird.filter)
      expect(!!Promise.filter.name).to.equal(true)
    })
    it('has fromCallback', () => {
      expect(Promise.fromCallback).to.equal(Bluebird.fromCallback)
      expect(!!Promise.fromCallback.name).to.equal(true)
    })
    it('has fromNode', () => {
      expect(Promise.fromNode).to.equal(Bluebird.fromNode)
      expect(!!Promise.fromNode.name).to.equal(true)
    })
    it('has getNewLibraryCopy', () => {
      expect(Promise.getNewLibraryCopy).to.equal(Bluebird.getNewLibraryCopy)
      expect(!!Promise.getNewLibraryCopy.name).to.equal(true)
    })
    it('has hasLongStackTraces', () => {
      expect(Promise.hasLongStackTraces).to.equal(Bluebird.hasLongStackTraces)
      expect(!!Promise.hasLongStackTraces.name).to.equal(true)
    })
    it('has join', () => {
      expect(Promise.join).to.equal(Bluebird.join)
      expect(!!Promise.join.name).to.equal(true)
    })
    it('has longStackTraces', () => {
      expect(Promise.longStackTraces).to.equal(Bluebird.longStackTraces)
      expect(!!Promise.longStackTraces.name).to.equal(true)
    })
    it('has map', () => {
      expect(Promise.map).to.equal(Bluebird.map)
      expect(!!Promise.map.name).to.equal(true)
    })
    it('has method', () => {
      expect(Promise.method).to.equal(Bluebird.method)
      expect(!!Promise.method.name).to.equal(true)
    })
    it('has noConflict', () => {
      expect(Promise.noConflict).to.equal(Bluebird.noConflict)
      expect(!!Promise.noConflict.name).to.equal(true)
    })
    it('has onPossiblyUnhandledRejection', () => {
      expect(Promise.onPossiblyUnhandledRejection).to.equal(Bluebird.onPossiblyUnhandledRejection)
      expect(!!Promise.onPossiblyUnhandledRejection.name).to.equal(true)
    })
    it('has onUnhandledRejectionHandled', () => {
      expect(Promise.onUnhandledRejectionHandled).to.equal(Bluebird.onUnhandledRejectionHandled)
      expect(!!Promise.onUnhandledRejectionHandled.name).to.equal(true)
    })
    it('has promisify', () => {
      expect(Promise.promisify).to.equal(Bluebird.promisify)
      expect(!!Promise.promisify.name).to.equal(true)
    })
    it('has promisifyAll', () => {
      expect(Promise.promisifyAll).to.equal(Bluebird.promisifyAll)
      expect(!!Promise.promisifyAll.name).to.equal(true)
    })
    it('has props', () => {
      expect(Promise.props).to.equal(Bluebird.props)
      expect(!!Promise.props.name).to.equal(true)
    })
    it('has reduce', () => {
      expect(Promise.reduce).to.equal(Bluebird.reduce)
      expect(!!Promise.reduce.name).to.equal(true)
    })
    it('has setScheduler', () => {
      expect(Promise.setScheduler).to.equal(Bluebird.setScheduler)
      expect(!!Promise.setScheduler.name).to.equal(true)
    })
    it('has settle', () => {
      expect(Promise.settle).to.equal(Bluebird.settle)
      expect(!!Promise.settle.name).to.equal(true)
    })
    it('has some', () => {
      expect(Promise.some).to.equal(Bluebird.some)
      expect(!!Promise.some.name).to.equal(true)
    })
    it('has spawn', () => {
      expect(Promise.spawn).to.equal(Bluebird.spawn)
      expect(!!Promise.spawn.name).to.equal(true)
    })
    it('has using', () => {
      expect(Promise.using).to.equal(Bluebird.using)
      expect(!!Promise.using.name).to.equal(true)
    })
    it('has version', () => {
      expect(Promise.version).to.equal(Bluebird.version)
    })
  })
})
