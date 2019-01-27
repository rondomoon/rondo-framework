import {ISite/*, IStory*/} from '@rondo/common'
import {createSite} from '../site/SiteTestUtils'
import {test} from '../test'

describe('story', () => {

  test.withDatabase()
  const t = test.request('/api')

  let cookie!: string
  let token!: string
  let team!: ISite
  beforeEach(async () => {
    const session = await test.registerAccount()
    cookie = session.cookie
    token = session.token
    t.setHeaders({ cookie, 'x-csrf-token': token })

    team = await createSite(t, 'test.example.com')
  })

  const invalidUrl = 'https://invalid.example.com/test'
  // const validUrl = 'https://test.example.com/test'

  describe('/stories/by-url', () => {
    it('returns undefined when a site is not configured', async () => {
      const response = await t
      .get('/stories/by-url', {
        query: { url: invalidUrl },
      })
      .expect(200)
      expect(response.body).toEqual('')
    })

    it('creates a story when it does not exist', async () => {

    })

    it('retrieves existing story after it is created', async () => {

    })

    it('prevents unique exceptions', async () => {

    })
  })

})
