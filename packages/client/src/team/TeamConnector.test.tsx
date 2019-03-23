import * as Feature from './'
// export ReactDOM from 'react-dom'
// import T from 'react-dom/test-utils'
import {HTTPClientMock, TestUtils/*, getError*/} from '../test-utils'
import {IAPIDef, ITeam, IUserInTeam} from '@rondo/common'
import React from 'react'

const test = new TestUtils()

describe('TeamConnector', () => {

  const http = new HTTPClientMock<IAPIDef>()
  const teamActions = new Feature.TeamActions(http)

  const createTestProvider = () => test.withProvider({
    reducers: {Team: Feature.Team},
    select: state => state.Team,
  })
  .withComponent(select =>
    new Feature
    .TeamConnector(teamActions)
    .connect(select))
  .withJSX((Component, props) => <Component {...props} />)

  const teams: ITeam[] = [{id: 100, name: 'my-team', userId: 1}]

  const users: IUserInTeam[] = [{
    teamId: 123,
    userId: 1,
    displayName: 'test test',
    roleId: 1,
    roleName: 'ADMIN',
  }]

  it('it fetches user teams on render', async () => {
    http.mockAdd({
      method: 'get',
      url: '/my/teams',
    }, teams)
    http.mockAdd({
      method: 'get',
      url: '/teams/:teamId/users',
      params: {
        teamId: 123,
      },
    }, users)
    const {node} = createTestProvider().render({editTeamId: 123})
    await http.wait()
    expect(node.innerHTML).toContain('my-team')
  })

})
