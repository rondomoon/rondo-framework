import React from 'react'
import ReactDOM from 'react-dom'
import {Action} from 'redux'
import {IRenderer} from './IRenderer'
import {IStoreFactory} from './IStoreFactory'
import {Provider} from 'react-redux'

export interface IClientRendererParams<State, A extends Action> {
  readonly createStore: IStoreFactory<State, A | any>,
  readonly RootComponent: React.ComponentType,
  readonly target?: HTMLElement
}

export class ClientRenderer<State, A extends Action> implements IRenderer {
  constructor(readonly params: IClientRendererParams<State, A>) {}

  render(state = (window as any).__PRELOADED_STATE__) {
    const {
      RootComponent,
      createStore,
      target = document.body,
    } = this.params

    if (state) {
      const store = createStore(state)
      ReactDOM.hydrate(
        <Provider store={store}>
          <RootComponent />
        </Provider>,
        target,
      )
    } else {
      const store = createStore()
      ReactDOM.render(
        <Provider store={store}>
          <RootComponent />
        </Provider>,
        target,
      )
    }
  }
}
