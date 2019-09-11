import { FunctionPropertyNames, TAsyncified } from './types'

export type TMocked<T> = {
  [K in keyof T]:
    T[K] extends (...args: infer A) => infer R
    ? jest.Mock<R, A>
    : never
}

/**
 * Creates an object with methods mocked using jest. This methods should not
 * be exported in this module because it adds a dependency to jest, which is
 * a dev dependency.
 *
 * During tests, users should require this method by writing:
 *
 *     import createClientMock from '@rondo.dev/jsonrpc/lib/createClientMock'
 *
 * @private
 */
export default function createClientMock<T extends object>(
  methods: Array<FunctionPropertyNames<T>>,
): [TAsyncified<T>, TMocked<TAsyncified<T>>] {
  const client = methods
  .reduce((obj, prop) => {
    obj[prop] = jest.fn()
    return obj
  }, {} as any)

  return [
    client as TAsyncified<T>,
    client as TMocked<TAsyncified<T>>,
  ]
}