import { getError } from '@rondo.dev/test-utils'
import { applyMiddleware, createStore } from 'redux'
import { Action } from '../actions'
import { WaitMiddleware } from './WaitMiddleware'

describe('WaitMiddleware', () => {

  const getStore = (wm: WaitMiddleware) => createStore(
    (state: string[] = [], action: Action<any, string>) => {
      return [...state, action.type]
    },
    [],
    applyMiddleware(wm.handle),
  )

  describe('wait', () => {
    it('waits for certain async actions to be resolved', async () => {
      const wm = new WaitMiddleware()
      const store = getStore(wm)
      const promise = wm.wait({B: 1, C: 1})
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
      const promise = wm.wait({B: 1, C: 1}, 5)
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
      const promise = wm.wait({B: 1, C: 1})
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
      const promise = wm.wait({B: 1})
      const error = await getError(wm.wait({B: 1}))
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
      const promise = wm.wait({B: 1}, 1)
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
      await wm.wait({})
    })
  })

  describe('record', () => {

    it('records pending actions by default', async () => {
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

    it('records custom actions', async () => {
      const wm = new WaitMiddleware()
      const store = getStore(wm)
      const recorder = wm.record(
        action => action.type.startsWith('test'),
        action => action.type.startsWith('test.resolved'),
        action => action.type.startsWith('test.rejected'),
      )
      store.dispatch({type: 'test1'} as any)
      store.dispatch({type: 'tes'} as any)
      store.dispatch({type: 'test3'} as any)
      expect(recorder.getActionTypes()).toEqual({
        test1: 1,
        test3: 1,
      })
    })

    it('does not wait for actions that have already resolved', async () => {
      const wm = new WaitMiddleware()
      const store = getStore(wm)
      const recorder = wm.record()
      store.dispatch({
        payload: undefined,
        type: 'B',
        status: 'pending',
      })
      store.dispatch({
        payload: undefined,
        type: 'B',
        status: 'resolved',
      })
      await wm.waitForRecorded(recorder)
    })

    it('errors out if an action is rejected', async () => {
      const wm = new WaitMiddleware()
      const store = getStore(wm)
      const recorder = wm.record()
      store.dispatch({
        payload: undefined,
        type: 'B',
        status: 'pending',
      })
      const error = new Error('test')
      store.dispatch({
        payload: error,
        type: 'A',
        status: 'rejected',
      })
      const error2 = await getError(wm.waitForRecorded(recorder))
      expect(error2).toBe(error)
    })
  })

})
