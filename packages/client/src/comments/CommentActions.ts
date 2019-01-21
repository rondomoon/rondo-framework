import {IHTTPClient} from '../http'
import {IComment, IAPIDef} from '@rondo/common'

export enum ICommentActionTypes {
  VOTE_UP = 'VOTE_UP',
  VOTE_DOWN = 'VOTE_DOWN',
  COMMENTS_RETRIEVE = 'COMMENTS_RETRIEVE',
  COMMENT_ADD = 'COMMENT_ADD',
  COMMENT_EDIT = 'COMMENT_EDIT',
  COMMENT_REMOVE = 'COMMENT_DELETE',

  SPAM_MARK = 'SPAM_MARK',
  SPAM_UNMARK = 'SPAM_UNMARK',
}

export class CommentActions {
  constructor(protected readonly http: IHTTPClient<IAPIDef>) {}

  voteUp(comment: IComment) {
    return {
      payload: this.http.post('/comments/:commentId/vote', null, {
        commentId: comment.id,
      }),
      type: ICommentActionTypes.VOTE_UP,
    }
  }

  voteDown(comment: IComment) {
    return {
      payload: this.http.delete('/comments/:commentId/vote', null, {
        commentId: comment.id,
      }),
      type: ICommentActionTypes.VOTE_DOWN,
    }
  }

  getComments(storyId: number) {
    return {
      payload: this.http.get('/story/:storyId/comments', null, {
        storyId,
      }),
      type: ICommentActionTypes.COMMENTS_RETRIEVE,
    }
  }

  addComment(comment: IComment) {
    if (!comment.parentId) {
      // root comment
      return {
        payload: this.http.post('/story/:storyId/comments', comment, {
          storyId: comment.storyId,
        }),
        type: ICommentActionTypes.COMMENT_ADD,
      }
    }

    // nested comment
    return {
      payload: this.http.post('/comments/:parentId', comment, {
        parentId: comment.parentId,
      }),
      type: ICommentActionTypes.COMMENT_ADD,
    }
  }

  editComment(comment: IComment) {
    return {
      payload: this.http.put('/comments/:commentId', comment, {
        commentId: comment.id,
      }),
      type: ICommentActionTypes.COMMENT_EDIT,
    }
  }

  removeComment(comment: IComment) {
    return {
      payload: this.http.delete('/comments/:commentId', null, {
        commentId: comment.id,
      }),
      type: ICommentActionTypes.COMMENT_REMOVE,
    }
  }

  markAsSpam(comment: IComment) {
    return {
      payload: this.http.post('/comments/:commentId/spam', comment, {
        commentId: comment.id,
      }),
      type: ICommentActionTypes.SPAM_MARK,
    }
  }

  unmarkAsSpam(comment: IComment) {
    return {
      payload: this.http.delete('/comments/:commentId/spam', null, {
        commentId: comment.id,
      }),
      type: ICommentActionTypes.SPAM_UNMARK,
    }
  }

}
