import {createStore, applyMiddleware, Store} from 'redux'
import {PromiseMiddleware} from './PromiseMiddleware'
import {getError} from '../test-utils'

describe('PromiseMiddleware', () => {

  describe('constructor', () => {
    it('throws an error when action types are the same', () => {
      expect(() => new PromiseMiddleware('a', 'a', 'a')).toThrowError()
      expect(new PromiseMiddleware('a', 'b', 'c')).toBeTruthy()
    })
  })

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
    store.dispatch(action)
    expect(store.getState().slice(1)).toEqual([action])
  })

  it('dispatches pending and resolved action', async () => {
    const value = 123
    const type = 'TEST'
    const action = {
      payload: Promise.resolve(value),
      type: `${type}_PENDING`,
    }
    const result = store.dispatch(action)
    expect(result).toBe(action)
    await result.payload
    expect(store.getState().slice(1)).toEqual([{
      ...action,
    }, {
      payload: value,
      type: type + '_RESOLVED',
    }])
  })

  it('dispatches pending and rejected action on error', async () => {
    const error = new Error('test')
    const type = 'TEST'
    const action = {
      payload: Promise.reject(error),
      type: `${type}_PENDING`,
    }
    const result = store.dispatch(action)
    expect(result).toBe(action)
    const err = await getError(result.payload)
    expect(err).toBe(error)
    expect(store.getState().slice(1)).toEqual([{
      ...action,
    }, {
      error,
      type: `${type}_REJECTED`,
    }])
  })

})
