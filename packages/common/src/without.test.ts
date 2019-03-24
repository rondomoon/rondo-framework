import {without} from './without'

describe('without', () => {

  it('filters a key out of a record', () => {
    const records = {
      k1: 'one',
      k2: 'two',
      k3: 'three',
    }
    expect(without(records, 'k1')).toEqual({
      k2: 'two',
      k3: 'three',
    })
  })

})
