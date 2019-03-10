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
        .post('/teams/:teamId/sites', {
          params: {
            teamId: team.id,
          },
        })
        .send({
          domain: 'test.example.com',
          name: 'test',
        })
        .expect(403)
      })
    })

  })

  describe('GET /teams/:teamId/sites/:id', () => {
    it('fetches a site belonging to a team', async () => {
      const site = await createSite(t, 'test.example.com')
      const response = await t.get('/teams/:teamId/sites/:id', {
        params: {
          teamId: site.teamId,
          id: site.id,
        },
      })
      .expect(200)
      expect(response.body!.id).toEqual(site.id)
    })
  })

  describe('GET /teams/:teamId/sites', () => {
    it('fetches all sites belonging to a team', async () => {
      const site = await createSite(t, 'test.example.com')
      const response = await t.get('/teams/:teamId/sites', {
        params: {
          teamId: site.teamId,
        },
      })
      expect(response.body.map(s => s.id)).toContain(site.id)
    })
  })

  describe('PUT /teams/:teamId/sites/:id', () => {
    it('updates site belonging to a team', async () => {
      const site = await createSite(t, 'test.example.com')
      const response = await t.put('/teams/:teamId/sites/:id', {
        params: {
          id: site.id,
          teamId: site.teamId,
        },
      })
      .send({
        name: site.name,
        domain: 'test2.example.com',
      })
      .expect(200)
      expect(response.body.domain).toEqual('test2.example.com')
    })
  })

  describe('DELETE /teams/:teamId/sites/:id', () => {
    it('deletes a site', async () => {
      const site = await createSite(t, 'test.example.com')
      await t.delete('/teams/:teamId/sites/:id', {
        params: {
          id: site.id,
          teamId: site.teamId,
        },
      })
      .expect(200)
    })
  })

})
