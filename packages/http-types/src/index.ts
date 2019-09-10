export type TMethod = 'get'
 | 'post'
 | 'put'
 | 'delete'
 | 'patch'
 | 'head'
 | 'options'

export interface IRoutes {
  // has to be any because otherwise TypeScript will start
  // throwing error and interfaces without an index signature
  // would not be usable
  [route: string]: any
}

export interface IRoute {
  params: any
  query: any
  body: any
  response: any
}
