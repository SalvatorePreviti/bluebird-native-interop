'use strict'

const util = require('util')
const Bluebird = require('bluebird')

const newSymbol = typeof Symbol !== 'undefined' ? Symbol.for : name => `_${name}`

const toNativeSym = newSymbol('#toNativeSym')
const bluebirdifiedSym = newSymbol('#bluebirdified')
const promiseStatusSym = newSymbol('#promiseStatus')

const unhandledRejectionSuppressedSym = newSymbol('#unhandledRejectionSuppressed')
const unhandledRejectionSuppressedDef = { value: true, configurable: true, writable: true }

const isArray = Array.isArray
const objectKeys = Object.keys
const getOwnPropertyDescriptor = Reflect.getOwnPropertyDescriptor
const defineProperty = Reflect.defineProperty

const empty = () => {}

const override = (target, source) => {
  const keys = objectKeys(source)
  for (let i = 0, c = keys.length; i !== c; ++i) {
    const key = keys[i]
    const descriptor = getOwnPropertyDescriptor(source, key)
    if (descriptor !== undefined) {
      descriptor.enumerable = false
      descriptor.configurable = true
      defineProperty(target, key, descriptor)
    }
  }
}

const augment = (target, source) => {
  const keys = objectKeys(source)
  for (let i = 0, c = keys.length; i !== c; ++i) {
    const key = keys[i]
    if (!key.startsWith('_') && !(key in target)) {
      const descriptor = getOwnPropertyDescriptor(source, key)
      if (descriptor !== undefined) {
        descriptor.enumerable = false
        descriptor.configurable = true
        defineProperty(target, key, descriptor)
      }
    }
  }
}

const addMethodNames = target => {
  const keys = objectKeys(target)
  const keysLength = keys.length
  for (let i = 0; i !== keysLength; ++i) {
    const key = keys[i]
    const value = target[key]
    if (typeof value === 'function' && !value.name) {
      defineProperty(value, 'name', { value: key, configurable: true })
    }
  }
}

const getNodePromiseDetails = (() => {
  try {
    // Synchronously access the state of a native promise for compatibility with Bluebird.
    // process.binding is deprecated but still works for sure up to node > 12.0.0
    // When it gets removed, other solutions may be implemented.
    // eslint-disable-next-line node/no-deprecated-api
    const result = process.binding && process.binding('util').getPromiseDetails
    return (typeof result === 'function' && result) || empty
  } catch (_error) {}
  return empty
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

  const nodeDetails = getNodePromiseDetails(promise)
  if (isArray(nodeDetails)) {
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
  return details
}

const staticMembers = {
  Promise,
  Bluebird,
  bluebirdifyPromiseClass,
  supportsAsyncAwait: false,
  suppressUnhandledRejections(promise) {
    if (typeof promise === 'object' && promise !== null) {
      if (typeof promise.suppressUnhandledRejections === 'function') {
        promise.suppressUnhandledRejections()
      } else if (!promise[unhandledRejectionSuppressedSym] && typeof promise.then === 'function') {
        promise.then(empty, empty)
        defineProperty(this, unhandledRejectionSuppressedSym, unhandledRejectionSuppressedDef)
      }
    }
    return promise
  },
  is(promise) {
    if (typeof promise === 'object' && promise !== null && bluebirdifiedSym in promise) {
      const ctor = promise.constructor
      return typeof ctor === 'function' && ctor.prototype !== promise
    }
    return false
  },
  defer() {
    const ret = {}
    ret.promise = new this((resolve, reject) => {
      ret.resolve = resolve
      ret.reject = reject
      ret.fulfill = resolve
    })
    return ret
  }
}

const bluebirdPrototypeMembers = {
  toBluebird() {
    return this
  },
  toNative() {
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
}

const prototypeMembers = {
  all() {
    return this.then(result => this.constructor.all(result))
  },
  any() {
    return this.then(result => this.constructor.any(result))
  },
  asCallback(...sink) {
    return this.toBluebird().asCallback(...sink)
  },
  bind(thisArg) {
    return this.toBluebird().bind(thisArg)
  },
  call(methodName, ...args) {
    return this.then(obj => {
      let fn
      if (obj !== undefined && obj !== null) {
        fn = obj[methodName]
      }
      if (typeof fn !== 'function') {
        try {
          methodName = `${methodName}`
        } catch (e) {
          methodName = '[no string representation]'
        }
        throw new TypeError(`Object ${{}.toString.call(obj)} has no method '${methodName}'`)
      }
      return fn.apply(obj, args)
    })
  },
  cancel() {
    throw new TypeError('Cannot cancel a non bluebird promise')
  },
  catch(onError) {
    return this.then(empty, onError)
  },
  catchReturn(...args) {
    return this.toBluebird().catchReturn(...args)
  },
  catchThrow(...args) {
    return this.toBluebird().catchThrow(...args)
  },
  caught(...args) {
    return args.length === 1 ? this.catch(args[0]) : this.toBluebird().caught(...args)
  },
  delay(ms) {
    return this.toBluebird().delay(ms)
  },
  disposer(disposeFn) {
    return this.toBluebird().disposer(disposeFn)
  },
  each(iterator) {
    return this.then(result => this.constructor.each(result, iterator))
  },
  error(onError) {
    return this.catch(onError)
  },
  filter(filterer, options) {
    return this.then(result => this.constructor.filter(result, filterer, options))
  },
  finally(onFinally) {
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
  },
  get(key) {
    if (typeof key === 'number') {
      return this.then(obj => {
        let index = key
        const len = obj.length
        if (typeof len !== 'number') {
          return obj !== null && obj !== undefined ? obj[index] : undefined
        }
        if (index < 0) {
          index = Math.max(0, index + obj.length)
        }
        return obj[index]
      })
    }
    return this.then(obj => {
      return obj !== null && obj !== undefined ? obj[key] : undefined
    })
  },
  isCancellable() {
    return false
  },
  isCancelled() {
    const details = promiseDetails(this)
    return details[0] === 2 && details[1] instanceof Bluebird.CancellationError
  },
  isFulfilled() {
    return promiseDetails(this)[0] === 1
  },
  isPending() {
    return promiseDetails(this)[0] === 0
  },
  isRejected() {
    return promiseDetails(this)[0] === 2
  },
  isResolved() {
    return promiseDetails(this)[0] !== 0
  },
  map(mapper, options) {
    return this.then(result => this.constructor.map(result, mapper, options))
  },
  mapSeries(iterator) {
    return this.then(result => this.constructor.mapSeries(result, iterator))
  },
  nodeify(...sink) {
    return this.toBluebird().nodeify(...sink)
  },
  props() {
    return this.then(result => this.constructor.props(result))
  },
  race() {
    return this.then(result => this.constructor.race(result))
  },
  reason() {
    const details = promiseDetails(this)
    return details[0] === 2 ? details[1] : undefined
  },
  reduce(reducer, initialValue) {
    return this.then(result => this.constructor.reduce(result, reducer, initialValue))
  },
  reflect() {
    return this.toBluebird().reflect()
  },
  settle() {
    return this.toBluebird().settle()
  },
  some(count) {
    return this.then(result => this.constructor.some(result, count))
  },
  spread(onFulfilled) {
    return this.then(values => onFulfilled(...values))
  },
  suppressUnhandledRejections() {
    if (!this[unhandledRejectionSuppressedSym]) {
      this.catch(empty)
      defineProperty(this, unhandledRejectionSuppressedSym, unhandledRejectionSuppressedDef)
    }
    return this
  },
  tap(onTap) {
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
  },
  tapCatch(...args) {
    return this.toBluebird().tapCatch(...args)
  },
  thenReturn(value) {
    return this.then(() => value)
  },
  thenThrow(reason) {
    return this.then(() => {
      throw reason
    })
  },
  timeout(ms, message) {
    return this.toBluebird().timeout(ms, message)
  },
  toBluebird() {
    const b = Bluebird.resolve(this)
    if (typeof b._setAsyncGuaranteed === 'function') {
      b._setAsyncGuaranteed()
    }
    if (this[unhandledRejectionSuppressedSym]) {
      b.suppressUnhandledRejections()
    }
    return b
  },
  toJSON() {
    const [status, result] = promiseDetails(this)
    return {
      isFulfilled: status === 1,
      isRejected: status === 2,
      fulfillmentValue: status === 1 ? result : undefined,
      rejectionReason: status === 2 ? result : undefined
    }
  },
  toNative() {
    return this
  },
  value() {
    const details = promiseDetails(this)
    return details[0] === 1 ? details[1] : undefined
  }
}

try {
  // eslint-disable-next-line global-require
  require('./lib/_withAsyncAwait')(staticMembers, prototypeMembers)
} catch (_error) {}

function bluebirdifyPromiseClass(Target) {
  if (typeof Target !== 'function') {
    throw new TypeError(`Cannot bluebirdify an ${typeof Target}.`)
  }

  const targetProto = Target.prototype

  if (!targetProto || typeof targetProto.then !== 'function') {
    throw new TypeError(`Cannot bluebirdify ${Target.name}: it is not a Promise class`)
  }

  if (Target[bluebirdifiedSym]) {
    return Target
  }

  const targetIsBluebird =
    Target.Promise === Target &&
    Target.version &&
    typeof Target.resolve === 'function' &&
    !!Target.resolve(undefined)._bitField

  if (targetIsBluebird) {
    augment(Target, staticMembers)
    augment(targetProto, bluebirdPrototypeMembers)

    // eslint-disable-next-line node/no-unsupported-features/node-builtins
    const ispectCustomSym = util.inspect.custom || 'inspect'
    if (!(ispectCustomSym in targetProto)) {
      targetProto[ispectCustomSym] = targetProto.toJSON
    }

    addMethodNames(Target)
    addMethodNames(targetProto)
  } else {
    override(Target, { bind: Bluebird.bind, defer: staticMembers.defer })

    augment(Target, staticMembers)

    augment(Target, {
      pending: Target.pending,
      rejected: Target.reject,
      fulfilled: Target.resolve
    })

    augment(Target, Bluebird)

    augment(targetProto, prototypeMembers)

    augment(targetProto, {
      done: targetProto.then,
      error: targetProto.catch,
      lastly: targetProto.finally,
      break: targetProto.cancel,
      return: targetProto.thenReturn,
      throw: targetProto.thenThrow
    })

    defineProperty(targetProto, unhandledRejectionSuppressedSym, {
      value: undefined,
      configurable: true,
      writable: true
    })

    defineProperty(targetProto, promiseStatusSym, { value: undefined, configurable: true, writable: true })
    defineProperty(targetProto, unhandledRejectionSuppressedSym, {
      value: false,
      configurable: true,
      writable: true
    })
  }

  defineProperty(Target, bluebirdifiedSym, { value: true, configurable: true, writable: true })
  defineProperty(targetProto, bluebirdifiedSym, { value: true, configurable: true, writable: true })
  return Target
}

bluebirdifyPromiseClass(Bluebird)
bluebirdifyPromiseClass(Promise)

module.exports = Promise
