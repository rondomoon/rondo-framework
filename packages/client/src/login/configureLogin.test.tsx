import { IAPIDef } from '@rondo.dev/common';
import { HTTPClientMock } from '@rondo.dev/http-client';
import { getError } from '@rondo.dev/test-utils';
import React from 'react';
import ReactDOM from 'react-dom';
import T from 'react-dom/test-utils';
import { MemoryRouter } from 'react-router-dom';
import { TestUtils } from '../test-utils';
import * as Feature from './';
import { configureLogin } from './configureLogin';

const test = new TestUtils()

describe('configureLogin', () => {

  const http = new HTTPClientMock<IAPIDef>()
  const loginActions = new Feature.LoginActions(http)

  const createTestProvider = () => test.withProvider({
    reducers: {Login: Feature.Login},
    select: state => state.Login,
  })
  .withComponent(
    select => configureLogin(select, loginActions),
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

    const data = {username: 'user', password: 'pass'}
    const onSuccess = jest.fn()
    let node: Element
    let component: React.Component
    beforeEach(() => {
      http.mockAdd({
        method: 'post',
        url: '/auth/login',
        data,
      }, {id: 123})

      const t = createTestProvider()
      const r = t.render({onSuccess})
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

    it('should submit a form, clear it and redirect it', async () => {
      T.Simulate.submit(node)
      const {req} = await http.wait()
      expect(req).toEqual({
        method: 'post',
        url: '/auth/login',
        data,
      })
      expect(onSuccess.mock.calls.length).toBe(1)
      // TODO test clear username/password
      node = ReactDOM.findDOMNode(component) as Element
      expect(node.innerHTML).toMatch(/<a href="\/">/)
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
