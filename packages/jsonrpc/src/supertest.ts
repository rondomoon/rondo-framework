import request from 'supertest'
import {Application} from 'express'
import {RPCClient} from './types'

export function createClient<T>(app: Application, path: string,
) {
  let id = 0
  const proxy = new Proxy({}, {
    get(obj, prop) {
      id++
      return async function makeRequest(...args: any[]) {
        const result = await request(app)
        .post(path)
        .send({
          jsonrpc: '2.0',
          id,
          method: prop,
          params: args,
        })
        const {body} = result
        if (body.error) {
          throw body.error
        }
        return body.result
      }
    },
  })
  return proxy as RPCClient<T>
}
