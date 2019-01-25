import {ITeam} from '@rondo/common'
import {UserTeam} from '../entities/UserTeam'
import {createTeam} from '../team/TeamTestUtils'
import {createSite} from './SiteTestUtils'
import {test} from '../test'

describe('team', () => {

  test.withDatabase()
  const t = test.request('/api')

  let cookie!: string
  let token!: string
  let team!: ITeam
  let userId: number
  beforeEach(async () => {
    const session = await test.registerAccount()
    cookie = session.cookie
    token = session.token
    userId = session.userId
    t.setHeaders({ cookie, 'x-csrf-token': token })

    team = await createTeam(t, 'test')
  })

  describe('POST /teams/:teamId/sites', () => {
    it('creates a new site', async () => {
      await createSite(t, 'test.example.com')
    })

    describe('no team access', () => {
      beforeEach(async () => {
        await test.transactionManager
        .getRepository(UserTeam)
        .delete({
          userId,
          teamId: team.id,
        })
      })

      it('results with 403 when user does not have team access ', async () => {
        await t
        .post('/teams/:teamId/sites', {teamId: team.id})
        .send({
          domain: 'test.example.com',
          name: 'test',
        })
        .expect(403)
      })
    })

  })

})
