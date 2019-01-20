import React from 'react'
import ReactDOM from 'react-dom'
import T from 'react-dom/test-utils'
import {Connector, IStateSelector} from '../redux'
import {Provider} from 'react-redux'
import {PromiseMiddleware} from '../middleware'
import {
  Action,
  AnyAction,
  DeepPartial,
  Middleware,
  Reducer,
  ReducersMapObject,
  Store,
  applyMiddleware,
  combineReducers,
  createStore,
} from 'redux'

interface IStoreParams<State, A extends Action<any>> {
  reducer: Reducer<State, A>
  state?: DeepPartial<State>
  middleware?: Middleware[]
}

interface IRenderParams<State> {
  reducers: ReducersMapObject<State, any>
  state?: DeepPartial<State>
  connector: Connector
  select: IStateSelector<State, any>
}

export class TestUtils {
  render(jsx: JSX.Element) {
    const component = T.renderIntoDocument(jsx) as React.Component<any>
    const node = ReactDOM.findDOMNode(component)
    return {component, node}
  }

  combineReducers<S>(reducers: ReducersMapObject<S, any>): Reducer<S>
  combineReducers<S, A extends Action = AnyAction>(
    reducers: ReducersMapObject<S, A>,
  ): Reducer<S, A> {
    return combineReducers(reducers)
  }

  createStore<State, A extends Action<any> = AnyAction>(
    params: IStoreParams<State, A>,
  ): Store<State, A> {
    const middleware = params.middleware || [new PromiseMiddleware().handle]
    return createStore(
      params.reducer,
      params.state,
      applyMiddleware(...middleware),
    )
  }

  withProvider<State, A extends Action<any> = AnyAction>(
    params: IRenderParams<State>,
  ) {
    const store = this.createStore({
      reducer: this.combineReducers(params.reducers),
      state: params.state,
    })
    const Component = params.connector.connect(params.select)

    const render = () => {
      return this.render(
        <Provider store={store}>
          <Component />
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
