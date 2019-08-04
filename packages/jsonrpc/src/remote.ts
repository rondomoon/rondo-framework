import Axios from 'axios'
import {FunctionPropertyNames, TAsyncified} from './types'
import {IDEMPOTENT_METHOD_REGEX} from './idempotent'

export type TRequestIdGenerator<T extends string | number> = () => T

export const createNumberGenerator = (val: number) => () => ++val
export const constantId = (val: string) => () => val

export function createRemoteClient<T>(
  baseUrl: string,
  url: string,
  methods: Array<FunctionPropertyNames<T>>,
  getNextRequestId: TRequestIdGenerator<string | number> = constantId('c'),
  idempotentMethodRegex = IDEMPOTENT_METHOD_REGEX,
) {
  const axios = Axios.create({
    baseURL: baseUrl,
  })

  async function createRequest(
    id: string | number | null,
    method: string,
    params: any[],
  ) {
    const reqMethod = IDEMPOTENT_METHOD_REGEX.test(method) ? 'get' : 'post'
    const payloadKey = reqMethod === 'post' ? 'data' : 'params'

    const response = await axios({
      method: reqMethod,
      url,
      [payloadKey]: {
        id,
        jsonrpc: '2.0',
        method,
        params,
      },
    })
    if (response.data.error) {
      // TODO create an actual error
      throw response.data.error
    }
    return response.data.result
  }

  const service = methods.reduce((obj, method) => {
    obj[method] = async function makeRequest(...args: any[]) {
      return createRequest(getNextRequestId(), method, args)
    }
    return obj
  }, {} as any)

  return service as TAsyncified<T>
}
