import {test} from '../test'

describe('/auth', () => {

  test.withDatabase()

  describe('/register', () => {
    it('should create a new user account', async () => {
      await test.registerAccount()
    })
  })

  describe('/login', () => {

    beforeEach(async () => {
      await test.registerAccount()
    })

    it('should log in the newly created user', async () => {
      await test.login()
    })
  })

  describe('/auth/password', () => {

    const t = test.request('/api')
    beforeEach(async () => {
      const session = await test.registerAccount()
      const token = session.token
      const cookie = session.cookie
      t.setHeaders({cookie, 'x-csrf-token': token})
    })

    it('should prevent access when user not logged in', async () => {
      const {cookie, token} = await test.getCsrf()
      await t
      .setHeaders({'cookie': cookie, 'x-csrf-token': token})
      .post('/auth/password')
      .expect(401)
    })

    describe('POST /users/password', () => {
      it('changes user password when passwords match', async () => {
        await t
        .post('/auth/password')
        .send({ oldPassword: test.password, newPassword: 'newPass' })
        .expect(200)

        await test.login(test.username, 'newPass')
      })

      it('returns 400 when passwords do not match', async () => {
        await t
        .post('/auth/password')
        .send({ oldPassword: 'invalid-password', newPassword: 'newPass' })
        .expect(400)
      })
    })

  })

  describe('/logout', () => {

    let cookie!: string
    beforeEach(async () => {
      await test.registerAccount()
      cookie = (await test.login()).cookie
    })

    it('should log out the user', async () => {
      await test.request('/api')
      .get('/auth/logout')
      .set('cookie', cookie)
      .expect(200)
    })
  })

})
