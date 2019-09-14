import { IAPIDef } from '@rondo.dev/common'
import { HTTPClientMock } from '@rondo.dev/http-client'
import { getError } from '@rondo.dev/test-utils'
import React from 'react'
import ReactDOM from 'react-dom'
import T from 'react-dom/test-utils'
import { MemoryRouter } from 'react-router-dom'
import { TestUtils } from '../test-utils'
import * as Feature from './'
import { configureRegister } from './configureRegister'

const test = new TestUtils()

describe('configureRegister', () => {

  const http = new HTTPClientMock<IAPIDef>()
  const loginActions = new Feature.LoginActions(http)

  const createTestProvider = () => test.withProvider({
    reducers: {Login: Feature.Login},
    select: state => state.Login,
  })
  .withComponent(
    select => configureRegister(select, loginActions),
  )
  .withJSX((Component, props) =>
    <MemoryRouter><Component {...props} /></MemoryRouter>,
  )

  beforeAll(() => {
    (window as any).__MOCK_SERVER_SIDE__ = true
  })

  it('should render', () => {
    createTestProvider().render({})
  })

  describe('submit', () => {

    const data = {
      username: 'user',
      password: 'pass',
      firstName: '',
      lastName: '',
    }
    const onSuccess = jest.fn()
    let node: Element
    let component: React.Component
    beforeEach(() => {
      http.mockAdd({
        method: 'post',
        url: '/auth/register',
        data,
      }, {id: 123})

      const r = createTestProvider().render({onSuccess})
      node = r.node
      component = r.component
      T.Simulate.change(
        node.querySelector('input[name="username"]')!,
        {target: {value: 'user'}} as any,
      )
      T.Simulate.change(
        node.querySelector('input[name="password"]')!,
        {target: {value: 'pass'}} as any,
      )
    })

    it('should submit a form, clear it, and redirect', async () => {
      T.Simulate.submit(node)
      const {req} = await http.wait()
      expect(req).toEqual({
        method: 'post',
        url: '/auth/register',
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
      node = ReactDOM.findDOMNode(component) as Element
      expect(node.innerHTML).toMatch(/<a href="\/">/)
    })

    it('sets the error message on failure', async () => {
      http.mockAdd({
        method: 'post',
        url: '/auth/register',
        data,
      }, {error: 'test'}, 500)
      T.Simulate.submit(node)
      await getError(http.wait())
      expect(node.querySelector('.error')!.textContent)
      .toMatch(/HTTP Status: 500/i)
    })

  })

})
