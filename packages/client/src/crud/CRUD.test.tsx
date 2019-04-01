import React from 'react'
import {AnyAction} from 'redux'
import {CRUDActions, CRUDReducer, ICRUDMethod} from './'
import {HTTPClientMock, TestUtils, getError} from '../test-utils'
import {IMethod} from '@rondo/common'
import {IPendingAction} from '../actions'

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
        response: ITwo
      }
      put: {
        params: ITwoSpecificParams
        body: ITwoCreateBody
        response: ITwo
      }
      delete: {
        params: ITwoSpecificParams
        response: {id: number} // TODO return ITwoSpecificParams
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
  const crudReducer = new CRUDReducer<ITwo>('TEST')
  const Crud = crudReducer.reduce

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

  type Store = ReturnType<typeof getStore>

  afterEach(() => {
    http.mockClear()
  })

  describe('init', () => {
    it('should not fail', () => {
      getStore()
    })
  })

  function expectActions(actionTypes: string[]) {
    const state = store.getState()
    // first action is redux initializer
    expect(state.Logger.slice(1)).toEqual(actionTypes)
  }

  let store: Store
  beforeEach(() => {
    store = getStore()
  })

  function dispatch(
    method: ICRUDMethod,
    action: IPendingAction<unknown, string>,
  ) {
    store.dispatch(action)
    expect(store.getState().Crud.status[method].isLoading).toBe(true)
    expectActions([action.type])
    return action
  }

  function getUrl(method: ICRUDMethod) {
    return method === 'post' || method === 'getMany'
      ? '/one/1/two'
      : '/one/1/two/2'
  }

  function getHTTPMethod(method: ICRUDMethod): IMethod {
    return method === 'getMany' ? 'get' : method
  }

  describe('Promise rejections', () => {
    const testCases: Array<{
      method: ICRUDMethod
      params: any
    }> = [{
      method: 'get',
      params: {
        params: {oneId: 1, twoId: 2},
      },
    }, {
      method: 'getMany',
      params: {
        params: {oneId: 1},
      },
    }, {
      method: 'post',
      params: {
        body: {name: 'test'},
        params: {oneId: 1, twoId: 2},
      },
    }, {
      method: 'put',
      params: {
        body: {name: 'test'},
        params: {oneId: 1, twoId: 2},
      },
    }, {
      method: 'delete',
      params: {
        body: {},
        params: {oneId: 1, twoId: 2},
      },
    }]

    testCases.forEach(testCase => {

      const {method} = testCase
      describe(method, () => {
        beforeEach(() => {
          http.mockAdd({
            url: getUrl(method),
            method: getHTTPMethod(method),
            data: method === 'put' || method === 'post' || method === 'delete'
              ? testCase.params.body
            : undefined,
          }, {error: 'Test Error'}, 400)
        })

        it(`updates status on error: ${method}`, async () => {
          const action = actions[method](testCase.params)
          dispatch(testCase.method, action)
          await getError(action.payload)
          const state = store.getState()
          expect(state.Crud.byId).toEqual({})
          expect(state.Crud.ids).toEqual([])
          expect(state.Crud.status[method].isLoading).toBe(false)
          // TODO use error from response
          expect(state.Crud.status[method].error).toEqual('HTTP Status: 400')
          expectActions([
            action.type,
            action.type.replace(/_PENDING$/, '_REJECTED'),
          ])
        })
      })

    })

  })

  describe('Resolved promises', () => {
    const entity = {id: 100, name: 'test'}

    const testCases: Array<{
      method: ICRUDMethod
      params: any
      body?: any
      response: any
    }> = [{
      method: 'getMany',
      params: {oneId: 1, twoId: 2},
      response: [entity],
    }, {
      method: 'get',
      params: {oneId: 1, twoId: 2},
      response: entity,
    }, {
      method: 'post',
      params: {oneId: 1},
      body: {name: entity.name},
      response: entity,
    }, {
      method: 'put',
      params: {oneId: 1, twoId: 2},
      body: {name: entity.name},
      response: entity,
    }, {
      method: 'delete',
      params: {oneId: 1, twoId: 2},
      response: {id: entity.id},
    }]

    testCases.forEach(testCase => {
      const {method} = testCase

      describe(method, () => {
        beforeEach(() => {
          http.mockAdd({
            url: getUrl(method),
            method: getHTTPMethod(method),
            data: testCase.body,
          }, testCase.response)
        })

        afterEach(() => {
          http.mockClear()
        })

        it('updates state', async () => {
          const action = dispatch(testCase.method, actions[method]({
            query: undefined,
            params: testCase.params,
            body: testCase.body,
          }))
          await action.payload
          const state = store.getState()
          expect(state.Crud.status.getMany.isLoading).toBe(false)
          if (method === 'delete') {
            expect(state.Crud.ids).toEqual([])
            expect(state.Crud.byId[entity.id]).toBe(undefined)
          } else {
            if (method !== 'put') {
              expect(state.Crud.ids).toEqual([entity.id])
            }
            expect(state.Crud.byId[entity.id]).toEqual(entity)
          }
        })
      })
    })

    describe('POST then DELETE', () => {

      const postTestCase = testCases.find(t => t.method === 'post')!
      const deleteTestCase = testCases.find(t => t.method === 'delete')!

      beforeEach(() => {
        http.mockAdd({
          url: getUrl(postTestCase.method),
          method: getHTTPMethod(postTestCase.method),
          data: postTestCase.body,
        }, postTestCase.response)
        http.mockAdd({
          url: getUrl(deleteTestCase.method),
          method: getHTTPMethod(deleteTestCase.method),
          data: deleteTestCase.body,
        }, deleteTestCase.response)
      })

      afterEach(() => {
        http.mockClear()
      })

      it('removes id and entity from state', async () => {
        const action1 = store.dispatch(actions.post({
          params: postTestCase.params,
          body: postTestCase.body,
        }))
        await action1.payload
        expect(store.getState().Crud.ids).toEqual([entity.id])
        const action2 = store.dispatch(actions.delete({
          params: deleteTestCase.params,
          body: deleteTestCase.body,
        }))
        await action2.payload
        expect(store.getState().Crud.ids).toEqual([])
      })
    })

  })

})
