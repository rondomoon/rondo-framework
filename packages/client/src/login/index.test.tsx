import * as Feature from './'
// import React from 'react'
import {TestUtils} from '../test-utils'

const test = new TestUtils()

describe('Login', () => {

  const loginActions = new Feature.LoginActions({} as any)

  const t = test.withProvider({
    reducers: {Login: Feature.Login},
    state: {Login: {user: {id: 1}}},
    connector: new Feature.LoginConnector(loginActions),
    select: state => state.Login,
  })

  it('should render', () => {
    t.render()
  })

})
