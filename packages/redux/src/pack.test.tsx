import React, { useCallback } from 'react'
import ReactDOM from 'react-dom'
import TestUtils from 'react-dom/test-utils'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import { pack, TStateSelector } from './pack'

describe('pack', () => {

  interface ChangeAction {
    payload: {a: number, b: string}
    type: 'CHANGE'
  }

  interface Props {
    a: number
    b: string
    update(a: number, b: string): ChangeAction
    c: string[]
  }

  class PureComponent extends React.PureComponent<Props> {
    update = () => {
      this.props.update(1, 'one')
    }
    render() {
      return (
        <button onClick={this.update}>
          {this.props.a + this.props.b}
        </button>
      )

      return this.props.a + this.props.b
    }
  }

  function FunctionalComponent(props: Props) {
    const update = useCallback(() => props.update(1, 'one'), [])

    return (
      <button onClick={update}>
        {props.a + props.b}
      </button>
    )
  }

  type LocalState = Omit<Props, 'c' | 'update'>
  interface State {
    localState: LocalState
  }

  function reduce(
    state: State = {localState: {a: 0, b: ''}},
    action: any,
  ): State {
    switch (action.type) {
      case 'CHANGE':
        return {
          ...state,
          localState: {
            ...action.payload,
          },
        }
      default:
        return state
    }
  }

  function configurePureComponent<State>(
    getLocalState: TStateSelector<State, LocalState>,
  ) {
    return pack(
      getLocalState,
      (localState: LocalState) => localState,
      {
        update(a: number, b: string): ChangeAction {
          return {
            payload: {a, b},
            type: 'CHANGE',
          }
        },
      },
      PureComponent,
    )
  }

  function configureFunctionalComponent<State>(
    getLocalState: TStateSelector<State, LocalState>,
  ) {
    return pack(
      getLocalState,
      (localState: LocalState) => localState,
      {
        update(a: number, b: string): ChangeAction {
          return {
            payload: {a, b},
            type: 'CHANGE',
          }
        },
      },
      FunctionalComponent,
    )
  }

  const PackedPureComponent = configurePureComponent<State>(
    state => state.localState)

  const PackedFunctionalComponent = configureFunctionalComponent<State>(
    state => state.localState)

  it('creates a connected component', () => {
    const store = createStore(reduce)
    const element = document.createElement('div')!
    ReactDOM.render(
      <Provider store={store}>
        <PackedPureComponent c={['test']} />
      </Provider>,
      element,
    )
    expect(element.textContent).toBe('0')
    TestUtils.Simulate.click(element.querySelector('button')!)
    expect(element.textContent).toBe('1one')
  })

  it('should work with functional components', () => {
    const store = createStore(reduce)
    const element = document.createElement('div')!
    ReactDOM.render(
      <Provider store={store}>
        <PackedFunctionalComponent c={['test']} />
      </Provider>,
      element,
    )
    expect(element.textContent).toBe('0')
    TestUtils.Simulate.click(element.querySelector('button')!)
    expect(element.textContent).toBe('1one')
  })

})
