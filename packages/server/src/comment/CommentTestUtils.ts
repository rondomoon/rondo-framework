import {RequestTester} from '../test-utils'
import {IAPIDef} from '@rondo/common'

export async function createRootComment(
  t: RequestTester<IAPIDef>,
  {storyId, message}: {
    storyId: number,
    message: string,
  },
) {
  const response = await t
  .post('/stories/:storyId/comments', {
    params: {storyId},
  })
  .send({
    message,
  })
  .expect(200)

  return response.body!
}

export async function createComment(
  t: RequestTester<IAPIDef>,
  {storyId, parentId, message}: {
    storyId: number,
    parentId: number,
    message: string,
  },
) {
  const response = await t
  .post('/stories/:storyId/comments/:parentId', {
    params: {storyId, parentId},
  })
  .send({
    message,
  })
  .expect(200)

  return response.body!
}

export async function getComments(
  t: RequestTester<IAPIDef>,
  storyId: number,
) {
  const response = await t
  .get('/stories/:storyId/comments', {
    params: {storyId},
  })
  .expect(200)

  return response.body!
}
