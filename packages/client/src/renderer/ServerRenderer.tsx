import React from 'react'
import {Action} from 'redux'
import {IClientConfig} from './IClientConfig'
import {IRenderer} from './IRenderer'
import {IStoreFactory} from './IStoreFactory'
import {Provider} from 'react-redux'
import {renderToNodeStream} from 'react-dom/server'

export class ServerRenderer<State, A extends Action> implements IRenderer {
  constructor(
    readonly createStore: IStoreFactory<State, A | any>,
    readonly RootComponent: React.ComponentType<{config: IClientConfig}>,
  ) {}
  render(config: IClientConfig, state?: any) {
    const {RootComponent} = this
    const store = this.createStore(state)

    const stream = renderToNodeStream(
      <Provider store={store}>
        <RootComponent config={config} />
      </Provider>,
    )
    return stream
  }
}
