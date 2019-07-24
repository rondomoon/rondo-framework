import {jsonrpc} from './server'
import request from 'supertest'
import express from 'express'
import bodyParser from 'body-parser'

describe('jsonrpc', () => {

  class Service {
    constructor(readonly time: number) {}
    add(a: number, b: number) {
      return a + b
    }
    multiply(...numbers: number[]) {
      return numbers.reduce((a, b) => a * b, 1)
    }
    delay() {
      return new Promise(resolve => {
        setTimeout(resolve, this.time)
      })
    }
  }

  function createApp() {
    const app = express()
    app.use(bodyParser.json())
    app.use('/myService', jsonrpc(new Service(5), ['add', 'delay']))
    app.use((err: any, req: any, res: any, next: any) => {
      console.log(err)
      next(err)
    })
    return app
  }

  describe('errors', () => {

  })

  describe('success', () => {
    it('can call method and receive results', async () => {
      const response = await request(createApp())
      .post('/myService')
      .send({
        jsonrpc: '2.0',
        id: 1,
        method: 'add',
        params: [1, 2],
      })
      .expect(200)

      expect(response.body).toEqual({
        jsonrpc: '2.0',
        id: 1,
        result: 3,
        error: null,
      })
    })
    it('handles promises', async () => {
      const response = await request(createApp())
      .post('/myService')
      .send({
        jsonrpc: '2.0',
        id: 1,
        method: 'delay',
        params: [],
      })
      .expect(200)
      expect(response.body).toEqual({
        jsonrpc: '2.0',
        id: 1,
        // result: null,
        error: null,
      })
    })
    it('handles synchronous notifications', async () => {
      await request(createApp())
      .post('/myService')
      .send({
        jsonrpc: '2.0',
        method: 'add',
        params: [1, 2],
      })
      .expect(200)
      .expect('')

      await request(createApp())
      .post('/myService')
      .send({
        jsonrpc: '2.0',
        id: null,
        method: 'add',
        params: [1, 2],
      })
      .expect(200)
      .expect('')
    })
  })

  describe('security', () => {
    it('cannot call toString method', () => {

    })

    it('cannot call any other methods in objects prototype', () => {

    })
  })

})
