import {test} from '../test'
import {createTeam} from './TeamTestUtils'

describe('team', () => {

  test.withDatabase()
  const t = test.request('/api')

  let cookie!: string
  let token!: string
  beforeEach(async () => {
    const session = await test.registerAccount()
    cookie = session.cookie
    token = session.token
    t.setHeaders({ cookie, 'x-csrf-token': token })
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
        id: team.id,
      })
      .expect(200)
      expect(response.body).toEqual(team)
    })
  })

  describe('GET /my/teams', () => {
    it('retrieves all teams belonging to current user', async () => {
      const team = await createTeam(t, 'test')
      const response = await t
      .get('/my/teams')
      .expect(200)
      expect(response.body.map(ut => ({teamId: ut.teamId})))
      .toContainEqual({
        teamId: team.id,
      })
    })
  })

  // describe('GET /my/teams', () => {

  // })

})
