import {HTTPClientMock} from './HTTPClientMock'
import {getError} from './getError'

describe('HTTPClientMock', () => {

  const http = new HTTPClientMock<any>()

  const value = {a: 1}
  beforeEach(() => {
    http.mockClear()
    http.mockAdd({
      method: 'get',
      url: '/test',
    }, value)
  })

  describe('mockAdd and mockClear', () => {
    it('adds a mock', async () => {
      const result = await http.get('/test')
      expect(result).toBe(value)

      http.mockClear()

      const error = await getError(http.get('/test'))
      expect(error.message).toMatch(/mock/i)
    })
  })

  describe('await wait', () => {
    it('waits for a request', async () => {
      const promise = http.get('/test')
      const result1 = await http.wait()
      const result2 = await promise
      expect(result1.res.data).toBe(result2)
      expect(result2).toBe(value)
      expect(result1.req).toBe(http.requests[0])
      expect(result1.req).toEqual({
        method: 'get',
        url: '/test',
      })
    })
  })

})
