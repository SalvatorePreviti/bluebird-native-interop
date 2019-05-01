const { expect } = require('chai')
const Bluebird = require('bluebird')

describe('toBluebird', () => {
  it('returns a bluebird promise', () => {
    expect(Promise.resolve().toBluebird()).to.be.an.instanceOf(Bluebird)
  })

  it('returns always the same instance', () => {
    const resolved = Promise.resolve()
    expect(resolved.toBluebird()).to.equal(resolved.toBluebird())
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
})
