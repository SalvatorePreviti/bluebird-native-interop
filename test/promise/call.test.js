// Based on Bluebird tests (MIT License). see https://github.com/petkaantonov/bluebird and http://bluebirdjs.com and LICENSE file

const { assert, expect } = require('chai')

const c = {
  val: 3,
  method(...args) {
    return [...args, this.val]
  }
}

const noop = x => x

describe('call', () => {
  it('0 args', () => {
    return Promise.resolve(c)
      .call('method')
      .then(res => {
        expect(res).to.deep.equal([3])
      })
  })
  it('1 args', () => {
    return Promise.resolve(c)
      .call('method', 1)
      .then(res => {
        expect(res).to.deep.equal([1, 3])
      })
  })
  it('2 args', () => {
    return Promise.resolve(c)
      .call('method', 1, 2)
      .then(res => {
        expect(res).to.deep.equal([1, 2, 3])
      })
  })
  it('3 args', () => {
    return Promise.resolve(c)
      .call('method', 1, 2, 3)
      .then(res => {
        expect(res).to.deep.equal([1, 2, 3, 3])
      })
  })
  it('10 args', () => {
    return Promise.resolve(c)
      .call('method', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
      .then(res => {
        expect(res).to.deep.equal([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 3])
      })
  })
  it('method not found', () => {
    const promises = [
      Promise.resolve([])
        .call('abc')
        .then(assert.fail, noop),
      Promise.resolve([])
        .call('abc', 1, 2, 3, 4, 5, 6, 7)
        .then(assert.fail, noop),
      Promise.resolve([])
        .call('abc ')
        .then(assert.fail, noop),
      Promise.resolve(null)
        .call('abc', 1, 2, 3, 4, 5, 6, 7)
        .then(assert.fail, noop),
      Promise.resolve(null)
        .call('abc')
        .then(assert.fail, noop),
      Promise.resolve(null)
        .call('abc ')
        .then(assert.fail, noop)
    ]

    return Promise.all(promises).then(errors => {
      for (let i = 0; i < errors.length; ++i) {
        const message = errors[i].message || errors[i].toString()
        assert(message.indexOf('has no method') >= 0)
      }
    })
  })
})
