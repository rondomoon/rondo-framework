import Axios from 'axios'
import {TAsyncified} from './types'

export function createRemoteClient<T>(
  baseUrl: string,
  url: string,
  methods: Array<keyof T>,
) {
  const axios = Axios.create({
    baseURL: baseUrl,
  })

  let id = 0
  const service = methods.reduce((obj, method) => {
    obj[method] = async function makeRequest(...args: any[]) {
      id++
      const response = await axios({
        method: 'post',
        url,
        headers: {
          'content-type': 'application/json',
        },
        data: {
          id,
          jsonrpc: '2.0',
          method,
          params: args,
        },
      })
      if (response.data.error) {
        // TODO create an actual error
        throw response.data.error
      }
      return response.data.result
    }
    return obj
  }, {} as any)

  return service as TAsyncified<T>
}
