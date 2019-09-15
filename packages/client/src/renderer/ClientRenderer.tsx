import { createBrowserHistory } from 'history'
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { Router } from 'react-router-dom'
import { Store } from 'redux'
import { ClientConfig } from './ClientConfig'
import { Renderer } from './Renderer'

export interface ClientRendererParams<Props> {
  readonly RootComponent: React.ComponentType<Props>
  readonly target?: HTMLElement
  readonly hydrate: boolean // TODO make this better
}

export class ClientRenderer<Props>
  implements Renderer<Props> {
  constructor(readonly params: ClientRendererParams<Props>) {}

  render<State>(
    url: string,
    store: Store<State>,
    props: Props,
    config: ClientConfig,
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
