import React from 'react'
import ReactDOM from 'react-dom'
import {Action} from 'redux'
import {IAPIDef} from '@rondo/common'
import {IClientConfig} from './IClientConfig'
import {IHTTPClient, HTTPClient} from '../http'
import {IRenderer} from './IRenderer'
import {Provider} from 'react-redux'
import {Router} from 'react-router-dom'
import {Store} from 'redux'
import {createBrowserHistory} from 'history'

export interface IClientRendererParams<A extends Action, D extends IAPIDef> {
  readonly RootComponent: React.ComponentType<{
    config: IClientConfig,
    http: IHTTPClient<D>
  }>,
  readonly target?: HTMLElement
  readonly hydrate: boolean // TODO make this better
}

export class ClientRenderer<A extends Action, D extends IAPIDef>
  implements IRenderer {
  constructor(readonly params: IClientRendererParams<A, D>) {}

  render<State>(
    url: string,
    store: Store<State>,
    config = (window as any).__APP_CONFIG__ as IClientConfig,
  ) {
    const {
      RootComponent,
      target = document.getElementById('container'),
    } = this.params

    const http = new HTTPClient<D>(config.baseUrl + '/api', {
      'x-csrf-token': config.csrfToken,
    })

    const history = createBrowserHistory({
      basename: config.baseUrl,
    })

    if (this.params.hydrate) {
      ReactDOM.hydrate(
        <Provider store={store}>
          <Router history={history}>
            <RootComponent config={config} http={http} />
          </Router>
        </Provider>,
        target,
      )
    } else {
      ReactDOM.render(
        <Provider store={store}>
          <Router history={history}>
            <RootComponent config={config} http={http} />
          </Router>
        </Provider>,
        target,
      )
    }
  }
}
