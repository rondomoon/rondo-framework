import { TeamServiceMethods, ITeamService } from '@rondo.dev/common'
import { test } from '../test'

describe('team', () => {

  test.withDatabase()
  // const t = test.request('/api')

  let mainUserId: number
  let headers: Record<string, string> = {}
  beforeEach(async () => {
    const session = await test.registerAccount()
    mainUserId = session.userId
    headers = session.headers
  })

  const getClient = () =>
    test.rpc<ITeamService>(
      '/rpc/teamService',
      TeamServiceMethods,
      headers,
    )

  describe('create', () => {
    it('creates a new team', async () => {
      const team = await getClient().create({
        name: 'test',
      })
      expect(team.name).toEqual('test')
    })
  })

  describe('findOne', () => {
    it('retrieves a team by id', async () => {
      const client = getClient()
      const team = await client.create({name: 'test'})
      const team2 = await client.findOne(team.id)
      expect(team2).toEqual(team)
    })
  })

  describe('update', () => {
    it('updates a team name', async () => {
      const client = getClient()
      const team = await client.create({name: 'test'})
      const team2 = await client.update({
        id: team.id,
        name: 'test2',
      })
      expect(team2.name).toEqual('test2')
    })
  })

  describe('remove', () => {
    it('removes a team by id', async () => {
      const client = getClient()
      const team = await client.create({name: 'test'})
      await client.remove({id: team.id})
      const team2 = await client.findOne(team.id)
      expect(team2).toBe(undefined)
    })
  })

  describe('find', () => {
    it('retrieves all teams belonging to current user', async () => {
      const client = getClient()
      const team = await client.create({name: 'test'})
      const teams = await client.find()
      expect(teams.map(myTeam => ({teamId: myTeam.id})))
      .toContainEqual({
        teamId: team.id,
      })
    })
  })

  describe('addUser', () => {
    it('adds a user to the team', async () => {
      const client = getClient()
      const team = await client.create({name: 'test'})
      const teamId = team.id
      const {userId} = await test.registerAccount(test.createTestUsername(2))
      await client.addUser({userId, teamId, roleId: 1})
    })
  })

  describe('removeUser', () => {
    it('removes the user from the team', async () => {
      const client = getClient()
      const team = await client.create({name: 'test'})
      const teamId = team.id
      const {userId} = await test.registerAccount(test.createTestUsername(2))
      await client.addUser({userId, teamId, roleId: 1})
      await client.removeUser({userId, teamId, roleId: 1})
    })
  })

  describe('findUsers', () => {
    it('fetches team members user info', async () => {
      const client = getClient()
      const team = await client.create({name: 'test'})
      const teamId = team.id
      const {userId} = await test.registerAccount(test.createTestUsername(2))
      await client.addUser({userId, teamId, roleId: 1})
      const {usersInTeam} = await client.findUsers(teamId)
      expect(usersInTeam.length).toBe(2)
      expect(usersInTeam).toEqual([{
        teamId,
        userId: mainUserId,
        displayName: jasmine.any(String),
        roleId: 1,
        roleName: 'ADMIN',
      }, {
        teamId,
        userId,
        displayName: jasmine.any(String),
        roleId: 1,
        roleName: 'ADMIN',
      }])
    })
  })

})
