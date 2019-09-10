import React from 'react'
import ReactDOM from 'react-dom'
import {Action} from 'redux'
import {IAPIDef} from '@rondo.dev/common'
import {IClientConfig} from './IClientConfig'
import {IHTTPClient, HTTPClient} from '@rondo.dev/http-client'
import {IRenderer} from './IRenderer'
import {Provider} from 'react-redux'
import {Router} from 'react-router-dom'
import {Store} from 'redux'
import {createBrowserHistory} from 'history'

export interface IClientRendererParams<Props> {
  readonly RootComponent: React.ComponentType<Props>
  readonly target?: HTMLElement
  readonly hydrate: boolean // TODO make this better
}

export class ClientRenderer<Props>
  implements IRenderer<Props> {
  constructor(readonly params: IClientRendererParams<Props>) {}

  render<State>(
    url: string,
    store: Store<State>,
    props: Props,
    config: IClientConfig,
  ) {
    const {
      RootComponent,
      target = document.getElementById('container'),
    } = this.params

    const history = createBrowserHistory({
      basename: config.baseUrl,
    })

    if (this.params.hydrate) {
      ReactDOM.hydrate(
        <Provider store={store}>
          <Router history={history}>
            <RootComponent {...props} />
          </Router>
        </Provider>,
        target,
      )
    } else {
      ReactDOM.render(
        <Provider store={store}>
          <Router history={history}>
            <RootComponent {...props} />
          </Router>
        </Provider>,
        target,
      )
    }
  }
}
