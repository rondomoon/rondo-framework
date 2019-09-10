import {TMethod} from '@rondo.dev/http-types'

export interface IRequest {
  method: TMethod,
  url: string,
  params?: {[key: string]: any},
  data?: any,
}
