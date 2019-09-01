import {Deferred} from './Deferred'

describe('Deferred', () => {

  it('allows promise to be resolved outside of the callback', async () => {
    const d = new Deferred<number>()
    d.resolve(3)
    const result = await d.promise
    expect(result).toBe(3)
  })

})
