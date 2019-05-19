import React from 'react'
import ssrPrepass from 'react-ssr-prepass'
import {Action} from 'redux'
import {IAPIDef} from '@rondo/common'
import {IClientConfig} from './IClientConfig'
import {IHTTPClient, HTTPClient} from '../http'
import {IRenderer} from './IRenderer'
import {Provider} from 'react-redux'
import {StaticRouterContext} from 'react-router'
import {StaticRouter} from 'react-router-dom'
import {Store} from 'redux'
import {renderToNodeStream} from 'react-dom/server'

export class ServerRenderer<A extends Action, D extends IAPIDef>
  implements IRenderer {
  constructor(
    readonly RootComponent: React.ComponentType<{
      config: IClientConfig,
      http: IHTTPClient<D>
    }>,
  ) {}
  async render<State>(
    url: string,
    store: Store<State>,
    config: IClientConfig,
    host: string = '',
    headers: Record<string, string> = {},
  ) {
    const {RootComponent} = this
    // TODO set cookie in headers here...
    const http = new HTTPClient<D>(
      'http://' + host + config.baseUrl + '/api',
      headers,
    )

    const context: StaticRouterContext = {}

    const element = (
      <Provider store={store}>
        <StaticRouter
          basename={config.baseUrl}
          location={url}
          context={context}
        >
          <RootComponent config={config} http={http} />
        </StaticRouter>
      </Provider>
    )

    console.log('prepass')
    await ssrPrepass(element, async (el, component) => {
      if (component && 'fetchData' in component) {
        await (component as any).fetchData()
      }
    })
    console.log('prepass done')
    const stream = renderToNodeStream(element)
    return stream
  }
}
