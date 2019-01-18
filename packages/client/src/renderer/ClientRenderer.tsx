import ReactDOM from 'react-dom'
import React, {Component} from 'react'
import {Provider} from 'react-redux'
import {IStoreFactory} from './IStoreFactory'
import {IRenderer} from './IRenderer'

export class ClientRenderer implements IRenderer {
  constructor(
    readonly createStore: IStoreFactory,
    readonly Component: Component,
    readonly target = document.body,
  ) {}

  render() {
    const state = (window as any).__PRELOADED_STATE__
    const {Component} = this

    if (state) {
      const store = this.createStore(state)
      ReactDOM.hydrate(
        <Provider store={store}>
          <Component />
        </Provider>,
        this.target,
      )
    } else {
      const store = this.createStore()
      ReactDOM.render(
        <Provider store={store}>
          <Component />
        </Provider>,
        this.target,
      )
    }
  }
}

