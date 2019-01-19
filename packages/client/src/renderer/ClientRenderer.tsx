import ReactDOM from 'react-dom'
import React from 'react'
import {Provider} from 'react-redux'
import {IStoreFactory} from './IStoreFactory'
import {IRenderer} from './IRenderer'

export class ClientRenderer implements IRenderer {
  constructor(
    readonly createStore: IStoreFactory,
    readonly RootComponent: React.ComponentType,
    readonly target = document.body,
  ) {}

  render(state = (window as any).__PRELOADED_STATE__) {
    const {RootComponent} = this

    if (state) {
      const store = this.createStore(state)
      ReactDOM.hydrate(
        <Provider store={store}>
          <RootComponent />
        </Provider>,
        this.target,
      )
    } else {
      const store = this.createStore()
      ReactDOM.render(
        <Provider store={store}>
          <RootComponent />
        </Provider>,
        this.target,
      )
    }
  }
}
