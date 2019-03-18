import React from 'react'
import ReactDOM from 'react-dom'
import T from 'react-dom/test-utils'
import {Connector, IStateSelector} from '../redux'
import {Provider} from 'react-redux'
import {createStore} from '../store'
import {
  Action,
  AnyAction,
  DeepPartial,
  Reducer,
  ReducersMapObject,
  combineReducers,
} from 'redux'

interface IRenderParams<State> {
  reducers: ReducersMapObject<State, any>
  state?: DeepPartial<State>
  connector: Connector<any>
  select: IStateSelector<State, any>
}

export class TestUtils {
  /**
   * Create a redux store
   */
  readonly createStore = createStore

  render(jsx: JSX.Element) {
    const component = T.renderIntoDocument(jsx) as React.Component<any>
    const node = ReactDOM.findDOMNode(component) as Element
    return {component, node}
  }

  combineReducers<S>(reducers: ReducersMapObject<S, any>): Reducer<S>
  combineReducers<S, A extends Action = AnyAction>(
    reducers: ReducersMapObject<S, A>,
  ): Reducer<S, A> {
    return combineReducers(reducers)
  }

  /**
   * Creates a redux store, connects a component, and provides the `render`
   * method to render the connected component with a `Provider`.
   */
  withProvider<State, A extends Action<any> = AnyAction>(
    params: IRenderParams<State>,
  ) {
    const store = this.createStore({
      reducer: this.combineReducers(params.reducers),
    })(params.state)
    const Component = params.connector.connect(params.select)

    const render = (additionalProps: {[key: string]: any} = {}) => {
      return this.render(
        <Provider store={store}>
          <Component {...additionalProps} />
        </Provider>,
      )
    }

    return {
      render,
      store,
      Component,
    }
  }
}
