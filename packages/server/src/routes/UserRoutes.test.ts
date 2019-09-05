import {test} from '../test'

describe('user', () => {

  test.withDatabase()
  const t = test.request('/api')

  let cookie!: string
  let token!: string
  beforeEach(async () => {
    await test.registerAccount()
    const session = await test.login()
    cookie = session.cookie
    token = session.token
    t.setHeaders({ cookie, 'x-csrf-token': token })
  })

  describe('GET /users/profile', () => {
    it('fetches user profile', async () => {
      t.setHeaders({ cookie })
      await t
      .get('/users/profile')
      .expect(200)
    })
  })

  describe('GET /users/emails/:email', () => {
    it('fetches user by email', async () => {
      t.setHeaders({cookie})
      const response = await t
      .get('/users/emails/:email', {
        params: {
          email: test.username,
        },
      })
      .expect(200)
      expect(response.body!.firstName).toEqual('test')
    })
    it('returns an empty body when email is not found', async () => {
      t.setHeaders({cookie})
      await t
      .get('/users/emails/:email', {
        params: {
          email: 'non-existing@address.com',
        },
      })
      .expect(200)
      .expect(/^$/g)
      // TODO use status code 404 when an entity is not found
    })
  })

})
