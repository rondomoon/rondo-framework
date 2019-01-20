import {IMethod} from '@rondo/common'

export interface IRequest {
  method: IMethod,
  url: string,
  params?: {[key: string]: any},
  data?: any,
}
