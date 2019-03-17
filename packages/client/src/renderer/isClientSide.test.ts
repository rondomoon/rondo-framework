import {isClientSide} from './isClientSide'

describe('isClientSide', () => {

  describe('client', () => {
    it('returns true when running in browser', () => {
      expect(isClientSide()).toBe(true)
    })
  })

  describe('server', () => {

    const g: any = global
    const window = g.window
    beforeEach(() => {
      delete g.window
    })

    afterEach(() => {
      g.window = window
    })
    it('returns false when running on server', () => {
      expect(isClientSide()).toBe(false)
    })
  })

})
