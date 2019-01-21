import {IComment} from '@rondo/common'

export interface ICommentService {
  find(storyId: number): Promise<IComment>

  saveRoot(comment: IComment, userId: number): Promise<IComment>

  save(comment: IComment, userId: number): Promise<IComment>

  edit(comment: IComment, userId: number): Promise<IComment>

  delete(comment: IComment, userId: number): Promise<IComment>

  upVote(commentId: number, userId: number): Promise<void>

  deleteVote(commentId: number, userId: number): Promise<void>

  markAsSpam(commentId: number, userId: number): Promise<void>

  unmarkAsSpam(commentId: number, userId: number): Promise<void>
}
