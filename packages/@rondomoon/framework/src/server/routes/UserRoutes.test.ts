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

  it('should prevent access when user not logged in', async () => {
    await t
    .setHeaders({ token })
    .get(`/users/password`)
    .expect(401)
  })

  describe('POST /users/password', () => {
    it('changes user password when passwords match', async () => {
      await t
      .post('/users/password')
      .send({ oldPassword: test.password, newPassword: 'newPass' })
      .expect(200)

      await test.login(test.username, 'newPass')
    })

    it('returns 400 when passwords do not match', async () => {
      await t
      .post('/users/password')
      .send({ oldPassword: 'invalid-password', newPassword: 'newPass' })
      .expect(400)
    })
  })

  describe('GET /users/profile', () => {
    it('fetches user profile', async () => {
      t.setHeaders({ cookie })
      await t
      .get('/users/profile')
      .expect(200)
    })
  })
})
