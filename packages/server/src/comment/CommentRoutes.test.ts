import * as CommentTestUtils from './CommentTestUtils'
import {IStory} from '@rondo/common'
import {createSite} from '../site/SiteTestUtils'
import {getStory} from '../story/StoryTestUtils'
import {test} from '../test'

describe('comment', () => {

  test.withDatabase()
  const t = test.request('/api')

  let cookie!: string
  let token!: string
  let story!: IStory

  const storyUrl = 'https://test.example.com/my/story'

  beforeEach(async () => {
    const session = await test.registerAccount()
    cookie = session.cookie
    token = session.token
    t.setHeaders({cookie, 'x-csrf-token': token})

    await createSite(t, 'test.example.com')
    story = await getStory(t, storyUrl)
  })

  async function createComment() {
    return CommentTestUtils.createRootComment(t, {
      storyId: story.id,
      message: 'test',
    })
  }

  async function createChildComment() {
    const parent = await CommentTestUtils.createRootComment(t, {
      storyId: story.id,
      message: 'this is a parent comment',
    })
    const child = await CommentTestUtils.createComment(t, {
      storyId: story.id,
      parentId: parent.id,
      message: 'this is a child comment',
    })
    expect(child.id).toBeGreaterThan(0)
    return child
  }

  describe('GET /stories/:storyId/comments', () => {
    it('retrieves comments by story id', async () => {
      const comments = await CommentTestUtils.getComments(t, story.id)
      expect(comments.rootIds).toEqual(jasmine.any(Array))
    })
  })

  describe('POST /stories/:storyId/comments', () => {
    it('adds a new root comment', async () => {
      const message = 'this is a comment'
      const comment = await CommentTestUtils.createRootComment(t, {
        storyId: story.id,
        message,
      })
      expect(comment.id).toBeGreaterThan(0)
      expect(comment.message).toEqual(message)
    })
  })

  describe('POST /stories/:storyId/comments/:parentId', () => {
    it('adds a new child comment', async () => {
      await createChildComment()
      const comments = await CommentTestUtils.getComments(t, story.id)
      expect(comments.rootIds).toEqual([
        jasmine.any(Number),
      ])
      const id = comments.rootIds[0]
      const parent = comments.commentsById[id]
      expect(parent).toBeTruthy()
      expect(parent.message).toMatch(/parent/)
      expect(parent.childrenIds).toEqual([jasmine.any(Number)])
      const child = comments.commentsById[parent.childrenIds![0]]
      expect(child).toBeTruthy()
      expect(child.message).toMatch(/child/)
      expect(child.childrenIds).toBe(undefined)
    })
  })

  describe('PUT /comments/:commentId', () => {

    it('updates a comment', async () => {
      const comment = await createComment()
      await t.put('/comments/:commentId', {
        params: {
          commentId: comment.id,
        },
      })
      .send({
        message: 'test2',
      })
      .expect(200)

      const c  = await CommentTestUtils.getCommentById(t, comment.id)
      expect(c.message).toEqual('test2')

      // TODO save edit history
    })

    // it('fails to update a comment if user is not the owner')

    // it('updates a comment if user is site moderator') // TODO later
  })

  describe('DELETE /comments/:commentId', () => {
    it('soft deletes a comment', async () => {
      const comment = await createComment()
      await t.delete('/comments/:commentId', {
        params: {
          commentId: comment.id,
        },
      })
      .expect(200)
      const comment2 = await CommentTestUtils.getCommentById(t, comment.id)
      expect(comment2.message)
      .toEqual('(this message has been removed)')
    })
  })

  describe('POST /comments/:commentId/vote', () => {
    it('adds a new comment vote', async () => {
      const comment = await createComment()
      await CommentTestUtils.upVote(t, comment.id)
      const c = await CommentTestUtils.getCommentById(t, comment.id)
      expect(c.votes).toEqual(1)
    })
    it('can only upvote once', async () => {
      const comment = await createComment()
      async function upVote() {
        return t.post('/comments/:commentId/vote', {
          params: {
            commentId: comment.id,
          },
        })
      }

      const responses = (await Promise.all([
        upVote(),
        upVote(),
      ])).map(r => r.status)

      expect(responses).toContain(200)
      expect(responses).toContain(400)

      const c = await CommentTestUtils.getCommentById(t, comment.id)
      expect(c.votes).toEqual(1)
    })
  })

  describe('DELETE /comments/:commentId/vote', () => {
    it('removes a comment vote', async () => {
      let comment = await createComment()
      await CommentTestUtils.upVote(t, comment.id)
      comment = await CommentTestUtils.getCommentById(t, comment.id)
      expect(comment.votes).toEqual(1)
      await CommentTestUtils.downVote(t, comment.id)
      comment = await CommentTestUtils.getCommentById(t, comment.id)
      expect(comment.votes).toEqual(0)
    })
    it('can only downvote once', async () => {
      let comment = await createComment()
      await CommentTestUtils.upVote(t, comment.id)
      await Promise.all([
        CommentTestUtils.downVote(t, comment.id),
        CommentTestUtils.downVote(t, comment.id),
      ])
      comment = await CommentTestUtils.getCommentById(t, comment.id)
      expect(comment.votes).toEqual(0)
    })
  })

  describe('POST /comments/:commentId/spam', () => {
    it('adds a new spam report', async () => {
      const comment = await createComment()
      await CommentTestUtils.markAsSpam(t, comment.id)
      const c = await CommentTestUtils.getCommentById(t, comment.id)
      expect(c.spams).toEqual(1)
    })
    it('can only report a spam once', async () => {
      const comment = await createComment()
      async function markAsSpam() {
        return t.post('/comments/:commentId/spam', {
          params: {
            commentId: comment.id,
          },
        })
      }

      const responses = (await Promise.all([
        markAsSpam(),
        markAsSpam(),
      ])).map(r => r.status)

      expect(responses).toContain(200)
      expect(responses).toContain(400)

      const c = await CommentTestUtils.getCommentById(t, comment.id)
      expect(c.spams).toEqual(1)
    })
  })

  describe('DELETE /comments/:commentId/spam', () => {
    it('removes a spam report', async () => {
      let comment = await createComment()
      await CommentTestUtils.markAsSpam(t, comment.id)
      comment = await CommentTestUtils.getCommentById(t, comment.id)
      expect(comment.spams).toEqual(1)
      await CommentTestUtils.unmarkAsSpam(t, comment.id)
      comment = await CommentTestUtils.getCommentById(t, comment.id)
      expect(comment.spams).toEqual(0)
    })
    it('can only remove a spam report once', async () => {
      let comment = await createComment()
      await CommentTestUtils.markAsSpam(t, comment.id)
      await Promise.all([
        CommentTestUtils.unmarkAsSpam(t, comment.id),
        CommentTestUtils.unmarkAsSpam(t, comment.id),
      ])
      comment = await CommentTestUtils.getCommentById(t, comment.id)
      expect(comment.spams).toEqual(0)
    })
  })

})
