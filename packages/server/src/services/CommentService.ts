import {BaseService} from './BaseService'
import {IComment} from '@rondo/common'
import {ICommentService} from'./ICommentService'

export class CommentService extends BaseService implements ICommentService {

  async find(storyId: number) {
  }

  async saveRoot(comment: IComment, userId: number) {
  }

  async save(comment: IComment, userId: number) {
  }

  async edit(comment: IComment, userId: number) {
  }

  async delete(comment: IComment, userId: number) {
  }

  async upVote(commentId: number, userId: number) {
  }

  async deleteVote(commentId: number, userId: number) {
  }

  async markAsSpam(commentId: number, userId: number) {
  }

  async unmarkAsSpam(commentId: number, userId: number) {
  }

}
