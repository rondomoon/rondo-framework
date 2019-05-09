import {WaitMiddleware} from './WaitMiddleware'
import {
  IAction, IPendingAction, IResolvedAction, IRejectedAction,
} from '../actions'
import {applyMiddleware, createStore, AnyAction} from 'redux'
import {getError} from '../test-utils'

describe('WaitMiddleware', () => {

  const getStore = (wm: WaitMiddleware) => createStore(
    (state: string[] = [], action: IAction<any, string>) => {
      return [...state, action.type]
    },
    [],
    applyMiddleware(wm.handle),
  )

  describe('wait', () => {
    it('waits for certain async actions to be resolved', async () => {
      const wm = new WaitMiddleware()
      const store = getStore(wm)
      const promise = wm.wait(['B', 'C'])
      store.dispatch({
        payload: undefined,
        type: 'A',
        status: 'resolved',
      })
      store.dispatch({
        payload: undefined,
        type: 'B',
        status: 'resolved',
      })
      store.dispatch({
        payload: undefined,
        type: 'C',
        status: 'resolved',
      })
      await promise
      expect(store.getState().slice(1)).toEqual(['A', 'B', 'C'])
    })

    it('times out when actions do not happen', async () => {
      const wm = new WaitMiddleware()
      const store = getStore(wm)
      const promise = wm.wait(['B', 'C'], 5)
      store.dispatch({
        payload: undefined,
        type: 'A',
        status: 'resolved',
      })
      store.dispatch({
        payload: undefined,
        type: 'B',
        status: 'resolved',
      })
      const error = await getError(promise)
      expect(error.message).toMatch(/timed/)
    })

    it('errors out when a promise is rejected', async () => {
      const wm = new WaitMiddleware()
      const store = getStore(wm)
      const promise = wm.wait(['B', 'C'])
      store.dispatch({
        payload: undefined,
        type: 'A',
        status: 'resolved',
      })
      store.dispatch({
        payload: new Error('test'),
        type: 'B',
        status: 'rejected',
      })
      const error = await getError(promise)
      expect(error.message).toMatch(/test/)
    })

    it('errors out when wait is called twice', async () => {
      const wm = new WaitMiddleware()
      const store = getStore(wm)
      const promise = wm.wait(['B'])
      const error = await getError(wm.wait(['B']))
      expect(error.message).toMatch(/already waiting/)
      store.dispatch({
        payload: new Error('test'),
        type: 'B',
        status: 'resolved',
      })
      await promise
    })

    it('does nothing when pending is dispatched', async () => {
      const wm = new WaitMiddleware()
      const store = getStore(wm)
      const promise = wm.wait(['B'], 1)
      store.dispatch({
        payload: undefined,
        type: 'B',
        status: 'pending',
      })
      const error = await getError(promise)
      expect(error.message).toMatch(/timed/)
    })

    it('resolved immediately when no actions are defined', async () => {
      const wm = new WaitMiddleware()
      await wm.wait([])
    })
  })

  describe('record', () => {

    it('records pending actions', async () => {
      const wm = new WaitMiddleware()
      const store = getStore(wm)
      const recorder = wm.record()
      store.dispatch({
        payload: undefined,
        type: 'B',
        status: 'pending',
      })
      const promise = wm.waitForRecorded(recorder)
      store.dispatch({
        payload: undefined,
        type: 'B',
        status: 'resolved',
      })
      await promise
    })
  })

})
