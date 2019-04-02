import {createStore, applyMiddleware, Store} from 'redux'
import {PromiseMiddleware} from './PromiseMiddleware'
import {getError} from '../test-utils'

describe('PromiseMiddleware', () => {

  let store!: Store
  beforeEach(() => {
    const middleware = new PromiseMiddleware()
    store = createStore((state: any[] = [], action) => {
      state.push(action)
      return state
    }, applyMiddleware(middleware.handle))
  })

  it('does nothing when payload is not a promise', () => {
    const action = {type: 'test'}
    const result = store.dispatch(action)
    expect(result).toBe(action)
    expect(store.getState().slice(1)).toEqual([{
      type: action.type,
    }])
  })

  it('dispatches pending and resolved action', async () => {
    const value = 123
    const type = 'TEST'
    const action = {
      payload: Promise.resolve(value),
      type,
    }
    const result = store.dispatch(action)
    expect(result).toEqual({
      ...action,
      status: 'pending',
    })
    await result.payload
    expect(store.getState().slice(1)).toEqual([{
      ...action,
      status: 'pending',
    }, {
      payload: value,
      status: 'resolved',
      type,
    }])
  })

  it('dispatches pending and rejected action on error', async () => {
    const error = new Error('test')
    const type = 'TEST'
    const action = {
      payload: Promise.reject(error),
      type,
    }
    const result = store.dispatch(action)
    expect(result).toEqual({
      ...action,
      status: 'pending',
    })
    const err = await getError(result.payload)
    expect(err).toBe(error)
    expect(store.getState().slice(1)).toEqual([{
      payload: action.payload,
      status: 'pending',
      type,
    }, {
      payload: error,
      status: 'rejected',
      type,
    }])
  })

})
