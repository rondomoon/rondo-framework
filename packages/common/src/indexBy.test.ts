import {indexBy} from './indexBy'

describe('indexBy', () => {

  const items = [{
    id: 10,
    name: 'one',
    value: true,
  }, {
    id: 20,
    name: 'two',
    value: false,
  }]

  it('indexes objects by string property', () => {
    expect(indexBy(items, 'id')).toEqual({
      10: items[0],
      20: items[1],
    })
  })

  it('indexes objects by numeric property', () => {
    expect(indexBy(items, 'name')).toEqual({
      one: items[0],
      two: items[1],
    })
  })
})
