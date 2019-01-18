import express from 'express'
import {RequestTester} from './RequestTester'

describe('RequestTest', () => {

  interface IAPI {
    '/test': {
      'get': {
        response: {id: number},
      },
    }
  }

  const app = express()
  app.get('/api/test', (req, res) => {
    res.json({ id: 1 })
  })

  describe('constructor', () => {
    it('creates a blank baseUrl', () => {
      const t = new RequestTester<IAPI>(app)
      expect(t.baseUrl).toEqual('')
    })
  })

  describe('RequestTester.request', () => {
    it('creates a response', async () => {
      const t = new RequestTester<IAPI>(app, '/api')
      const result = await t.request('get', '/test')
      expect(result.body.id).toBe(1)
    })
  })

})
