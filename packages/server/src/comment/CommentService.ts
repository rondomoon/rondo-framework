import {BaseService} from '../services/BaseService'
import {Comment} from '../entities/Comment'
import {ICommentService} from './ICommentService'
import {IComment, ICommentTree} from '@rondo/common'
import {Spam} from '../entities/Spam'
import {Validator} from '../validator'
import {Vote} from '../entities/Vote'

export class CommentService extends BaseService implements ICommentService {

  async find(storyId: number) {
    const comments = await this.getRepository(Comment).find({
      where: {
        storyId,
      },
    })

    const commentTree: ICommentTree = {
      rootIds: [],
      commentsById: {},
    }
    comments.reduce((obj, comment) => {
      obj[comment.id] = comment
      const {parentId} = comment
      if (!parentId) {
        commentTree.rootIds.push(comment.id)
        return obj
      }
      const children =
        obj[parentId].childrenIds =
        obj[parentId].childrenIds || []
      children.push(comment.id)
      return obj
    }, commentTree.commentsById)

    return commentTree
  }

  async findOne(commentId: number) {
    return this.getRepository(Comment).findOne(commentId)
  }

  async saveRoot(comment: IComment, userId: number) {
    new Validator(comment)
    .ensure('storyId')
    .throw()

    delete comment.id
    comment.parentId = 0
    comment.userId = userId
    comment.votes = 0
    comment.spams = 0
    return this.getRepository(Comment).save(comment)
  }

  async save(comment: IComment, userId: number) {
    new Validator(comment)
    .ensure('message')
    .ensure('userId')
    .ensure('storyId')
    .ensure('parentId')
    .throw()

    delete comment.id

    comment.votes = 0
    comment.spams = 0
    comment.userId = userId

    return this.getRepository(Comment).save(comment)
  }

  async edit(comment: IComment, userId: number) {
    new Validator(comment)
    .ensure('id')
    .ensure('message')
    .throw()

    await this.getRepository(Comment)
    .update(comment.id, {
      message: comment.message,
      userId,
    })
    const editedComment = await this.findOne(comment.id)

    if (!editedComment) {
      throw new Error('Comment not found')
    }
    return editedComment
  }

  async delete(commentId: number, userId: number) {
    await this.getRepository(Comment)
    .update({
      id: commentId,
      userId,
    }, {
      message: '(this message has been removed by the user)',
    })

    return this.findOne(commentId)
  }

  async upVote(commentId: number, userId: number) {
    await this.getRepository(Vote)
    .save({
      commentId,
      userId,
    })

    await this.getRepository(Comment)
    .createQueryBuilder()
    .update()
    .where({ id: commentId })
    .set({
      score: () => 'score + 1',
    })
    .execute()
  }

  async deleteVote(commentId: number, userId: number) {
    const result = await this.getRepository(Vote)
    .delete({
      commentId,
      userId,
    })

    if (result.affected && result.affected === 1) {
      await this.getRepository(Comment)
      .createQueryBuilder()
      .update()
      .where({ id: commentId })
      .set({
        score: () => 'score - 1',
      })
    }
  }

  async markAsSpam(commentId: number, userId: number) {
    await this.getRepository(Spam)
    .save({
      commentId,
      userId,
    })

    await this.getRepository(Comment)
    .createQueryBuilder()
    .update()
    .where({ id: commentId })
    .set({
      spams: () => 'spams + 1',
    })
    .execute()
  }

  async unmarkAsSpam(commentId: number, userId: number) {
    const result = await this.getRepository(Spam)
    .delete({
      commentId,
      userId,
    })

    if (result.affected && result.affected === 1) {
      await this.getRepository(Comment)
      .createQueryBuilder()
      .update()
      .where({ id: commentId })
      .set({
        spams: () => 'spams - 1',
      })
    }
  }

}
