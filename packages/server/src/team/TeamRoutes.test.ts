import {test} from '../test'

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

  async function createTeam(name: string) {
    const response = await t
    .post('/teams')
    .send({
      name: 'test',
    })
    .expect(200)
    expect(response.body.id).toBeTruthy()
    return response.body
  }

  describe('POST /teams', () => {
    it('creates a new team', async () => {
      const team = await createTeam('test')
      expect(team.name).toEqual('test')
    })
  })

  describe('GET /teams/:id', () => {
    it('retrieves a team by id', async () => {
      const team = await createTeam('test')
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
      const team = await createTeam('test')
      const response = await t
      .get('/my/teams')
      .expect(200)
      expect(response.body).toContainEqual(team)
    })
  })

  // describe('GET /my/teams', () => {

  // })

})
