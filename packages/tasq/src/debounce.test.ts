import {debounce} from './debounce'

describe('debounce', () => {

  it('executes only once', async () => {
    const add = jest.fn()
    const d = debounce(add, 0)
    d(1, 2)
    d(3, 4)
    d(5, 6)
    d(7, 8)

    await new Promise(resolve => setTimeout(resolve, 0))
    expect(add.mock.calls).toEqual([[ 7, 8 ]])
  })

})
