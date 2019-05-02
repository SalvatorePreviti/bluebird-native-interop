// Based on Bluebird tests (MIT License). see https://github.com/petkaantonov/bluebird and http://bluebirdjs.com and LICENSE file

const { expect } = require('chai')

describe('done', () => {
  it('is the same as then', () => {
    expect(Promise.resolve().done).to.equal(Promise.resolve().then)
  })
})
