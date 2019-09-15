import {Method} from '@rondo.dev/http-types'

export interface Request {
  method: Method
  url: string
  params?: {[key: string]: any}
  data?: any
}
