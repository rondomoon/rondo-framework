import {HTTPClientMock} from './HTTPClientMock'
import {getError} from '../test-utils'

describe('HTTPClientMock', () => {

  const http = new HTTPClientMock<any>()

  describe('mockAdd and mockClear', () => {
    it('adds a mock', async () => {
      const value = {a: 1}
      http.mockAdd({
        method: 'get',
        url: '/test',
      }, value)

      const result = await http.get('/test')
      expect(result).toBe(value)

      http.mockClear()

      const error = await getError(http.get('/test'))
      expect(error.message).toMatch(/mock/i)
    })
  })

})
