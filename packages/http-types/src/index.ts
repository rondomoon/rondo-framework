/* eslint @typescript-eslint/no-explicit-any: 0 */

export type Method = 'get'
 | 'post'
 | 'put'
 | 'delete'
 | 'patch'
 | 'head'
 | 'options'

export interface Routes {
  // has to be any because otherwise TypeScript will start
  // throwing error and interfaces without an index signature
  // would not be usable
  [route: string]: any
}

export interface Route {
  params: any
  query: any
  body: any
  response: any
}
