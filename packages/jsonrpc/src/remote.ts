import Axios from 'axios'
import {FunctionPropertyNames, RPCClient} from './types'
import {IDEMPOTENT_METHOD_REGEX} from './idempotent'

export type GenerateRequestId<T extends string | number> = () => T

export const createNumberGenerator = (val: number) => () => ++val
export const constantId = (val: string) => () => val

export function createRemoteClient<T>(
  url: string,
  methods: Array<FunctionPropertyNames<T>>,
  headers: Record<string, string> = {},
  getNextRequestId: GenerateRequestId<string | number> = constantId('c'),
  idempotentMethodRegex = IDEMPOTENT_METHOD_REGEX,
) {
  const axios = Axios.create()

  async function createRequest(
    id: string | number | null,
    method: string,
    params: any[],
  ) {
    const reqMethod = idempotentMethodRegex.test(method) ? 'GET' : 'POST'
    const payloadKey = reqMethod === 'POST' ? 'data' : 'params'

    const response = await axios({
      method: reqMethod,
      url,
      headers,
      [payloadKey]: {
        id,
        jsonrpc: '2.0',
        method,
        params: reqMethod === 'POST'
          ? params
          : JSON.stringify(params),
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

  return service as RPCClient<T>
}
