import {AsyncRouter} from '../router'
import {BaseRoute} from './BaseRoute'
import {IAPIDef} from '@rondo/common'
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
      // TODO retrieve comments from story
      return []
    })

    t.use(ensureLoggedInApi)

    t.post('/story/:storyId/comments', async req => {
      const comment = req.body
      // TODO save a comment
      return comment
    })

    t.post('/comments/:parentId', async req => {
      const comment = req.body
      // TODO save a comment
      return comment
    })

    t.put('/comments/:commentId', async req => {
      const comment = req.body
      // TODO edit a comment
      return comment
    })

    t.delete('/comments/:commentId', async req => {
      const {commentId} = req.params
      // TODO delete a comment
    })

    t.post('/comments/:commentId/vote', async req => {
      const {commentId} = req.params
      // TODO upvote a comment
    })

    t.delete('/comments/:commentId/vote', async req => {
      const {commentId} = req.params
      // TODO delete a vote
    })

    t.post('/comments/:commentId/spam', async req => {
      const {commentId} = req.params
      // TODO report comment as spam
    })

    t.delete('/comments/:commentId/spam', async req => {
      const {commentId} = req.params
      // TODO delete spam report
    })

  }
}
