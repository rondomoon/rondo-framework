import React from 'react'
import { renderToNodeStream } from 'react-dom/server'
import { Provider } from 'react-redux'
import { StaticRouterContext } from 'react-router'
import { StaticRouter } from 'react-router-dom'
import ssrPrepass from 'react-ssr-prepass'
import { Store } from 'redux'
import { IClientConfig } from './IClientConfig'
import { IRenderer } from './IRenderer'

interface ComponentWithFetchData {
  fetchData(): Promise<unknown>
}

export class ServerRenderer<Props> implements IRenderer<Props> {
  constructor(
    readonly RootComponent: React.ComponentType<Props>,
  ) {}
  async render<State>(
    url: string,
    store: Store<State>,
    props: Props,
    config: IClientConfig,
    host = '',
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
        await (component as ComponentWithFetchData).fetchData()
      }
    })
    const stream = renderToNodeStream(element)
    return stream
  }
}
