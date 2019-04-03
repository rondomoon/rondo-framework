import * as Feature from './'
// export ReactDOM from 'react-dom'
import T from 'react-dom/test-utils'
import {HTTPClientMock, TestUtils, getError} from '../test-utils'
import {IAPIDef, ITeam, IUserInTeam} from '@rondo/common'
import React from 'react'
import {MemoryRouter} from 'react-router-dom'

const test = new TestUtils()

describe('TeamConnector', () => {

  let history: any = {
    push: jest.fn(),
  }

  let teamActions!: Feature.TeamActions
  let http: HTTPClientMock<IAPIDef>
  beforeEach(() => {
    http = new HTTPClientMock<IAPIDef>()

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

    teamActions = new Feature.TeamActions(http)
  })

  let historyEntries = ['/teams']

  const createTestProvider = () => test.withProvider({
    reducers: {Team: Feature.Team},
    select: state => state.Team,
  })
  .withComponent(select =>
    new Feature
    .TeamConnector(teamActions)
    .connect(select))
  .withJSX((Component, props) =>
    <MemoryRouter initialEntries={historyEntries}>
      <Component {...props} />
    </MemoryRouter>,
  )

  const teams: ITeam[] = [{id: 100, name: 'my-team', userId: 1}]

  const users: IUserInTeam[] = [{
    teamId: 123,
    userId: 1,
    displayName: 'test test',
    roleId: 1,
    roleName: 'ADMIN',
  }]

  it('it fetches user teams on render', async () => {
    const {node} = createTestProvider().render({
      history,
      location: {} as any,
      match: {} as any,
    })
    await http.wait()
    expect(node.innerHTML).toContain('my-team')
  })

  describe('add team', () => {
    beforeEach(() => {
      historyEntries = ['/teams/new']
    })

    it('sends a POST request to POST /teams', async () => {
      const newTeam: Partial<ITeam> = {id: 101, name: 'new-team'}
      http.mockAdd({
        method: 'post',
        url: '/teams',
        data: {name: 'new-team'},
      }, newTeam)
      const {render, store} = createTestProvider()
      const {node} = render({
        history,
        location: {} as any,
        match: {} as any,
      })
      const addTeamForm = node.querySelector('.team-add') as HTMLFormElement
      const nameInput = addTeamForm
      .querySelector('input') as HTMLInputElement
      T.Simulate.change(nameInput, {target: {value: newTeam.name}} as any)
      T.Simulate.submit(addTeamForm)
      await http.wait()
      const {Team} = store.getState()
      expect(Team.teamIds).toEqual([100, 101])
      expect(Team.teamsById[101]).toEqual(newTeam)
    })

    it('displays an error', async () => {
      const error = {error: 'An error'}
      http.mockAdd({
        method: 'post',
        url: '/teams',
        data: {name: 'test'},
      }, error, 400)
      const {render} = createTestProvider()
      const {node} = render({
        history,
        location: {} as any,
        match: {} as any,
      })
      const addTeamForm = node.querySelector('.team-add') as HTMLFormElement
      const nameInput = addTeamForm
      .querySelector('input') as HTMLInputElement
      T.Simulate.change(nameInput, {target: {value: 'test'}} as any)
      T.Simulate.submit(addTeamForm)
      const error2 = await getError(http.wait())
      expect(error2.message).toMatch(/HTTP Status: 400/)
      expect(nameInput.value).toEqual('test')
      expect(addTeamForm.innerHTML).toMatch(/HTTP Status: 400/)
    })
  })

})
