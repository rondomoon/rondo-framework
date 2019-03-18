import {test} from '../test'
import {UserService} from './UserService'

describe('UserService', () => {

  test.withDatabase()

  const username = 'test@user.com'
  const password = '1234567890'

  const userService = new UserService(test.transactionManager)

  async function createUser(u = username, p = password) {
    return userService.createUser({
      username: u,
      password: p,
      firstName: 'test',
      lastName: 'test',
    })
  }

  describe('createUser', () => {
    it('creates a new user with bcrypted password', async () => {
      const result = await createUser()
      expect(result.id).toBeTruthy()
      const user = await userService.findOne(result.id)
      expect(user).toBeTruthy()
      expect(user).not.toHaveProperty('password')
    })

    it('throws when username is not an email', async () => {
      const err = await test.getError(createUser('test', password))
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
      const user = await userService.findUserByEmail(username)
      expect(user).toBeTruthy()
      expect(user!.password).toBe(undefined)
    })
  })

  describe('getUserEmails', () => {
    it('returns user emails', async () => {
      const {id} = await createUser()
      const emails = await userService.findUserEmails(id)
      expect(emails).toEqual([{
        id: jasmine.any(Number),
        userId: id,
        email: username,
        createDate: jasmine.any(Date),
        updateDate: jasmine.any(Date),
      }])
    })
  })

  describe('validateCredentials', () => {
    it('returns user when password is valid', async () => {
      await createUser()
      expect(await userService.validateCredentials({ username, password }))
      .toBeTruthy()
    })

    it('returns undefined when no user', async () => {
      expect(await userService.validateCredentials({ username, password }))
      .toBe(undefined)
    })

    it('returns undefined when password is invalid', async () => {
      await createUser()
      expect(await userService.validateCredentials({ username, password: 't' }))
      .toBe(undefined)
    })

    it('does not return a password', async () => {
      await createUser()
      const user =  await userService
      .validateCredentials({ username, password })
      expect(user).not.toHaveProperty('password')
    })
  })

})
