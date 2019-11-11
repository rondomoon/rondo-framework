/* eslint @typescript-eslint/no-explicit-any: 0 */
import { createStore, SelectState, WaitMiddleware } from '@rondo.dev/redux'
import React from 'react'
import ReactDOM from 'react-dom'
import T from 'react-dom/test-utils'
import { Provider } from 'react-redux'
import { Action, AnyAction, combineReducers, Reducer, ReducersMapObject } from 'redux'
import { ThemeProvider, DefaultTheme } from 'styled-components'

interface RenderParams<State, LocalState> {
  reducers: ReducersMapObject<State, any>
  select: SelectState<State, LocalState>
}

export class TestContainer extends React.Component<{}> {
  ref = React.createRef<HTMLDivElement>()
  render() {
    return (
      <div className='test-container' ref={this.ref}>
        {this.props.children}
      </div>
    )
  }
}

export class Selector {
  constructor(
    readonly element: Element = document.body,
  ) {
    expect(this.element).toBeDefined()
  }

  static findManyByQuery(root: Element, query: string): Selector[] {
    return Array
    .from(root.querySelectorAll(query))
    .map(el => new Selector(el))
  }

  static findManyByQueryAndCondition(
    root: Element,
    query: string,
    verify: (selector: Selector) => boolean,
  ): Selector[] {
    return this.findManyByQuery(root, query)
    .filter(verify)
  }

  static findOneByQuery(root: Element, query: string): Selector {
    const result = this.findManyByQuery(root, query)
    expect(result.length).toBe(1)
    return result[0]
  }

  static findOneByQueryAndCondition(
    root: Element,
    query: string,
    verify: (selector: Selector) => boolean,
  ): Selector {
    const result = this.findManyByQueryAndCondition(root, query, verify)
    expect(result.length).toBe(1)
    return result[0]
  }

  type(value: string) {
    T.Simulate.change(this.element, {
      target: {
        value,
      } as any,
    })
  }
  click() {
    T.Simulate.click(this.element)
  }
  submit() {
    T.Simulate.submit(this.element)
  }
  findOne(selector: string): Selector {
    return Selector.findOneByQuery(this.element, selector)
  }
  findOneByContent(selector: string, content: string): Selector {
    return Selector.findOneByQueryAndCondition(
      this.element, selector, sel => sel.content() === content)
  }
  findOneByValue(selector: string, value: string): Selector {
    return Selector.findOneByQueryAndCondition(
      this.element, selector, sel => sel.value() === value)
  }
  value(): string {
    return (this.element as HTMLInputElement).value
  }
  tag(): string {
    return this.element.tagName
  }
  content(): string | null {
    return this.element.textContent
  }
}

export function select(element: Element): Selector {
  return new Selector(element)
}

export class TestUtils {
  static defaultTheme?: DefaultTheme

  /**
   * Create a redux store
   */
  readonly createStore = createStore
  readonly Utils = T

  async render(jsx: JSX.Element) {
    const $div = document.createElement('div')
    const component: TestContainer | null = await new Promise(resolve => {
      ReactDOM.render(
        <TestContainer ref={instance => resolve(instance)}>
          <ThemeProvider theme={TestUtils.defaultTheme}>
            {jsx}
          </ThemeProvider>
        </TestContainer>,
        $div,
      )
    })
    if (component === null) {
      throw new Error('TestContainer is null, this should not happen')
    }
    return {
      component,
      node: $div.children[0].children[0],
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

      const render = async (props: Props) => {
        const recorder = waitMiddleware.record()

        const jsx = createJSX
          ? createJSX(Component, props)
          : <Component {...props} />

        const result = await this.render(
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
  render: (props: Props) => Promise<{
    component: TestContainer
    node: Element
    waitForActions(timeout?: number): Promise<void>
  }>
  store: Store
  Component: Component
  withJSX: (localCreateJSX: CreateJSX)
  => Self<Props, Store, Component, CreateJSX>
}
