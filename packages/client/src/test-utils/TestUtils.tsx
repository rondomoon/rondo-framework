/* eslint @typescript-eslint/no-explicit-any: 0 */
import React from 'react'
import ReactDOM from 'react-dom'
import {createStore, SelectState, WaitMiddleware} from '@rondo.dev/redux'
import {Provider} from 'react-redux'
import {
  Action,
  AnyAction,
  DeepPartial,
  Reducer,
  ReducersMapObject,
  combineReducers,
} from 'redux'

interface RenderParams<State, LocalState> {
  reducers: ReducersMapObject<State, any>
  select: SelectState<State, LocalState>
}

export class TestContainer extends React.Component<{}> {
  ref = React.createRef<HTMLDivElement>()
  render() {
    return <div ref={this.ref}>{this.props.children}</div>
  }
}

export class TestUtils {
  /**
   * Create a redux store
   */
  readonly createStore = createStore

  render(jsx: JSX.Element) {
    const $div = document.createElement('div')
    const component = ReactDOM.render(
      <TestContainer>{jsx}</TestContainer>, $div) as unknown as TestContainer
    const node = component.ref.current!.children[0]
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
    params: RenderParams<State, LocalState>,
  ) {
    const {reducers, select} = params

    const waitMiddleware = new WaitMiddleware()

    let store = this.createStore({
      reducer: this.combineReducers(reducers),
      extraMiddleware: [waitMiddleware.handle],
    })

    const withState = (state: Partial<State>) => {
      store = this.createStore({
        reducer: this.combineReducers(reducers),
        state,
      })

      return {withComponent}
    }

    const withComponent = <Props extends {}>(
      getComponent: (select: SelectState<State, LocalState>) =>
        React.ComponentType<Props>,
    ) => {
      const Component = getComponent(select)

      type CreateJSX = (
        Component: React.ComponentType<Props>,
        props: Props,
      ) => JSX.Element

      let createJSX: CreateJSX | undefined

      const render = (props: Props) => {
        const recorder = waitMiddleware.record()

        const jsx = createJSX
          ? createJSX(Component, props)
          : <Component {...props} />

        const result = this.render(
          <Provider store={store}>
            {jsx}
          </Provider>,
        )
        return {
          ...result,
          async waitForActions(timeout = 2000) {
            await waitMiddleware.waitForRecorded(recorder, timeout)
          },
        }
      }

      const withJSX = (localCreateJSX: CreateJSX) => {
        createJSX = localCreateJSX
        return self
      }

      const self: Self<
        Props, typeof store, typeof Component, CreateJSX
      > = {
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

interface Self<Props, Store, Component, CreateJSX> {
  render: (props: Props) => {
    component: TestContainer
    node: Element
    waitForActions(timeout?: number): Promise<void>
  }
  store: Store
  Component: Component
  withJSX: (localCreateJSX: CreateJSX)
  => Self<Props, Store, Component, CreateJSX>
}
