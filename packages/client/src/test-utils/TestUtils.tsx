import React from 'react'
import ReactDOM from 'react-dom'
import T from 'react-dom/test-utils'
import {IStateSelector} from '../redux'
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

interface IRenderParams<State, LocalState> {
  reducers: ReducersMapObject<State, any>
  select: IStateSelector<State, LocalState>
  // getComponent: (
  //   select: IStateSelector<State, LocalState>) => React.ComponentType<Props>,
  // customJSX?: (
  //   Component: React.ComponentType<Props>,
  //   props: Props,
  // ) => JSX.Element
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
  withProvider<State, LocalState, A extends Action<any> = AnyAction>(
    params: IRenderParams<State, LocalState>,
  ) {
    const {reducers, select} = params

    let store = this.createStore({
      reducer: this.combineReducers(reducers),
    })()

    const withState = (state: DeepPartial<State>) => {
      store = this.createStore({
        reducer: this.combineReducers(reducers),
      })(state)

      return {withComponent}
    }

    const withComponent = <Props extends {}>(
      getComponent: (select: IStateSelector<State, LocalState>) =>
        React.ComponentType<Props>,
    ) => {
      const Component = getComponent(select)

      type CreateJSX = (
        Component: React.ComponentType<Props>,
        props: Props,
      ) => JSX.Element

      let createJSX: CreateJSX | undefined

      const render = (props: Props) => {
        const jsx = createJSX
          ? createJSX(Component, props)
          : <Component {...props} />
        return this.render(
          <Provider store={store}>
            {jsx}
          </Provider>,
        )
      }

      const withJSX = (localCreateJSX: CreateJSX) => {
        createJSX = localCreateJSX
        return self
      }

      const self = {
        render,
        store,
        Component,
        withJSX,
      }

      return self
    }

    return {withState, withComponent}
  }
}
