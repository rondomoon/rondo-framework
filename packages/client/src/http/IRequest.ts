import {TMethod} from '@rondo.dev/common'

export interface IRequest {
  method: TMethod,
  url: string,
  params?: {[key: string]: any},
  data?: any,
}
