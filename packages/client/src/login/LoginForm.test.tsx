import * as Feature from './'
import {HTTPClientMock, TestUtils, getError} from '../test-utils'
import {IAPIDef} from '@rondo/common'
import T from 'react-dom/test-utils'

const test = new TestUtils()

describe('LoginForm', () => {

  const http = new HTTPClientMock<IAPIDef>()
  const loginActions = new Feature.LoginActions(http)

  const t = test.withProvider({
    reducers: {Login: Feature.Login},
    state: {Login: {user: {id: 1}}},
    connector: new Feature.LoginConnector(loginActions),
    select: state => state.Login,
  })

  it('should render', () => {
    t.render()
  })

  describe('submit', () => {

    const data = {username: 'user', password: 'pass'}
    const onSuccess = jest.fn()
    let node: Element
    beforeEach(() => {
      http.mockAdd({
        method: 'post',
        url: '/auth/login',
        data,
      }, {id: 123})

      const r = t.render({onSuccess})
      node = r.node
      T.Simulate.change(
        node.querySelector('input[name="username"]')!,
        {target: {value: 'user'}} as any,
      )
      T.Simulate.change(
        node.querySelector('input[name="password"]')!,
        {target: {value: 'pass'}} as any,
      )
    })

    it('should submit a form and clear it', async () => {
      T.Simulate.submit(node)
      const {req} = await http.wait()
      expect(req).toEqual({
        method: 'post',
        url: '/auth/login',
        data,
      })
      expect(onSuccess.mock.calls.length).toBe(1)
      expect(
        (node.querySelector('input[name="username"]') as HTMLInputElement)
        .value,
      )
      .toEqual('')
      expect(
        (node.querySelector('input[name="password"]') as HTMLInputElement)
        .value,
      )
      .toEqual('')
    })

    it('sets the error message on failure', async () => {
      http.mockAdd({
        method: 'post',
        url: '/auth/login',
        data,
      }, {error: 'test'}, 500)
      T.Simulate.submit(node)
      await getError(http.wait())
      expect(node.querySelector('.error')!.textContent)
      .toMatch(/HTTP Status: 500/i)
    })

  })

})
