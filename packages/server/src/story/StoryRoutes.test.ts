import {ISite} from '@rondo/common'
import {createSite} from '../site/SiteTestUtils'
import {test} from '../test'

describe('story', () => {

  test.withDatabase()
  const t = test.request('/api')

  let cookie!: string
  let token!: string
  let site!: ISite
  beforeEach(async () => {
    const session = await test.registerAccount()
    cookie = session.cookie
    token = session.token
    t.setHeaders({ cookie, 'x-csrf-token': token })

    site = await createSite(t, 'test.example.com')
  })

  const invalidUrl = 'https://invalid.example.com/test'
  const validUrl = 'https://test.example.com/test'

  async function getStory() {
    const response = await t
    .get('/stories/by-url', {
      query: { url: validUrl },
    })
    .expect(200)
    return response.body!
  }

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
      const story = await getStory()
      expect(story.id).toBeTruthy()
      expect(story.siteId).toEqual(site.id)
    })

    it('retrieves existing story after it is created', async () => {
      const story1 = await getStory()
      const story2 = await getStory()
      expect(story1.id).toBeTruthy()
      expect(story1).toEqual(story2)
    })

    it('prevents unique exceptions', async () => {
      const p1 = getStory()
      const p2 = getStory()
      const [story1, story2] = await Promise.all([p1, p2])
      expect(story1.id).toBeTruthy()
      expect(story1).toEqual(story2)
    })
  })

})
