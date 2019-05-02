'use strict'

/* eslint-disable node/no-unsupported-features/es-syntax */

const staticMembers = {
  supportsAsyncAwait: true,

  Promise: (async () => {})().constructor
}

const prototypeMembers = {
  async all() {
    return this.constructor.all(await this)
  },

  async any() {
    return this.constructor.any(await this)
  },

  async call(methodName, ...args) {
    const obj = await this
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
  },

  async each(iterator) {
    return this.constructor.each(await this, iterator)
  },

  async filter(filterer, options) {
    const result = await this
    return this.constructor.filter(result, filterer, options)
  },

  async finally(onFinally) {
    if (typeof onFinally !== 'function') {
      return this
    }
    let result
    try {
      result = await this
    } finally {
      await onFinally()
    }
    return result
  },

  async get(key) {
    const obj = await this
    if (typeof key === 'number') {
      let index = key
      const len = obj.length
      if (typeof len !== 'number') {
        return obj !== null && obj !== undefined ? obj[index] : undefined
      }
      if (index < 0) {
        index = Math.max(0, index + obj.length)
      }
      return obj[index]
    }
    return obj !== null && obj !== undefined ? obj[key] : undefined
  },

  async map(mapper, options) {
    return this.constructor.map(await this, mapper, options)
  },

  async mapSeries(iterator) {
    return this.constructor.mapSeries(await this, iterator)
  },

  async props() {
    return this.constructor.props(await this)
  },

  async race() {
    return this.constructor.race(await this)
  },

  async reduce(reducer, initialValue) {
    return this.constructor.reduce(await this, reducer, initialValue)
  },

  async some(count) {
    return this.constructor.some(await this, count)
  },

  async spread(onFulfilled) {
    const values = await this
    return onFulfilled(...values)
  },

  async tap(onTap) {
    if (onTap === null || onTap === undefined) {
      return this
    }
    const result = await this
    await onTap(result)
    return result
  },

  async thenReturn(value) {
    await this
    return value
  },

  async thenThrow(reason) {
    await this
    throw reason
  }
}

module.exports = (targetStaticMembers, targetPrototypeMembers) => {
  Object.assign(targetStaticMembers, staticMembers)
  Object.assign(targetPrototypeMembers, prototypeMembers)
}
