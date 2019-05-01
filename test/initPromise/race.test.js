'use strict'

const { expect, assert } = require('chai')

describe('Promise.race', () => {
  it('remains forever pending when passed an empty array', () => {
    const p = Promise.race([]).delay(0)
    return Promise.delay(5).then(() => {
      expect(p.isPending()).to.equal(true)
    })
  })

  it('fulfills when passed an immediate value', () => {
    return Promise.race([1, 2, 3]).then(v => {
      expect(v).to.equal(1)
    })
  })

  it('fulfills when passed an immediately fulfilled value', () => {
    const d1 = Promise.defer()
    d1.fulfill(1)
    const p1 = d1.promise

    const d2 = Promise.defer()
    d2.fulfill(2)
    const p2 = d2.promise

    const d3 = Promise.defer()
    d3.fulfill(3)
    const p3 = d3.promise

    return Promise.race([p1, p2, p3]).then(v => {
      expect(v).to.equal(1)
    })
  })

  it('fulfills when passed an eventually fulfilled value', () => {
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

    return Promise.race([p1, p2, p3]).then(v => {
      expect(v).to.equal(1)
    })
  })

  it('rejects when passed an immediate value', () => {
    return Promise.race([Promise.reject(1), 2, 3]).then(assert.fail, v => {
      expect(v).to.equal(1)
    })
  })

  it('rejects when passed an immediately rejected value', () => {
    const d1 = Promise.defer()
    d1.reject(1)
    const p1 = d1.promise

    const d2 = Promise.defer()
    d2.fulfill(2)
    const p2 = d2.promise

    const d3 = Promise.defer()
    d3.fulfill(3)
    const p3 = d3.promise

    return Promise.race([p1, p2, p3]).then(assert.fail, v => {
      expect(v).to.equal(1)
    })
  })

  it('rejects when passed an eventually rejected value', () => {
    const d1 = Promise.defer()
    const p1 = d1.promise

    const d2 = Promise.defer()
    const p2 = d2.promise

    const d3 = Promise.defer()
    const p3 = d3.promise

    setTimeout(() => {
      d1.reject(1)
      d2.fulfill(2)
      d3.fulfill(3)
    }, 1)

    return Promise.race([p1, p2, p3]).then(assert.fail, v => {
      expect(v).to.equal(1)
    })
  })

  it('propagates bound value', () => {
    const o = {}
    return Promise.resolve([1])
      .bind(o)
      .race()
      .then(function(v) {
        expect(v).to.equal(1)
        expect(this).to.equal(o)
      })
  })
})
