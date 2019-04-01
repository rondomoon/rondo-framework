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
    let formattedUrl = url
    if (params) {
      formattedUrl = url.replace(this.params.regex, match => {
        const key = match.substring(1)
        if (!params.hasOwnProperty(key)) {
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
