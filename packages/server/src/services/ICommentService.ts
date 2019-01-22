import {IComment} from '@rondo/common'

export interface ICommentTree {
  rootIds: number[],
  commentsById: {
    [key: number]: IComment
  }
}

export interface ICommentService {
  find(storyId: number): Promise<ICommentTree>

  findOne(commentId: number): Promise<IComment | undefined>

  saveRoot(comment: IComment, userId: number): Promise<IComment>

  save(comment: IComment, userId: number): Promise<IComment>

  edit(comment: IComment, userId: number): Promise<IComment>

  delete(comment: IComment, userId: number): Promise<IComment | undefined>

  upVote(commentId: number, userId: number): Promise<void>

  deleteVote(commentId: number, userId: number): Promise<void>

  markAsSpam(commentId: number, userId: number): Promise<void>

  unmarkAsSpam(commentId: number, userId: number): Promise<void>
}
