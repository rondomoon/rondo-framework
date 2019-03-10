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
    it('updates a comment', () => {

    })

    it('fails to update a comment if user is not the owner')

    it('updates a comment if user is site moderator') // TODO later
  })

  describe('DELETE /comments/:commentId', () => {

  })

  describe('POST /comments/:commentId/vote', () => {

  })

  describe('DELETE /comments/:commentId/vote', () => {

  })

  describe('POST /comments/:commentId/spam', () => {

  })

  describe('DELETE /comments/:commentId/spam', () => {

  })

})
