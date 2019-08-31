import React from 'react'
import ssrPrepass from 'react-ssr-prepass'
import {Action} from 'redux'
import {IAPIDef} from '@rondo.dev/common'
import {IClientConfig} from './IClientConfig'
import {IHTTPClient, HTTPClient} from '../http'
import {IRenderer} from './IRenderer'
import {Provider} from 'react-redux'
import {StaticRouterContext} from 'react-router'
import {StaticRouter} from 'react-router-dom'
import {Store} from 'redux'
import {renderToNodeStream} from 'react-dom/server'

export class ServerRenderer<Props> implements IRenderer<Props> {
  constructor(
    readonly RootComponent: React.ComponentType<Props>,
  ) {}
  async render<State>(
    url: string,
    store: Store<State>,
    props: Props,
    config: IClientConfig,
    host: string = '',
    headers: Record<string, string> = {},
  ) {
    const {RootComponent} = this
    // TODO set cookie in headers here...

    const context: StaticRouterContext = {}

    const element = (
      <Provider store={store}>
        <StaticRouter
          basename={config.baseUrl}
          location={url}
          context={context}
        >
          <RootComponent {...props} />
        </StaticRouter>
      </Provider>
    )

    await ssrPrepass(element, async (el, component) => {
      if (component && 'fetchData' in component) {
        await (component as any).fetchData()
      }
    })
    const stream = renderToNodeStream(element)
    return stream
  }
}
