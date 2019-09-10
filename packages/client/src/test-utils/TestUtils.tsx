import React from 'react'
import ReactDOM from 'react-dom'
import T from 'react-dom/test-utils'
import {createStore, TStateSelector, WaitMiddleware} from '@rondo.dev/redux'
import {Provider} from 'react-redux'
import {
  Action,
  AnyAction,
  DeepPartial,
  Reducer,
  ReducersMapObject,
  combineReducers,
  Store as ReduxStore,
  Unsubscribe,
} from 'redux'
import { format } from 'util'

interface IRenderParams<State, LocalState> {
  reducers: ReducersMapObject<State, any>
  select: TStateSelector<State, LocalState>
  // getComponent: (
  //   select: TStateSelector<State, LocalState>) => React.ComponentType<Props>,
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
    const $div = document.createElement('div')
    const component = ReactDOM.render(
      <div>{jsx}</div>, $div) as unknown as React.Component<any>
    const node = (ReactDOM.findDOMNode(component) as Element).children[0]
    return {
      component,
      node,
    }
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

    const waitMiddleware = new WaitMiddleware()
    const recorder = waitMiddleware.record()

    let store = this.createStore({
      reducer: this.combineReducers(reducers),
      extraMiddleware: [waitMiddleware.handle],
    })()

    const withState = (state: DeepPartial<State>) => {
      store = this.createStore({
        reducer: this.combineReducers(reducers),
      })(state)

      return {withComponent}
    }

    const withComponent = <Props extends {}>(
      getComponent: (select: TStateSelector<State, LocalState>) =>
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

      const self: ISelf<
        Props, typeof store, typeof Component, CreateJSX
        > = {
        render,
        store,
        Component,
        withJSX,
        async waitForActions() {
          await waitMiddleware.waitForRecorded(recorder, 2000)
        },
      }

      return self
    }

    return {withState, withComponent}
  }
}

interface ISelf<Props, Store, Component, CreateJSX> {
  render: (props: Props) => ReturnType<TestUtils['render']>
  store: Store
  Component: Component
  withJSX: (localCreateJSX: CreateJSX)
  => ISelf<Props, Store, Component, CreateJSX>
  waitForActions(): Promise<void>
}
