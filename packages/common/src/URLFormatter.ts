import assert from 'assert'
import {IRequestParams} from './IRequestParams'
import {IRequestQuery} from './IRequestQuery'

export interface IURLFormatterOptions {
  readonly baseURL: string
  readonly regex: RegExp
}

export class URLFormatter {
  constructor(readonly params: IURLFormatterOptions = {
    baseURL: '',
    regex: /:[a-zA-Z0-9-]+/g,
  }) {}

  format(
    url: string,
    params?: IRequestParams,
    query?: IRequestQuery,
  ) {
    if (!params) {
      return url
    }
    const formattedUrl = url.replace(this.params.regex, match => {
      const key = match.substring(1)
      assert(params.hasOwnProperty(key))
      return String(params![key])
    })
    if (query) {
      Object.keys(query).reduce((queryString, key) => {
        return queryString +
          encodeURIComponent(key) + '=' +
          encodeURIComponent(String(query[key])) + '&'
      }, '?')
    }

    return this.params.baseURL + formattedUrl
  }
}
