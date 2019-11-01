import { test } from '../test'
import { SQLAuthService } from './SQLAuthService'

describe('SQLAuthService', () => {

  test.withDatabase()

  const username = test.username
  const password = '1234567890'

  const authService = new SQLAuthService(test.bootstrap.database)

  async function createUser(u = username, p = password) {
    return authService.createUser({
      username: u,
      password: p,
      email: u,
      firstName: 'test',
      lastName: 'test',
    })
  }

  describe('createUser', () => {
    it('creates a new user with bcrypted password', async () => {
      const result = await createUser()
      expect(result.id).toBeTruthy()
      const user = await authService.findOne(result.id)
      expect(user).toBeTruthy()
      expect(user).not.toHaveProperty('password')
    })

    it('throws when email is present is not a valid email', async () => {
      const err = await test.getError(authService.createUser({
        username,
        password,
        email: username.replace('@', '_'),
      }))
      expect(err.message).toMatch(/not a valid e-mail/)
    })

    it('throws when password is too short', async () => {
      const err = await test.getError(createUser(username, 'p'))
      expect(err.message).toMatch(/password/i)
    })

    it('fails on duplicate entry', async () => {
      await createUser()
      const error = await test.getError(createUser())
      expect(error.message).toMatch(/unique/i)
    })
  })

  describe('findUserByMail', () => {
    it('returns user without password', async () => {
      await createUser()
      const user = await authService.findUserByEmail(username)
      expect(user).toBeTruthy()
      expect(user).not.toHaveProperty('password')
    })
  })

  describe('getUserEmails', () => {
    it('returns user emails', async () => {
      const {id} = await createUser()
      const emails = await authService.findUserEmails(id)
      expect(emails).toEqual([{
        id: jasmine.any(Number),
        userId: id,
        email: username,
        createDate: jasmine.any(String),
        updateDate: jasmine.any(String),
      }])
    })
  })

  describe('validateCredentials', () => {
    it('returns user when password is valid', async () => {
      await createUser()
      expect(await authService.validateCredentials({ username, password }))
      .toBeTruthy()
    })

    it('returns undefined when no user', async () => {
      expect(await authService.validateCredentials({ username, password }))
      .toBe(undefined)
    })

    it('returns undefined when password is invalid', async () => {
      await createUser()
      expect(await authService.validateCredentials({ username, password: 't' }))
      .toBe(undefined)
    })

    it('does not return a password', async () => {
      await createUser()
      const user =  await authService
      .validateCredentials({ username, password })
      expect(user).not.toHaveProperty('password')
    })
  })

})
