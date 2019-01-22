import {AsyncRouter} from '../router'
import {BaseRoute} from './BaseRoute'
import {IAPIDef} from '@rondo/common'
import {ICommentService} from '../services/ICommentService'
import {ensureLoggedInApi} from '../middleware'

export class CommentRoutes extends BaseRoute<IAPIDef> {
  constructor(
    protected readonly commentService: ICommentService,
    protected readonly t: AsyncRouter<IAPIDef>,
  ) {
    super(t)
  }

  setup(t: AsyncRouter<IAPIDef>) {

    t.get('/story/:storyId/comments', async req => {
      const {storyId} = req.params
      return this.commentService.find(storyId)
    })

    t.use(ensureLoggedInApi)

    t.post('/story/:storyId/comments', async req => {
      const {storyId} = req.params
      const comment = req.body
      comment.storyId = storyId
      return this.commentService.saveRoot(comment, req.user!.id)
    })

    t.post('/comments/:parentId', async req => {
      const {parentId} = req.params
      const comment = req.body
      comment.parentId = parentId
      return this.commentService.save(comment, req.user!.id)
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
