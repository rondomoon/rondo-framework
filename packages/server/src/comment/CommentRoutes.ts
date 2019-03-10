import {AsyncRouter} from '../router'
import {BaseRoute} from '../routes/BaseRoute'
import {IAPIDef} from '@rondo/common'
import {ICommentService} from './ICommentService'
import {ensureLoggedInApi} from '../middleware'

export class CommentRoutes extends BaseRoute<IAPIDef> {
  constructor(
    protected readonly commentService: ICommentService,
    protected readonly t: AsyncRouter<IAPIDef>,
  ) {
    super(t)
  }

  setup(t: AsyncRouter<IAPIDef>) {

    t.get('/stories/:storyId/comments', async req => {
      const {storyId} = req.params
      return this.commentService.find(storyId)
    })

    t.use(ensureLoggedInApi)

    t.post('/stories/:storyId/comments', async req => {
      const userId = req.user!.id
      const storyId = Number(req.params.storyId)
      const {message} = req.body
      return this.commentService.saveRoot({
        message,
        storyId,
        userId,
      })
    })

    t.post('/stories/:storyId/comments/:parentId', async req => {
      const userId = req.user!.id
      const parentId = Number(req.params.parentId)
      const storyId = Number(req.params.storyId)
      const {message} = req.body
      return this.commentService.save({
        message,
        userId,
        parentId,
        storyId,
      })
    })

    t.get('/comments/:commentId', async req => {
      const commentId = req.params.commentId
      const comment = await this.commentService.findOne(commentId)
      // TODO return status code 404 when not found
      return comment!
    })

    t.put('/comments/:commentId', async req => {
      const comment = req.body
      comment.id = req.params.commentId
      return this.commentService.edit(comment, req.user!.id)
    })

    t.delete('/comments/:commentId', async req => {
      const {commentId} = req.params
      return this.commentService.delete(commentId, req.user!.id)
    })

    t.post('/comments/:commentId/vote', async req => {
      const {commentId} = req.params
      return this.commentService.upVote(commentId, req.user!.id)
    })

    t.delete('/comments/:commentId/vote', async req => {
      const {commentId} = req.params
      return this.commentService.deleteVote(commentId, req.user!.id)
    })

    t.post('/comments/:commentId/spam', async req => {
      const {commentId} = req.params
      return this.commentService.markAsSpam(commentId, req.user!.id)
    })

    t.delete('/comments/:commentId/spam', async req => {
      const {commentId} = req.params
      return this.commentService.unmarkAsSpam(commentId, req.user!.id)
    })

  }
}
