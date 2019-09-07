import {test} from '../test'
import {addUser, removeUser, findUsers, createTeam} from './TeamTestUtils'

describe('team', () => {

  test.withDatabase()
  const t = test.request('/api')

  let mainUserId: number
  beforeEach(async () => {
    const session = await test.registerAccount()
    mainUserId = session.userId
    t.setHeaders(session.headers)
  })

  describe('POST /teams', () => {
    it('creates a new team', async () => {
      const team = await createTeam(t, 'test')
      expect(team.name).toEqual('test')
    })
  })

  describe('GET /teams/:id', () => {
    it('retrieves a team by id', async () => {
      const team = await createTeam(t, 'test')
      const response = await t
      .get('/teams/:id', {
        params: {
          id: team.id,
        },
      })
      .expect(200)
      expect(response.body).toEqual(team)
    })
  })

  describe('PUT /teams/:id', () => {
    it('updates a team name', async () => {
      const team = await createTeam(t, 'test')
      const response = await t
      .put('/teams/:id', {
        params: {
          id: team.id,
        },
      })
      .send({
        name: team.name + '2',
      })
      expect(response.body.name).toEqual(team.name + '2')
    })
  })

  describe('DELETE /teams/:id', () => {
    it('removes a team by id', async () => {
      const team = await createTeam(t, 'test')
      await t
      .delete('/teams/:id', {
        params: {
          id: team.id,
        },
      })
      .expect(200)
    })
  })

  describe('GET /my/teams', () => {
    it('retrieves all teams belonging to current user', async () => {
      const team = await createTeam(t, 'test')
      const response = await t
      .get('/my/teams')
      .expect(200)
      expect(response.body.map(myTeam => ({teamId: myTeam.id})))
      .toContainEqual({
        teamId: team.id,
      })
    })
  })

  describe('POST /teams/:teamId/users/:userId', () => {
    it('adds a user to the team', async () => {
      const team = await createTeam(t, 'test')
      const teamId = team.id
      const {userId} = await test.registerAccount('test2@user.com')
      await addUser(t, {userId, teamId})
    })
  })

  describe('DELETE /teams/:teamId/users/:userId', () => {
    it('removes the user from the team', async () => {
      const team = await createTeam(t, 'test')
      const teamId = team.id
      const {userId} = await test.registerAccount('test2@user.com')
      await addUser(t, {userId, teamId})
      await removeUser(t, {userId, teamId})
    })
  })

  describe('GET /teams/:teamId/users', () => {
    it('fetches team members user info', async () => {
      const team = await createTeam(t, 'test')
      const teamId = team.id
      const {userId} = await test.registerAccount('test2@user.com')
      await addUser(t, {userId, teamId})
      const users = await findUsers(t, {teamId})
      expect(users.length).toBe(2)
      expect(users).toEqual([{
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

  // describe('GET /my/teams', () => {

  // })

})
