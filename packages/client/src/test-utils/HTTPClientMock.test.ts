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

    it('can add a mock for custom status code', async () => {
      http.mockClear().mockAdd(
        {method: 'get', url: '/test'},
        {error: 'Internal'}, 500)

      const waitPromise = http.wait()
      const error = await getError(http.get('/test'))
      const error2 = await getError(waitPromise)
      expect(error.message).toEqual('HTTP Status: 500')
      expect(error2).toBe(error)
    })
  })

  describe('await wait', () => {
    it('waits for a request', async () => {
      const promise = http.get('/test')
      const result1 = await http.wait()
      const result2 = await promise
      expect(result1.res.data).toBe(result2)
      expect(result2).toBe(value)
      expect(result1.req).toBe(http.requests[0].request)
      expect(result1.req).toEqual({
        method: 'get',
        url: '/test',
      })
    })

    it('waits for all pending requests to complete', async () => {
      const promise1 = http.get('/test')
      const promise2 = http.post('/test', {})
      const error = await getError(http.wait())
      await promise1
      await getError(promise2)
      expect(error.message).toMatch(/No mock/)
    })
  })

})
