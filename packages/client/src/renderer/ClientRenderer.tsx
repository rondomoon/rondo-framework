import React from 'react'
import ReactDOM from 'react-dom'
import {Action} from 'redux'
import {IClientConfig} from './IClientConfig'
import {IRenderer} from './IRenderer'
import {TStoreFactory} from './TStoreFactory'
import {Provider} from 'react-redux'
import {Router} from 'react-router-dom'
import {createBrowserHistory} from 'history'

export interface IClientRendererParams<State, A extends Action> {
  readonly createStore: TStoreFactory<State, A | any>,
  readonly RootComponent: React.ComponentType<{config: IClientConfig}>,
  readonly target?: HTMLElement
}

export class ClientRenderer<State, A extends Action> implements IRenderer {
  constructor(readonly params: IClientRendererParams<State, A>) {}

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

    const history = createBrowserHistory({
      basename: config.baseUrl,
    })

    if (state) {
      const store = createStore(state)
      ReactDOM.hydrate(
        <Provider store={store}>
          <Router history={history}>
            <RootComponent config={config} />
          </Router>
        </Provider>,
        target,
      )
    } else {
      const store = createStore()
      ReactDOM.render(
        <Provider store={store}>
          <Router history={history}>
            <RootComponent config={config} />
          </Router>
        </Provider>,
        target,
      )
    }
  }
}
