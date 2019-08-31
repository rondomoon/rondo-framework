import {IJSONRPCReturnType} from './express'
import {Contextual, TAsyncified, TReduxed} from './types'
import {createActions} from './redux'
import {createLocalClient, LocalClient} from './local'

function keys<T>(obj: T): Array<keyof T & string> {
  return Object.keys(obj) as Array<keyof T & string>
}

export type BulkServices<T, Cx> = {
  [K in keyof T & string]: Contextual<T[K], Cx>
}
export type BulkLocalClient<T> = {[K in keyof T & string]: LocalClient<T[K]>}
export type BulkActions<T> = {[K in keyof T & string]: TReduxed<T[K], K>}
export type BulkClient<T> = {[K in keyof T & string]: TAsyncified<T[K]>}

function bulkCreate<T, R>(
  src: T,
  mapValue: <K extends keyof T & string>(key: K, value: T[K]) => any,
) {
  return keys(src).reduce((obj, key) => {
    const value = mapValue(key, src[key])
    obj[key] = value
    return obj
  }, {} as any)
}

export function bulkCreateLocalClient<Cx, T extends Contextual<{}, Cx>>(
  src: T,
  context: Cx,
): BulkLocalClient<T> {
  return bulkCreate(src, (key, value) => createLocalClient(value, context))
}

export function bulkCreateActions<T extends Record<string, TAsyncified<any>>>(
  src: T,
): BulkActions<T> {
  return bulkCreate(src, (key, value) => createActions(value, key))
}

export function bulkjsonrpc<T>(
  jsonrpc: IJSONRPCReturnType,
  services: T,
) {
  keys(services).forEach(key => {
    const service = services[key]
    jsonrpc.addService('/' + key, service)
  })

  return jsonrpc.router()
}
