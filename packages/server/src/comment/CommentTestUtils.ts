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

export async function getCommentById(
  t: RequestTester<IAPIDef>,
  commentId: number,
) {
  const response = await t
  .get('/comments/:commentId', {
    params: {commentId},
  })
  .expect(200)

  return response.body!
}

export async function upVote(
  t: RequestTester<IAPIDef>,
  commentId: number,
) {
  await t.post('/comments/:commentId/vote', {
    params: {
      commentId,
    },
  })
  .expect(200)
}

export async function downVote(
  t: RequestTester<IAPIDef>,
  commentId: number,
) {
  await t.delete('/comments/:commentId/vote', {
    params: {
      commentId,
    },
  })
  .expect(200)
}

export async function markAsSpam(
  t: RequestTester<IAPIDef>,
  commentId: number,
) {
  await t.post('/comments/:commentId/spam', {
    params: {
      commentId,
    },
  })
  .expect(200)
}

export async function unmarkAsSpam(
  t: RequestTester<IAPIDef>,
  commentId: number,
) {
  await t.delete('/comments/:commentId/spam', {
    params: {
      commentId,
    },
  })
  .expect(200)
}
