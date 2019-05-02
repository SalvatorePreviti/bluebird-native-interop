const { expect } = require('chai')
const Bluebird = require('bluebird')

describe('toBluebird', () => {
  it('returns a bluebird promise', () => {
    expect(Promise.resolve().toBluebird()).to.be.an.instanceOf(Bluebird)
  })

  it('resolves correctly', () => {
    const resolved = Promise.resolve(123)
    return resolved.toBluebird().then(value => {
      expect(value).to.equal(123)
    })
  })

  it('rejects correctly', () => {
    return Promise.reject('custom rejection')
      .toBluebird()
      .catch(error => {
        expect(error).to.equal('custom rejection')
      })
  })

  it('respects then order', () => {
    let doResolve
    const p = new Promise(resolve => {
      doResolve = resolve
    })

    const calls = []

    p.then(value => {
      calls.push({ order: 1, value })
    })

    const bb = p.toBluebird()

    const promises = [p, bb]

    promises.push(
      bb.then(value => {
        calls.push({ order: 2, value })
      })
    )

    promises.push(
      p.then(value => {
        calls.push({ order: 4, value })
      })
    )

    promises.push(
      p
        .toBluebird()
        .toBluebird()
        .then(value => {
          calls.push({ order: 5, value })
        })
    )

    promises.push(
      bb.then(value => {
        calls.push({ order: 3, value })
      })
    )

    doResolve(123)

    return Promise.all(promises).then(() => {
      expect(calls).to.deep.equal([
        { order: 1, value: 123 },
        { order: 2, value: 123 },
        { order: 3, value: 123 },
        { order: 4, value: 123 },
        { order: 5, value: 123 }
      ])
    })
  })
})
