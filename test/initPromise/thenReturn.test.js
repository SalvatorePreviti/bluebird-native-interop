const { expect } = require('chai')

describe('thenReturn', () => {
  it('is the same as .return', () => {
    expect(Promise.resolve.return).to.equal(Promise.resolve.thenReturn)
  })

  it('returns the specified value', () => {
    return Promise.resolve(123)
      .thenReturn(456)
      .then(x => expect(x).to.equal(456))
  })
})
