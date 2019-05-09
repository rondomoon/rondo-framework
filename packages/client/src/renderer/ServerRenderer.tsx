import React from 'react'
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
  render<State>(
    url: string,
    store: Store<State>,
    config: IClientConfig,
    host: string = '',
  ) {
    const {RootComponent} = this
    const http = new HTTPClient<D>(host + config.baseUrl + '/api')

    const context: StaticRouterContext = {}
    const stream = renderToNodeStream(
      <Provider store={store}>
        <StaticRouter
          basename={config.baseUrl}
          location={url}
          context={context}
        >
          <RootComponent config={config} http={http} />
        </StaticRouter>
      </Provider>,
    )
    return stream
  }
}
