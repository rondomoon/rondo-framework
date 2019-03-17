import {test} from '../test'

describe('login', () => {

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
      .expect(302)
      .expect('location', `${test.context}/api/auth/login`)
    })
  })

})
