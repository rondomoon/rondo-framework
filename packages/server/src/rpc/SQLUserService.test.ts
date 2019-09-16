import {test} from '../test'
import { UserService, UserServiceMethods } from '@rondo.dev/common'

describe('SQLUserService', () => {

  test.withDatabase()

  let headers: Record<string, string> = {}
  beforeEach(async () => {
    await test.registerAccount()
    headers = (await test.login()).headers
  })

  const createService = () => {
    return test.rpc<UserService>(
      '/rpc/userService',
      UserServiceMethods,
      headers,
    )
  }

  describe('findOne', () => {
    it('fetches current user\'s profile', async () => {
      const profile = await createService().getProfile()
      expect(profile.id).toEqual(jasmine.any(Number))
    })
  })

  describe('findUserByEmail', () => {
    it('returns undefined when user no found', async () => {
      const profile = await createService().findUserByEmail(
        'totallynonexisting@email.com')
      expect(profile).toBe(undefined)
    })

    it('returns user profile when found', async () => {
      const profile = await createService().findUserByEmail(
        test.username)
      expect(profile).not.toBe(undefined)
    })
  })

})
