import {RequestParams} from './RequestParams'
import {RequestQuery} from './RequestQuery'

export interface URLFormatterOptions {
  readonly baseURL: string
  readonly regex: RegExp
}

export class URLFormatter {
  constructor(readonly params: URLFormatterOptions = {
    baseURL: '',
    regex: /:[a-zA-Z0-9-]+/g,
  }) {}

  format(
    url: string,
    params?: RequestParams,
    query?: RequestQuery,
  ) {
    let formattedUrl = url
    if (params) {
      formattedUrl = url.replace(this.params.regex, match => {
        const key = match.substring(1)
        if (!Object.prototype.hasOwnProperty.call(params, key)) {
          throw new Error('Undefined URL paramter: ' + key)
        }
        return String(params![key])
      })
    }
    let qs = ''
    if (query) {
      qs = Object.keys(query).reduce((queryString, key) => {
        return queryString +
          encodeURIComponent(key) + '=' +
          encodeURIComponent(String(query[key])) + '&'
      }, '?')
      .replace(/&$/, '')
    }

    return this.params.baseURL + formattedUrl + qs
  }
}
