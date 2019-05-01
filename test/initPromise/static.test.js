const { expect } = require('chai')
const Bluebird = require('bluebird')

describe('initPromise static', () => {
  describe('is', () => {
    it('is not enumerable', () => {
      expect(Object.getOwnPropertyDescriptor(Promise, 'is').enumerable).to.equal(false)
    })

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
      expect(Object.getOwnPropertyDescriptor(Promise, 'AggregateError').enumerable).to.equal(false)
      expect(!!Promise.AggregateError.name).to.equal(true)
    })
    it('has CancellationError', () => {
      expect(Promise.CancellationError).to.equal(Bluebird.CancellationError)
      expect(Object.getOwnPropertyDescriptor(Promise, 'CancellationError').enumerable).to.equal(false)
      expect(!!Promise.CancellationError.name).to.equal(true)
    })
    it('has OperationalError', () => {
      expect(Promise.OperationalError).to.equal(Bluebird.OperationalError)
      expect(Object.getOwnPropertyDescriptor(Promise, 'OperationalError').enumerable).to.equal(false)
      expect(!!Promise.OperationalError.name).to.equal(true)
    })
    it('has PromiseInspection', () => {
      expect(Promise.PromiseInspection).to.equal(Bluebird.PromiseInspection)
      expect(Object.getOwnPropertyDescriptor(Promise, 'PromiseInspection').enumerable).to.equal(false)
      expect(!!Promise.PromiseInspection.name).to.equal(true)
    })
    it('has RangeError', () => {
      expect(Promise.RangeError).to.equal(Bluebird.RangeError)
      expect(Object.getOwnPropertyDescriptor(Promise, 'RangeError').enumerable).to.equal(false)
      expect(!!Promise.RangeError.name).to.equal(true)
    })
    it('has RejectionError', () => {
      expect(Promise.RejectionError).to.equal(Bluebird.RejectionError)
      expect(Object.getOwnPropertyDescriptor(Promise, 'RejectionError').enumerable).to.equal(false)
      expect(!!Promise.RejectionError.name).to.equal(true)
    })
    it('has TimeoutError', () => {
      expect(Promise.TimeoutError).to.equal(Bluebird.TimeoutError)
      expect(Object.getOwnPropertyDescriptor(Promise, 'TimeoutError').enumerable).to.equal(false)
      expect(!!Promise.TimeoutError.name).to.equal(true)
    })
    it('has TypeError', () => {
      expect(Promise.TypeError).to.equal(Bluebird.TypeError)
      expect(Object.getOwnPropertyDescriptor(Promise, 'TypeError').enumerable).to.equal(false)
      expect(!!Promise.TypeError.name).to.equal(true)
    })
    it('has any', () => {
      expect(Promise.any).to.equal(Bluebird.any)
      expect(Object.getOwnPropertyDescriptor(Promise, 'any').enumerable).to.equal(false)
      expect(!!Promise.any.name).to.equal(true)
    })
    it('has attempt', () => {
      expect(Promise.attempt).to.equal(Bluebird.attempt)
      expect(Object.getOwnPropertyDescriptor(Promise, 'attempt').enumerable).to.equal(false)
      expect(!!Promise.attempt.name).to.equal(true)
    })
    it('has bind', () => {
      expect(Promise.bind).to.equal(Bluebird.bind)
      expect(Object.getOwnPropertyDescriptor(Promise, 'bind').enumerable).to.equal(false)
      expect(!!Promise.bind.name).to.equal(true)
    })
    it('has cast', () => {
      expect(Promise.cast).to.equal(Bluebird.cast)
      expect(Object.getOwnPropertyDescriptor(Promise, 'cast').enumerable).to.equal(false)
      expect(!!Promise.cast.name).to.equal(true)
    })
    it('has config', () => {
      expect(Promise.config).to.equal(Bluebird.config)
      expect(Object.getOwnPropertyDescriptor(Promise, 'config').enumerable).to.equal(false)
      expect(!!Promise.config.name).to.equal(true)
    })
    it('has coroutine', () => {
      expect(Promise.coroutine).to.equal(Bluebird.coroutine)
      expect(Object.getOwnPropertyDescriptor(Promise, 'coroutine').enumerable).to.equal(false)
      expect(!!Promise.coroutine.name).to.equal(true)
    })
    it('has delay', () => {
      expect(Promise.delay).to.equal(Bluebird.delay)
      expect(Object.getOwnPropertyDescriptor(Promise, 'delay').enumerable).to.equal(false)
      expect(!!Promise.delay.name).to.equal(true)
    })
    it('has each', () => {
      expect(Promise.each).to.equal(Bluebird.each)
      expect(Object.getOwnPropertyDescriptor(Promise, 'each').enumerable).to.equal(false)
      expect(!!Promise.each.name).to.equal(true)
    })
    it('has filter', () => {
      expect(Promise.filter).to.equal(Bluebird.filter)
      expect(Object.getOwnPropertyDescriptor(Promise, 'filter').enumerable).to.equal(false)
      expect(!!Promise.filter.name).to.equal(true)
    })
    it('has fromCallback', () => {
      expect(Promise.fromCallback).to.equal(Bluebird.fromCallback)
      expect(Object.getOwnPropertyDescriptor(Promise, 'fromCallback').enumerable).to.equal(false)
      expect(!!Promise.fromCallback.name).to.equal(true)
    })
    it('has fromNode', () => {
      expect(Promise.fromNode).to.equal(Bluebird.fromNode)
      expect(Object.getOwnPropertyDescriptor(Promise, 'fromNode').enumerable).to.equal(false)
      expect(!!Promise.fromNode.name).to.equal(true)
    })
    it('has getNewLibraryCopy', () => {
      expect(Promise.getNewLibraryCopy).to.equal(Bluebird.getNewLibraryCopy)
      expect(Object.getOwnPropertyDescriptor(Promise, 'getNewLibraryCopy').enumerable).to.equal(false)
      expect(!!Promise.getNewLibraryCopy.name).to.equal(true)
    })
    it('has hasLongStackTraces', () => {
      expect(Promise.hasLongStackTraces).to.equal(Bluebird.hasLongStackTraces)
      expect(Object.getOwnPropertyDescriptor(Promise, 'hasLongStackTraces').enumerable).to.equal(false)
      expect(!!Promise.hasLongStackTraces.name).to.equal(true)
    })
    it('has join', () => {
      expect(Promise.join).to.equal(Bluebird.join)
      expect(Object.getOwnPropertyDescriptor(Promise, 'join').enumerable).to.equal(false)
      expect(!!Promise.join.name).to.equal(true)
    })
    it('has longStackTraces', () => {
      expect(Promise.longStackTraces).to.equal(Bluebird.longStackTraces)
      expect(Object.getOwnPropertyDescriptor(Promise, 'longStackTraces').enumerable).to.equal(false)
      expect(!!Promise.longStackTraces.name).to.equal(true)
    })
    it('has map', () => {
      expect(Promise.map).to.equal(Bluebird.map)
      expect(Object.getOwnPropertyDescriptor(Promise, 'map').enumerable).to.equal(false)
      expect(!!Promise.map.name).to.equal(true)
    })
    it('has mapSeries', () => {
      expect(Promise.mapSeries).to.equal(Bluebird.mapSeries)
      expect(Object.getOwnPropertyDescriptor(Promise, 'mapSeries').enumerable).to.equal(false)
      expect(!!Promise.mapSeries.name).to.equal(true)
    })
    it('has method', () => {
      expect(Promise.method).to.equal(Bluebird.method)
      expect(Object.getOwnPropertyDescriptor(Promise, 'method').enumerable).to.equal(false)
      expect(!!Promise.method.name).to.equal(true)
    })
    it('has noConflict', () => {
      expect(Promise.noConflict).to.equal(Bluebird.noConflict)
      expect(Object.getOwnPropertyDescriptor(Promise, 'noConflict').enumerable).to.equal(false)
      expect(!!Promise.noConflict.name).to.equal(true)
    })
    it('has onPossiblyUnhandledRejection', () => {
      expect(Promise.onPossiblyUnhandledRejection).to.equal(Bluebird.onPossiblyUnhandledRejection)
      expect(Object.getOwnPropertyDescriptor(Promise, 'onPossiblyUnhandledRejection').enumerable).to.equal(false)
      expect(!!Promise.onPossiblyUnhandledRejection.name).to.equal(true)
    })
    it('has onUnhandledRejectionHandled', () => {
      expect(Promise.onUnhandledRejectionHandled).to.equal(Bluebird.onUnhandledRejectionHandled)
      expect(Object.getOwnPropertyDescriptor(Promise, 'onUnhandledRejectionHandled').enumerable).to.equal(false)
      expect(!!Promise.onUnhandledRejectionHandled.name).to.equal(true)
    })
    it('has promisify', () => {
      expect(Promise.promisify).to.equal(Bluebird.promisify)
      expect(Object.getOwnPropertyDescriptor(Promise, 'promisify').enumerable).to.equal(false)
      expect(!!Promise.promisify.name).to.equal(true)
    })
    it('has promisifyAll', () => {
      expect(Promise.promisifyAll).to.equal(Bluebird.promisifyAll)
      expect(Object.getOwnPropertyDescriptor(Promise, 'promisifyAll').enumerable).to.equal(false)
      expect(!!Promise.promisifyAll.name).to.equal(true)
    })
    it('has props', () => {
      expect(Promise.props).to.equal(Bluebird.props)
      expect(Object.getOwnPropertyDescriptor(Promise, 'props').enumerable).to.equal(false)
      expect(!!Promise.props.name).to.equal(true)
    })
    it('has reduce', () => {
      expect(Promise.reduce).to.equal(Bluebird.reduce)
      expect(Object.getOwnPropertyDescriptor(Promise, 'reduce').enumerable).to.equal(false)
      expect(!!Promise.reduce.name).to.equal(true)
    })
    it('has setScheduler', () => {
      expect(Promise.setScheduler).to.equal(Bluebird.setScheduler)
      expect(Object.getOwnPropertyDescriptor(Promise, 'setScheduler').enumerable).to.equal(false)
      expect(!!Promise.setScheduler.name).to.equal(true)
    })
    it('has settle', () => {
      expect(Promise.settle).to.equal(Bluebird.settle)
      expect(Object.getOwnPropertyDescriptor(Promise, 'settle').enumerable).to.equal(false)
      expect(!!Promise.settle.name).to.equal(true)
    })
    it('has some', () => {
      expect(Promise.some).to.equal(Bluebird.some)
      expect(Object.getOwnPropertyDescriptor(Promise, 'some').enumerable).to.equal(false)
      expect(!!Promise.some.name).to.equal(true)
    })
    it('has spawn', () => {
      expect(Promise.spawn).to.equal(Bluebird.spawn)
      expect(Object.getOwnPropertyDescriptor(Promise, 'spawn').enumerable).to.equal(false)
      expect(!!Promise.spawn.name).to.equal(true)
    })
    it('has try', () => {
      expect(Promise.try).to.equal(Bluebird.try)
      expect(Object.getOwnPropertyDescriptor(Promise, 'try').enumerable).to.equal(false)
      expect(!!Promise.try.name).to.equal(true)
    })
    it('has using', () => {
      expect(Promise.using).to.equal(Bluebird.using)
      expect(Object.getOwnPropertyDescriptor(Promise, 'using').enumerable).to.equal(false)
      expect(!!Promise.using.name).to.equal(true)
    })
    it('has version', () => {
      expect(Promise.version).to.equal(Bluebird.version)
      expect(Object.getOwnPropertyDescriptor(Promise, 'version').enumerable).to.equal(false)
    })
  })
})
