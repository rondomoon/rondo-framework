import {UrlWithStringQuery} from 'url'
import {ConnectionOptions} from 'typeorm'

export interface IConfig {
  readonly app: {
    readonly name: string
    readonly baseUrl: UrlWithStringQuery
    readonly context: string
    readonly assets: string[]
    readonly session: {
      readonly name: string
      readonly secret: string | string[]
    }
    readonly db: ConnectionOptions
  }
}
