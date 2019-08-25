import {createCRUDActions} from './CRUDActions'
import React from 'react'
import {AnyAction} from 'redux'
import {CRUDReducer, TCRUDMethod, TCRUDAsyncMethod} from './'
import {HTTPClientMock, TestUtils, getError} from '../test-utils'
import {TMethod} from '@rondo.dev/common'
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
  const actions = createCRUDActions(
    http,
    '/one/:oneId/two/:twoId',
    '/one/:oneId/two',
    'TEST',
  )
  const crudReducer = new CRUDReducer<ITwo, 'TEST'>('TEST', {name: ''})
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
    method: TCRUDAsyncMethod,
    action: IPendingAction<unknown, string>,
  ) {
    store.dispatch(action)
    expect(store.getState().Crud.status[method].isLoading).toBe(true)
    expectActions([action.type])
    return action
  }

  function getUrl(method: TCRUDAsyncMethod) {
    return method === 'save' || method === 'findMany'
      ? '/one/1/two'
      : '/one/1/two/2'
  }

  function getHTTPMethod(method: TCRUDAsyncMethod): TMethod {
    switch (method) {
      case 'save':
        return 'post'
      case 'update':
        return 'put'
      case 'remove':
        return 'delete'
      case 'findOne':
      case 'findMany':
        return 'get'
    }
  }

  describe('Promise rejections', () => {
    const testCases: Array<{
      method: TCRUDAsyncMethod
      params: any
    }> = [{
      method: 'findOne',
      params: {
        params: {oneId: 1, twoId: 2},
      },
    }, {
      method: 'findMany',
      params: {
        params: {oneId: 1},
      },
    }, {
      method: 'save',
      params: {
        body: {name: 'test'},
        params: {oneId: 1, twoId: 2},
      },
    }, {
      method: 'update',
      params: {
        body: {name: 'test'},
        params: {oneId: 1, twoId: 2},
      },
    }, {
      method: 'remove',
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
            data: method === 'save'
              || method === 'update' || method === 'remove'
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
      method: TCRUDAsyncMethod,
      params: any
      body?: any
      response: any
    }> = [{
      method: 'findMany',
      params: {oneId: 1, twoId: 2},
      response: [entity],
    }, {
      method: 'findOne',
      params: {oneId: 1, twoId: 2},
      response: entity,
    }, {
      method: 'save',
      params: {oneId: 1},
      body: {name: entity.name},
      response: entity,
    }, {
      method: 'update',
      params: {oneId: 1, twoId: 2},
      body: {name: entity.name},
      response: entity,
    }, {
      method: 'remove',
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
            params: testCase.params,
            body: testCase.body,
          }))
          await action.payload
          const state = store.getState()
          expect(state.Crud.status.findMany.isLoading).toBe(false)
          if (method === 'remove') {
            expect(state.Crud.ids).toEqual([])
            expect(state.Crud.byId[entity.id]).toBe(undefined)
          } else {
            if (method !== 'update') {
              expect(state.Crud.ids).toEqual([entity.id])
            }
            expect(state.Crud.byId[entity.id]).toEqual(entity)
          }
        })
      })
    })

    describe('POST then DELETE', () => {

      const saveTestCase = testCases.find(t => t.method === 'save')!
      const removeTestCase = testCases.find(t => t.method === 'remove')!

      beforeEach(() => {
        http.mockAdd({
          url: getUrl(saveTestCase.method),
          method: getHTTPMethod(saveTestCase.method),
          data: saveTestCase.body,
        }, saveTestCase.response)
        http.mockAdd({
          url: getUrl(removeTestCase.method),
          method: getHTTPMethod(removeTestCase.method),
          data: removeTestCase.body,
        }, removeTestCase.response)
      })

      afterEach(() => {
        http.mockClear()
      })

      it('removes id and entity from state', async () => {
        const action1 = store.dispatch(actions.save({
          params: saveTestCase.params,
          body: saveTestCase.body,
        }))
        await action1.payload
        expect(store.getState().Crud.ids).toEqual([entity.id])
        const action2 = store.dispatch(actions.remove({
          params: removeTestCase.params,
        }))
        await action2.payload
        expect(store.getState().Crud.ids).toEqual([])
      })
    })

  })

  describe('synchronous methods', () => {

    describe('create', () => {
      it('resets form.create state', () => {
        store.dispatch(actions.create({name: 'a'}))
        expect(store.getState().Crud.form.createItem).toEqual({
          name: 'a',
        })
        expect(store.getState().Crud.form.createErrors).toEqual({})
      })
    })

    describe('change', () => {
      it('sets value', () => {
        store.dispatch(actions.change({key: 'name', value: 'test'}))
        expect(store.getState().Crud.form.createItem).toEqual({
          name: 'test',
        })
        expect(store.getState().Crud.form.createErrors).toEqual({})
      })
    })

    describe('edit', () => {
      beforeEach(() => {
        http.mockAdd({
          method: 'post',
          data: {name: 'test'},
          url: '/one/1/two',
        }, {id: 100, name: 'test'})
      })

      afterEach(() => {
        http.mockClear()
      })

      it('sets item as edited', async () => {
        await store.dispatch(actions.save({
          params: {oneId: 1},
          body: {name: 'test'},
        })).payload
        store.dispatch(actions.edit({id: 100}))
        expect(store.getState().Crud.form.itemsById[100]).toEqual({
          id: 100,
          name: 'test',
        })
        store.dispatch(actions.change({id: 100, key: 'name', value: 'grrr'}))
        expect(store.getState().Crud.form.itemsById[100]).toEqual({
          id: 100,
          name: 'grrr',
        })
      })
    })
  })

})
