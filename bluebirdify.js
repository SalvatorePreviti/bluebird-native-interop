'use strict'

const util = require('util')
const Bluebird = require('bluebird')

const newSymbol = typeof Symbol !== 'undefined' ? Symbol.for : name => `_${name}`

const toNativeSym = newSymbol('#toNativeSym')
const toBluebirdSym = newSymbol('#toBluebird')
const bluebirdifiedSym = newSymbol('#bluebirdified')
const promiseStatusSym = newSymbol('#promiseStatus')

const unhandledRejectionSuppressedSym = newSymbol('#unhandledRejectionSuppressed')
const unhandledRejectionSuppressedDef = { value: true, configurable: true, writable: true }

const empty = () => {}

const defineProperty =
  typeof Reflect !== 'undefined'
    ? Reflect.defineProperty
    : function defineProperty(target, key, def) {
        try {
          Object.defineProperty(target, key, def)
        } catch (_error) {}
      }

const getNodePromiseDetails = (() => {
  try {
    // We need to access process.binding('util').getPromiseDetails
    // to synchronously access the state of a native promise for compatibility with Bluebird.
    // process.binding is deprecated but still works for sure up to node > 12.0.0
    // When it gets removed, other solutions may be implemented.
    // eslint-disable-next-line node/no-deprecated-api
    return promise => {
      const r = process.binding('util').getPromiseDetails(promise)
      console.log('getNodePromiseDetails', r)
      return r
    }
  } catch (_error) {
    return undefined
  }
})()

const promiseDetails = promise => {
  let details = promise[promiseStatusSym]

  const wasUndefined = details === undefined
  if (wasUndefined) {
    details = [0, undefined]
    defineProperty(promise, promiseStatusSym, details)
  } else if (details[0] !== 0) {
    return details
  }

  const b = promise[toBluebirdSym]
  if (b !== undefined) {
    if (b.isFulfilled()) {
      details[0] = 1
      details[1] = b.value()
    } else if (b.isRejected()) {
      details[0] = 2
      details[1] = b.reason()
    }
  } else {
    const nodeDetails = getNodePromiseDetails && getNodePromiseDetails(promise)
    if (nodeDetails) {
      details[0] = nodeDetails[0]
      details[1] = nodeDetails[1]
    } else if (wasUndefined) {
      promise.then(
        v => {
          details[0] = 1
          details[1] = v
        },
        e => {
          details[0] = 2
          details[1] = e
        }
      )
    }
  }
  return details
}

const legacyPromiseDefer = Promise.defer

function initBluebird(BluebirdClass) {
  if (!('suppressUnhandledRejections' in BluebirdClass)) {
    BluebirdClass.suppressUnhandledRejections = bluebirdify.suppressUnhandledRejections
  }

  const bluebirdProto = BluebirdClass.prototype

  bluebirdProto.toBluebird = function toBluebird() {
    return this
  }

  bluebirdProto.toNative = function toNative() {
    let result = this[toNativeSym]
    if (result === undefined) {
      result = this.isPending()
        ? Promise.resolve(this)
        : this.isFulfilled()
        ? Promise.resolve(this.value())
        : Promise.reject(this.reason())
      defineProperty(this, toNativeSym, { value: result, configurable: true, writable: true })
    }
    return result
  }

  // eslint-disable-next-line node/no-unsupported-features/node-builtins
  const ispectCustomSym = util.inspect.custom || 'inspect'
  if (!(ispectCustomSym in bluebirdProto)) {
    bluebirdProto[ispectCustomSym] = bluebirdProto.toJSON
  }

  return BluebirdClass
}

function initPromise(Target) {
  if (!('is' in Target)) {
    Target.is = bluebirdify.is
  }

  if (!('suppressUnhandledRejections' in Target)) {
    Target.suppressUnhandledRejections = bluebirdify.suppressUnhandledRejections
  }

  if (!('Bluebird' in Target)) {
    defineProperty(Target, 'Bluebird', { value: Bluebird, configurable: true, writable: true })
  }

  if (!('Promise' in Target)) {
    defineProperty(Target, 'Promise', { value: Target, configurable: true, writable: true })
  }

  if (!('Promise' in Target)) {
    defineProperty(Target, 'Promise', { value: Target, configurable: true, writable: true })
  }

  if (!('bind' in Target) || Target.bind === Function.bind) {
    Target.bind = Bluebird.bind
  }

  if (!('defer' in Target) || Target.defer === legacyPromiseDefer) {
    Target.defer = function defer() {
      const proto = this === 'function' && this.prototype
      const Type = typeof proto === Target || proto instanceof Target ? this : Target
      const ret = {}
      ret.promise = new Type((resolve, reject) => {
        ret.resolve = resolve
        ret.reject = reject
        ret.fulfill = resolve
      })
      return ret
    }
  }

  if (!('pending' in Target)) {
    Target.pending = Target.defer
  }

  if (!('rejected' in Target)) {
    Target.rejected = Target.reject
  }

  if (!('fulfilled' in Target)) {
    Target.fulfilled = Target.resolve
  }

  const keys = Object.keys(Bluebird)
  for (let i = 0, c = keys.length; i !== c; ++i) {
    const key = keys[i]
    if (!key.startsWith('_') && !(key in Target)) {
      if (!(key in Target)) {
        const value = Bluebird[key]
        if (value) {
          Target[key] = value
        }
      }
    }
  }

  const targetProto = Target.prototype

  if (!('all' in targetProto)) {
    targetProto.all = function all() {
      return this.toBluebird().all()
    }
  }

  if (!('any' in targetProto)) {
    targetProto.any = function any() {
      return this.toBluebird().any()
    }
  }

  if (!('asCallback' in targetProto)) {
    targetProto.asCallback = function asCallback(...sink) {
      return this.toBluebird().asCallback(...sink)
    }
  }

  if (!('bind' in targetProto)) {
    targetProto.bind = function bind(thisArg) {
      return this.toBluebird().bind(thisArg)
    }
  }

  if (!('call' in targetProto)) {
    targetProto.call = function call(...args) {
      return this.toBluebird().call(...args)
    }
  }

  if (!('cancel' in targetProto)) {
    targetProto.cancel =
      targetProto.break ||
      function cancel(reason) {
        const b = this[toBluebirdSym]
        if (b) {
          b.cancel(reason)
        }
      }
  }

  if (!('catch' in targetProto)) {
    targetProto.catch =
      targetProto.caught ||
      function _catch(onError) {
        return this.then(empty, onError)
      }
  }

  if (!('catchReturn' in targetProto)) {
    targetProto.catchReturn = function catchReturn(...args) {
      return this.toBluebird().catchReturn(...args)
    }
  }

  if (!('catchThrow' in targetProto)) {
    targetProto.catchThrow = function catchThrow(...args) {
      return this.toBluebird().catchThrow(...args)
    }
  }

  if (!('caught' in targetProto)) {
    targetProto.caught = function caught(...args) {
      return this.toBluebird().caught(...args)
    }
  }

  if (!('delay' in targetProto)) {
    targetProto.delay = function delay(ms) {
      return this.toBluebird().delay(ms)
    }
  }

  if (!('disposer' in targetProto)) {
    targetProto.disposer = function disposer(disposeFn) {
      return this.toBluebird().disposer(disposeFn)
    }
  }

  if (!('each' in targetProto)) {
    targetProto.each = function each(iterator) {
      return this.toBluebird().each(iterator)
    }
  }

  if (!('error' in targetProto)) {
    targetProto.error = function error(onError) {
      return this.toBluebird().error(onError)
    }
  }

  if (!('filter' in targetProto)) {
    targetProto.filter = function filter(filterer, options) {
      return this.toBluebird().filter(filterer, options)
    }
  }

  if (!('finally' in targetProto)) {
    targetProto.finally =
      targetProto.lastly ||
      function _finally(onFinally) {
        if (typeof onFinally !== 'function') {
          return this
        }
        return this.then(
          result => {
            const t = onFinally()
            return typeof t === 'object' && t !== null && typeof t.then === 'function' ? t.then(() => result) : result
          },
          reason => {
            return this.constructor.resolve(onFinally()).then(() => {
              throw reason
            })
          }
        )
      }
  }

  if (!('get' in targetProto)) {
    targetProto.get = function get(key) {
      return this.toBluebird().get(key)
    }
  }

  if (!('isCancellable' in targetProto)) {
    targetProto.isCancellable = function isCancellable() {
      const b = this[toBluebirdSym]
      return (b && b.isCancellable()) || false
    }
  }

  if (!('isCancelled' in targetProto)) {
    targetProto.isCancelled = function isCancelled() {
      const b = this[toBluebirdSym]
      return (b && b.isCancelled()) || false
    }
  }

  if (!('isFulfilled' in targetProto)) {
    targetProto.isFulfilled = function isFulfilled() {
      return promiseDetails(this)[0] === 1
    }
  }

  if (!('isPending' in targetProto)) {
    targetProto.isPending = function isPending() {
      return promiseDetails(this)[0] === 0
    }
  }

  if (!('isRejected' in targetProto)) {
    targetProto.isRejected = function isRejected() {
      return promiseDetails(this)[0] === 2
    }
  }

  if (!('isResolved' in targetProto)) {
    targetProto.isResolved = function isResolved() {
      return promiseDetails(this)[0] !== 0
    }
  }

  if (!('map' in targetProto)) {
    targetProto.map = function map(mapper, options) {
      return this.toBluebird().map(mapper, options)
    }
  }

  if (!('mapSeries' in targetProto)) {
    targetProto.mapSeries = function mapSeries(iterator) {
      return this.toBluebird().mapSeries(iterator)
    }
  }

  if (!('nodeify' in targetProto)) {
    targetProto.nodeify = function nodeify(...sink) {
      return this.toBluebird().nodeify(...sink)
    }
  }

  if (!('props' in targetProto)) {
    targetProto.props = function props() {
      return this.toBluebird().props()
    }
  }

  if (!('race' in targetProto)) {
    targetProto.race = function race() {
      const ctor = this.constructor
      const Type = typeof ctor === 'function' ? ctor : Target
      return this.then(values => Type.race(values))
    }
  }

  if (!('reason' in targetProto)) {
    targetProto.reason = function reason() {
      const details = promiseDetails(this)
      return details[0] === 2 ? details[1] : undefined
    }
  }

  if (!('reduce' in targetProto)) {
    targetProto.reduce = function reduce(reducer, initialValue) {
      return this.toBluebird().reduce(reducer, initialValue)
    }
  }

  if (!('reflect' in targetProto)) {
    targetProto.reflect = function reflect() {
      return this.toBluebird().reflect()
    }
  }

  if (!('settle' in targetProto)) {
    targetProto.settle = function settle() {
      return this.toBluebird().settle()
    }
  }

  if (!('some' in targetProto)) {
    targetProto.some = function some(count) {
      return this.then(array => this.constructor.some(array, count))
    }
  }

  if (!('spread' in targetProto)) {
    targetProto.spread = function spread(onFulfilled) {
      return this.then(values => onFulfilled(...values))
    }
  }

  const oldSuppressUnhandledRejections = targetProto.suppressUnhandledRejections

  targetProto.suppressUnhandledRejections = function suppressUnhandledRejections() {
    if (!this[unhandledRejectionSuppressedSym]) {
      defineProperty(this, unhandledRejectionSuppressedSym, unhandledRejectionSuppressedDef)
      if (typeof oldSuppressUnhandledRejections === 'function') {
        oldSuppressUnhandledRejections.call(this)
      } else {
        this.catch(empty)
      }
      const b = this[toBluebirdSym]
      if (b !== undefined) {
        b.suppressUnhandledRejections()
      }
    }
    return this
  }

  if (!('tap' in targetProto)) {
    targetProto.tap = function tap(onTap) {
      if (onTap === null || onTap === undefined) {
        return this
      }
      return this.then(result => {
        const t = onTap(result)
        if (typeof t === 'object' && t !== null && typeof t.then === 'function') {
          return t.then(() => result)
        }
        return result
      })
    }
  }

  if (!('tapCatch' in targetProto)) {
    targetProto.tapCatch = function tapCatch(...args) {
      return this.toBluebird().tapCatch(...args)
    }
  }

  if (!('thenReturn' in targetProto)) {
    targetProto.thenReturn =
      targetProto.return ||
      function thenReturn(value) {
        return this.then(() => value)
      }
  }

  if (!('thenThrow' in targetProto)) {
    targetProto.thenThrow =
      targetProto.throw ||
      function thenThrow(reason) {
        return this.then(() => {
          throw reason
        })
      }
  }

  if (!('timeout' in targetProto)) {
    targetProto.timeout = function timeout(ms, message) {
      return this.toBluebird().timeout(ms, message)
    }
  }

  const bluebirdResolve = Bluebird.resolve

  if (!('toBluebird' in targetProto)) {
    targetProto.toBluebird = function toBluebird() {
      let result = this[toBluebirdSym]
      if (result === undefined) {
        result = bluebirdResolve(this)
        if (typeof result._setAsyncGuaranteed === 'function') {
          result._setAsyncGuaranteed()
        }
        if (this[unhandledRejectionSuppressedSym]) {
          result.suppressUnhandledRejections()
        }

        defineProperty(this, unhandledRejectionSuppressedSym, unhandledRejectionSuppressedDef)
        defineProperty(this, toBluebirdSym, { value: result, configurable: true, writable: true })
      }
      return result
    }
  }

  if (!('toJSON' in targetProto)) {
    targetProto.toJSON = function toJSON() {
      const [status, result] = promiseDetails(this)
      return {
        isFulfilled: status === 1,
        isRejected: status === 2,
        fulfillmentValue: status === 1 ? result : undefined,
        rejectionReason: status === 2 ? result : undefined
      }
    }
  }

  if (!('toNative' in targetProto)) {
    targetProto.toNative = function toNative() {
      return this
    }
  }

  if (!('value' in targetProto)) {
    targetProto.value = function value() {
      const details = promiseDetails(this)
      return details[0] === 1 ? details[1] : undefined
    }
  }

  if (!('done' in targetProto)) {
    targetProto.done = targetProto.then
  }

  if (!('lastly' in targetProto)) {
    targetProto.lastly = targetProto.finally
  }

  if (!('break' in targetProto)) {
    targetProto.break = targetProto.cancel
  }

  if (!('return' in targetProto)) {
    targetProto.return = targetProto.thenReturn
  }

  if (!('throw' in targetProto)) {
    targetProto.throw = targetProto.thenThrow
  }

  defineProperty(targetProto, toBluebirdSym, { value: undefined, configurable: true, writable: true })
  defineProperty(targetProto, promiseStatusSym, { value: undefined, configurable: true, writable: true })

  defineProperty(Target, bluebirdifiedSym, { value: true, configurable: true, writable: true })
  defineProperty(targetProto, bluebirdifiedSym, { value: true, configurable: true, writable: true })

  return Target
}

function bluebirdify(Target) {
  const targetIsBluebird =
    Target.Promise === Target &&
    Target.version &&
    typeof Target.resolve === 'function' &&
    !!Target.resolve(undefined)._bitField
  return targetIsBluebird ? initBluebird(Target) : initPromise(Target)
}

bluebirdify.Promise = Promise

bluebirdify.Bluebird = Bluebird

bluebirdify.is = promise => {
  if (typeof promise === 'object' && promise !== null && bluebirdifiedSym in promise) {
    const ctor = promise.constructor
    return typeof ctor === 'function' && ctor.prototype !== promise
  }
  return false
}

bluebirdify.suppressUnhandledRejections = promise => {
  if (typeof promise === 'object' && promise !== null) {
    if (typeof promise.suppressUnhandledRejections === 'function') {
      promise.suppressUnhandledRejections()
    } else if (!promise[unhandledRejectionSuppressedSym] && typeof promise.then === 'function') {
      promise.then(empty, empty)
      defineProperty(this, unhandledRejectionSuppressedSym, unhandledRejectionSuppressedDef)
    }
  }
  return promise
}

module.exports = bluebirdify

initBluebird(Bluebird)
initPromise(Promise)

const t = Promise.resolve(123)

t.then(() => {
  console.log('0')
})

const w = t.toBluebird()

t.then(() => {
  console.log('A')
})

w.then(() => {
  console.log('xxx')
})

t.then(() => {
  console.log('B')
})

console.log('SYNC END')
