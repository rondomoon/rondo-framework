import {IComment} from './IComment'

export interface ICommentTree {
  rootIds: number[],
  commentsById: {
    [key: number]: IComment
  }
}
