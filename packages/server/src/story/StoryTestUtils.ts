import {IAPIDef} from '@rondo/common'
import {RequestTester} from '../test-utils'

export async function getStory(t: RequestTester<IAPIDef>, url: string) {
  const response = await t
  .get('/stories/by-url', {
    query: {url},
  })
  .expect(200)

  return response.body!
}
