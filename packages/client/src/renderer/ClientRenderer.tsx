import React from 'react'
import ReactDOM from 'react-dom'
import {Action} from 'redux'
import {IAPIDef} from '@rondo/common'
import {IClientConfig} from './IClientConfig'
import {IHTTPClient, HTTPClient} from '../http'
import {IRenderer} from './IRenderer'
import {Provider} from 'react-redux'
import {Router} from 'react-router-dom'
import {TStoreFactory} from './TStoreFactory'
import {createBrowserHistory} from 'history'

export interface IClientRendererParams<
  State, A extends Action, D extends IAPIDef> {
  readonly createStore: TStoreFactory<State, A | any>,
  readonly RootComponent: React.ComponentType<{
    config: IClientConfig,
    http: IHTTPClient<D>
  }>,
  readonly target?: HTMLElement
}

export class ClientRenderer<State, A extends Action, D extends IAPIDef>
  implements IRenderer {
  constructor(readonly params: IClientRendererParams<State, A, D>) {}

  render(
    url: string,
    config = (window as any).__APP_CONFIG__ as IClientConfig,
    state = (window as any).__PRELOADED_STATE__,
  ) {
    const {
      RootComponent,
      createStore,
      target = document.getElementById('container'),
    } = this.params

    const http = new HTTPClient<D>(config.baseUrl + '/api')

    const history = createBrowserHistory({
      basename: config.baseUrl,
    })

    if (state) {
      const store = createStore(state)
      ReactDOM.hydrate(
        <Provider store={store}>
          <Router history={history}>
            <RootComponent config={config} http={http} />
          </Router>
        </Provider>,
        target,
      )
    } else {
      const store = createStore()
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
