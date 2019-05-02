// Based on Bluebird tests (MIT License). see https://github.com/petkaantonov/bluebird and http://bluebirdjs.com and LICENSE file

const { expect } = require('chai')

function promised(val) {
  return new Promise(f => {
    setTimeout(() => {
      f(val)
    }, 1)
  })
}

function thenabled(val, arr) {
  return {
    then(f) {
      setTimeout(() => {
        if (arr) arr.push(val)
        f(val)
      }, 1)
    }
  }
}

describe('Promise.each', () => {
  it("should return the array's values mapped", () => {
    const a = [promised(1), promised(2), promised(3)]
    const b = []
    return Promise.resolve(a)
      .mapSeries(val => {
        b.push(3 - val)
        return val + 2
      })
      .then(ret => {
        expect(ret).to.deep.equal([3, 4, 5])
        expect(b).to.deep.equal([2, 1, 0])
      })
  })

  it('takes value, index and length', () => {
    const a = [promised(1), promised(2), promised(3)]
    const b = []
    return Promise.resolve(a)
      .each((value, index, length) => {
        b.push(value, index, length)
      })
      .then(() => {
        expect(b).to.deep.equal([1, 0, 3, 2, 1, 3, 3, 2, 3])
      })
  })

  it('waits for returned promise before proceeding next', () => {
    const a = [promised(1), promised(2), promised(3)]
    const b = []
    return Promise.resolve(a)
      .each(value => {
        b.push(value)
        return Promise.delay(1).then(() => {
          b.push(value * 2)
        })
      })
      .then(() => {
        expect(b).to.deep.equal([1, 2, 2, 4, 3, 6])
      })
  })

  it('waits for returned thenable before proceeding next', () => {
    const b = [1, 2, 3]
    const a = [thenabled(1), thenabled(2), thenabled(3)]
    return Promise.resolve(a)
      .each(val => {
        b.push(val * 50)
        return thenabled(val * 500, b)
      })
      .then(() => {
        expect(b).to.deep.equal([1, 2, 3, 50, 500, 100, 1000, 150, 1500])
      })
  })

  it('doesnt iterate with an empty array', () => {
    return Promise.each([], () => {
      throw new Error()
    }).then(ret => {
      expect(ret).to.deep.equal([])
    })
  })

  it('iterates with an array of single item', () => {
    const b = []
    return Promise.each([promised(1)], val => {
      b.push(val)
      return thenabled(val * 2, b)
    }).then(() => {
      expect(b).to.deep.equal([1, 2])
    })
  })
})

describe('Promise.prototype.each', () => {
  it("should return the array's values", () => {
    const a = [promised(1), promised(2), promised(3)]
    const b = []
    return Promise.resolve(a)
      .each(val => {
        b.push(3 - val)
        return val
      })
      .then(ret => {
        expect(ret).to.deep.equal([1, 2, 3])
        expect(b).to.deep.equal([2, 1, 0])
      })
  })

  it('takes value, index and length', () => {
    const a = [promised(1), promised(2), promised(3)]
    const b = []
    return Promise.resolve(a)
      .each((value, index, length) => {
        b.push(value, index, length)
      })
      .then(() => {
        expect(b).to.deep.equal([1, 0, 3, 2, 1, 3, 3, 2, 3])
      })
  })

  it('waits for returned promise before proceeding next', () => {
    const a = [promised(1), promised(2), promised(3)]
    const b = []
    return Promise.resolve(a)
      .each(value => {
        b.push(value)
        return Promise.delay(1).then(() => {
          b.push(value * 2)
        })
      })
      .then(() => {
        expect(b).to.deep.equal([1, 2, 2, 4, 3, 6])
      })
  })

  it('waits for returned thenable before proceeding next', () => {
    const b = [1, 2, 3]
    const a = [thenabled(1), thenabled(2), thenabled(3)]
    return Promise.resolve(a)
      .each(val => {
        b.push(val * 50)
        return thenabled(val * 500, b)
      })
      .then(() => {
        expect(b).to.deep.equal([1, 2, 3, 50, 500, 100, 1000, 150, 1500])
      })
  })

  it('doesnt iterate with an empty array', () => {
    return Promise.resolve([])
      .each(() => {
        throw new Error()
      })
      .then(ret => {
        expect(ret).to.deep.equal([])
      })
  })

  it('iterates with an array of single item', () => {
    const b = []
    return Promise.resolve([promised(1)])
      .each(val => {
        b.push(val)
        return thenabled(val * 2, b)
      })
      .then(() => {
        expect(b).to.deep.equal([1, 2])
      })
  })

  describe('mapSeries and each', () => {
    it('is mixed', () => {
      return Promise.resolve([1, 2, 3])
        .mapSeries(value => {
          return value * 2
        })
        .then(result => {
          expect(result).to.deep.equal([2, 4, 6])
        })
        .then(() => {
          return Promise.each([1, 2, 3], value => {
            return value * 2
          }).then(result => {
            expect(result).to.deep.equal([1, 2, 3])
          })
        })
        .thenReturn([1, 2, 3])
        .mapSeries(value => {
          return value * 2
        })
        .then(result => {
          expect(result).to.deep.equal([2, 4, 6])
        })
        .thenReturn([1, 2, 3])
        .each(value => {
          return value * 2
        })
        .then(result => {
          expect(result).to.deep.equal([1, 2, 3])
        })
    })
  })
})
