import {IRenderer} from './IRenderer'
import {renderToNodeStream} from 'react-dom/server'

export class ServerRenderer implements IRenderer {
  constructor(
    readonly createStore: IStoreFactory,
    readonly Component: Component,
  ) {}
  render() {
    const {Component} = this
    const store = this.createStore(state)

    const stream = renderToNodeStream(
      <Provider store={store}>
        <Component />
      </Provider>,
    )
    return stream
  }
}
