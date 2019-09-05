import React, { useCallback } from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { createStore, Dispatch } from 'redux'
import { pack } from './pack'
import { TStateSelector } from './TStateSelector'
import TestUtils from 'react-dom/test-utils'

describe('pack', () => {

  interface IProps {
    a: number
    b: string
    update(a: number, b: string): {
      payload: {a: number, b: string},
      type: 'CHANGE',
    }
    c: string[]
  }

  class PureComponent extends React.PureComponent<IProps> {
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

  function FunctionalComponent(props: IProps) {
    const update = useCallback(() => props.update(1, 'one'), [])

    return (
      <button onClick={update}>
        {props.a + props.b}
      </button>
    )
  }

  type LocalState = Omit<IProps, 'c' | 'update'>
  interface IState {
    localState: LocalState
  }

  function reduce(
    state: IState = {localState: {a: 0, b: ''}},
    action: any,
  ): IState {
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
        update(a: number, b: string) {
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
        update(a: number, b: string) {
          return {
            payload: {a, b},
            type: 'CHANGE',
          }
        },
      },
      FunctionalComponent,
    )
  }

  const PackedPureComponent = configurePureComponent<IState>(
    state => state.localState)

  const PackedFunctionalComponent = configureFunctionalComponent<IState>(
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
