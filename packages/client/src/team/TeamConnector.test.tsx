import { IAPIDef, IUserInTeam, ITeamService, TeamServiceMethods, UserServiceMethods, TeamActions, UserActions, IUserService, ITeamUsers, Team } from '@rondo.dev/common'
import { HTTPClientMock } from '@rondo.dev/http-client'
import { getError } from '@rondo.dev/test-utils'
import React from 'react'
import T from 'react-dom/test-utils'
import { MemoryRouter } from 'react-router-dom'
import { TestUtils } from '../test-utils'
import * as Feature from './'
import { createActions, createRemoteClient } from '@rondo.dev/jsonrpc'
import createClientMock from '@rondo.dev/jsonrpc/lib/createClientMock'

const test = new TestUtils()

describe('TeamConnector', () => {

  const history: any = {
    push: jest.fn(),
  }

  const [teamClient, teamClientMock] =
    createClientMock<ITeamService>(TeamServiceMethods)
  const [userClient, userClientMock] =
    createClientMock<IUserService>(UserServiceMethods)
  let teamActions!: TeamActions
  let userActions!: UserActions
  beforeEach(() => {
    teamClientMock.find.mockResolvedValue(teams)
    teamClientMock.findUsers.mockResolvedValue(users)

    teamActions = createActions(teamClient, 'teamService')
    userActions = createActions(userClient, 'userService')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  let historyEntries = ['/teams']

  const createTestProvider = () => test.withProvider({
    reducers: {Team: Feature.Team},
    select: state => state.Team,
  })
  .withComponent(select => Feature.configure(teamActions, userActions, select))
  .withJSX((Component, props) =>
    <MemoryRouter initialEntries={historyEntries}>
      <Component {...props} />
    </MemoryRouter>,
  )

  const teams: Team[] = [{
    id: 100,
    name: 'my-team',
    userId: 1,
    createDate: '',
    updateDate: '',
    userTeams: [],
  }]

  const users: ITeamUsers = {
    teamId: 123,
    usersInTeam: [{
      teamId: 123,
      userId: 1,
      displayName: 'test test',
      roleId: 1,
      roleName: 'ADMIN',
    }],
  }

  it('it fetches user teams on render', async () => {
    const {node, waitForActions} = createTestProvider().render({
      history,
      location: {} as any,
      match: {} as any,
    })
    await waitForActions()
    expect(node.innerHTML).toContain('my-team')
  })

  describe('add team', () => {
    beforeEach(() => {
      historyEntries = ['/teams/new']
    })

    it('creates a new team', async () => {
      const newTeam: Team = {
        id: 101,
        name: 'new-team',
        createDate: '',
        updateDate: '',
        userId: 9,
        userTeams: [],
      }
      teamClientMock.create.mockResolvedValue(newTeam)
      const {render, store} = createTestProvider()
      const {waitForActions, node} = render({
        history,
        location: {} as any,
        match: {} as any,
      })
      const addTeamForm = node.querySelector('.team-add') as HTMLFormElement
      const nameInput = addTeamForm
      .querySelector('input') as HTMLInputElement
      T.Simulate.change(nameInput, {target: {value: newTeam.name}} as any)
      T.Simulate.submit(addTeamForm)
      await waitForActions()
      const state = store.getState()
      expect(state.Team.teamIds).toEqual([100, 101])
      expect(state.Team.teamsById[101]).toEqual(newTeam)
    })

    it('displays an error', async () => {
      const error = {error: 'An error'}
      teamClientMock.create.mockRejectedValue(new Error('Test Error'))
      const {render} = createTestProvider()
      const {node, waitForActions} = render({
        history,
        location: {} as any,
        match: {} as any,
      })
      const addTeamForm = node.querySelector('.team-add') as HTMLFormElement
      const nameInput = addTeamForm
      .querySelector('input') as HTMLInputElement
      T.Simulate.change(nameInput, {target: {value: 'test'}} as any)
      T.Simulate.submit(addTeamForm)
      const error2 = await getError(waitForActions())
      expect(error2.message).toMatch(/Test Error/)
      expect(nameInput.value).toEqual('test')
      expect(addTeamForm.innerHTML).toMatch(/Test Error/)
    })
  })

})
