const { expect } = require('chai')

describe('done', () => {
  it('is the same as then', () => {
    expect(Promise.resolve().done).to.equal(Promise.resolve().then)
  })
})
