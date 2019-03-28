import React from 'react'
import {AnyAction} from 'redux'
import {CRUDActions, CRUDReducer} from './'
import {HTTPClientMock, TestUtils, getError} from '../test-utils'

describe('CRUD', () => {

  interface ITwo {
    id: number
    name: string
  }

  interface ITwoCreateBody {
    name: string
  }

  interface ITwoListParams {
    oneId: number
  }

  interface ITwoSpecificParams {
    oneId: number
    twoId: number
  }

  interface ITestAPI {
    '/one/:oneId/two/:twoId': {
      get: {
        params: ITwoSpecificParams
        body: ITwoCreateBody
        response: ITwo
      }
      put: {
        params: ITwoSpecificParams
        body: ITwoCreateBody
        response: ITwo
      }
      delete: {
        params: ITwoSpecificParams
        response: {id: number}
      }
    }
    '/one/:oneId/two': {
      get: {
        params: ITwoListParams
        response: ITwo[]
      }
      post: {
        params: ITwoListParams
        body: ITwoCreateBody
        response: ITwo
      }
    }
  }

  const http = new HTTPClientMock<ITestAPI>()
  const actions = CRUDActions.fromTwoRoutes({
    http,
    listRoute: '/one/:oneId/two',
    specificRoute: '/one/:oneId/two/:twoId',
    actionName: 'TEST',
  })
  const Crud = new CRUDReducer<ITwo>('TEST').reduce

  const test = new TestUtils()
  const reducer = test.combineReducers({
    Crud,
    Logger: (state: string[] = [], action: AnyAction): string[] => {
      return [...state, action.type]
    },
  })
  function getStore() {
    return test.createStore({reducer})()
  }

  afterEach(() => {
    http.mockClear()
  })

  describe('init', () => {
    it('should not fail', () => {
      getStore()
    })
  })

  describe('GET_MANY', () => {

    function getAction(store: ReturnType<typeof getStore>) {
      const action = store.dispatch(actions.getMany({
        query: {},
        params: {oneId: 1},
      }))
      const state = store.getState()
      expect(state.Crud.status.getMany.isLoading).toBe(true)
      expect(state.Logger).toEqual([
        jasmine.any(String),
        'TEST_GET_MANY_PENDING',
      ])
      return action
    }

    describe('TEST_GET_MANY_RESOLVED', () => {
      beforeEach(() => {
        http.mockAdd({
          method: 'get',
          url: '/one/1/two',
          params: {},
        }, [{id: 2, name: 'bla'}])
      })

      it('updates state', async () => {
        const store = getStore()
        const action = getAction(store)
        await action.payload
        const state = store.getState()
        expect(state.Crud.status.getMany.isLoading).toBe(false)
        expect(state.Crud.ids).toEqual([2])
        expect(state.Crud.byId[2]).toEqual({id: 2, name: 'bla'})
        expect(state.Logger).toEqual([
          jasmine.any(String),
          'TEST_GET_MANY_PENDING',
          'TEST_GET_MANY_RESOLVED',
        ])
      })
    })

    describe('TEST_GET_MANY_REJECTED', () => {
      beforeEach(() => {
        http.mockAdd({
          method: 'get',
          url: '/one/1/two',
          params: {},
        }, {error: 'Test Error'}, 400)
      })

      it('updates state', async () => {
        const store = getStore()
        const action = getAction(store)
        await getError(action.payload)
        const state = store.getState()
        expect(state.Crud.status.getMany.isLoading).toBe(false)
        // TODO use error from response
        expect(state.Crud.status.getMany.error).toBe('HTTP Status: 400')
        expect(state.Crud.ids).toEqual([])
        expect(state.Crud.byId).toEqual({})
        expect(state.Logger).toEqual([
          jasmine.any(String),
          'TEST_GET_MANY_PENDING',
          'TEST_GET_MANY_REJECTED',
        ])
      })
    })

  })

})
