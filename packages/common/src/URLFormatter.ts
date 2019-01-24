import assert from 'assert'
import {IRequestParams} from './IRequestParams'

export interface IURLFormatterOptions {
  readonly baseURL: string
  readonly regex: RegExp
}

export class URLFormatter {
  constructor(readonly params: IURLFormatterOptions = {
    baseURL: '',
    regex: /:[a-zA-Z0-9-]+/g,
  }) {}

  format(url: string, params?: IRequestParams) {
    if (!params) {
      return url
    }
    const formattedUrl = url.replace(this.params.regex, match => {
      const key = match.substring(1)
      assert(params.hasOwnProperty(key))
      return String(params![key])
    })

    return this.params.baseURL + formattedUrl
  }
}
