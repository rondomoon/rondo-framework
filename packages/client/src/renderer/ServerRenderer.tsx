import React from 'react'
import {IRenderer} from './IRenderer'
import {IStoreFactory} from './IStoreFactory'
import {Provider} from 'react-redux'
import {renderToNodeStream} from 'react-dom/server'

export class ServerRenderer implements IRenderer {
  constructor(
    readonly createStore: IStoreFactory,
    readonly RootComponent: React.ComponentType,
  ) {}
  render(state?: any) {
    const {RootComponent} = this
    const store = this.createStore(state)

    const stream = renderToNodeStream(
      <Provider store={store}>
        <RootComponent />
      </Provider>,
    )
    return stream
  }
}
