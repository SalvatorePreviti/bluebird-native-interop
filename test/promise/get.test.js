const { assert } = require('chai')

const join = Promise.join

describe('indexed getter', () => {
  const p = Promise.resolve([0, 1, 2, 3, 4, 5, 7, 5, 10])
  it('gets positive index', () => {
    const first = p.get(0)
    const fourth = p.get(3)
    const last = p.get(8)

    return join(first, fourth, last, (a, b, c) => {
      assert(a === 0)
      assert(b === 3)
      assert(c === 10)
    })
  })

  it('gets negative index', () => {
    const last = p.get(-1)
    const first = p.get(-20)

    return join(last, first, (a, b) => {
      assert.equal(a, 10)
      assert.equal(b, 0)
    })
  })
})

describe('identifier getter', () => {
  const p = Promise.resolve(new RegExp('', ''))
  it('gets property', () => {
    const ci = p.get('ignoreCase')
    const g = p.get('global')
    const lastIndex = p.get('lastIndex')
    const multiline = p.get('multiline')

    return join(ci, g, lastIndex, multiline, (xci, xg, xlastIndex, xmultiline) => {
      assert(xci === false)
      assert(xg === false)
      assert(xlastIndex === 0)
      assert(xmultiline === false)
    })
  })

  it('gets same property', () => {
    let o = { o: 1 }
    let o2 = { o: 2 }
    o = Promise.resolve(o).get('o')
    o2 = Promise.resolve(o2).get('o')
    return join(o, o2, (one, two) => {
      assert.strictEqual(1, one)
      assert.strictEqual(2, two)
    })
  })
})

describe('non identifier getters', () => {
  const p = Promise.resolve({ '-': 'val' })
  it('get property', () => {
    return p.get('-').then(val => {
      assert(val === 'val')
    })
  })

  specify.skip('overflow cache', () => {
    const a = new Array(1024)
    const o = {}
    for (let i = 0; i < a.length; ++i) {
      a[i] = `get${i}`
      o[`get${i}`] = i * 2
    }
    const b = Promise.map(a, (item, index) => {
      return Promise.resolve(o).get(a[index])
    })
      .filter((value, index) => {
        return value === index * 2
      })
      .then(values => {
        assert.strictEqual(values.length, a.length)
      })
    return b
  })
})
