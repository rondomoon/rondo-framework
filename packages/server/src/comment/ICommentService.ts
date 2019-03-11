import {IComment, ICommentTree} from '@rondo/common'
import {IEditCommentParams} from './IEditCommentParams'
import {INewCommentParams} from './INewCommentParams'
import {INewRootCommentParams} from './INewRootCommentParams'

export interface ICommentService {
  find(storyId: number): Promise<ICommentTree>

  findOne(commentId: number): Promise<IComment | undefined>

  saveRoot(comment: INewRootCommentParams): Promise<IComment>

  save(comment: INewCommentParams): Promise<IComment>

  edit(comment: IEditCommentParams): Promise<IComment>

  delete(commentId: number, userId: number): Promise<IComment | undefined>

  upVote(commentId: number, userId: number): Promise<void>

  deleteVote(commentId: number, userId: number): Promise<void>

  markAsSpam(commentId: number, userId: number): Promise<void>

  unmarkAsSpam(commentId: number, userId: number): Promise<void>
}
