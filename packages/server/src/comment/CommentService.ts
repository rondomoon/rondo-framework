import {UniqueTransformer} from '../error/ErrorTransformer'
import {BaseService} from '../services/BaseService'
import {Comment} from '../entities/Comment'
import {ICommentService} from './ICommentService'
import {ICommentTree} from '@rondo/common'
import {IEditCommentParams} from './IEditCommentParams'
import {INewCommentParams} from './INewCommentParams'
import {INewRootCommentParams} from './INewRootCommentParams'
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

  async saveRoot(comment: INewRootCommentParams) {
    new Validator(comment)
    .ensure('message')
    .ensure('storyId')
    .ensure('userId')
    .throw()

    const {
      message,
      userId,
      storyId,
    } = comment

    return this.getRepository(Comment).save({
      message: message.trim(),
      userId,
      storyId,
      parentId: undefined,

      votes: 0,
      spams: 0,
    })
  }

  async save(comment: INewCommentParams) {
    new Validator(comment)
    .ensure('message')
    .ensure('userId')
    .ensure('storyId')
    .ensure('parentId')
    .throw()

    const {
      message,
      userId,
      storyId,
      parentId,
    } = comment

    return this.getRepository(Comment).save({
      message: message.trim(),
      userId,
      storyId,
      parentId,

      votes: 0,
      spams: 0,
    })
  }

  async edit(comment: IEditCommentParams) {
    new Validator(comment)
    .ensure('id')
    .ensure('message')
    .ensure('userId')
    .throw()

    const {id, message, userId} = comment

    await this.getRepository(Comment)
    .update({
      id,
      userId,
    }, {
      message,
    })
    const editedComment = await this.findOne(comment.id)

    if (!editedComment) {
      // TODO 400 or 404
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
      message: '(this message has been removed)',
    })

    return this.findOne(commentId)
  }

  async upVote(commentId: number, userId: number) {
    try {
      await this.getRepository(Vote)
      .save({
        commentId,
        userId,
      })
    } catch (err) {
      UniqueTransformer.transform(err, 'Already upvoted!')
    }

    await this.getRepository(Comment)
    .createQueryBuilder()
    .update()
    .where({ id: commentId })
    .set({
      votes: () => 'votes + 1',
    })
    .execute()
  }

  async deleteVote(commentId: number, userId: number) {
    await this.getRepository(Vote)
    .delete({
      commentId,
      userId,
    })

    // TODO rows.affected returns undefined or SQLite driver. This is an
    // alternative query that does not depend on it.
    await this.getRepository(Comment)
    .createQueryBuilder()
    .update()
    .where({ id: commentId })
    .set({
      votes: () => '(select count(*) from vote where commentId = comment.id)',
    })
    .execute()
  }

  async markAsSpam(commentId: number, userId: number) {
    try {
      await this.getRepository(Spam)
      .save({
        commentId,
        userId,
      })
    } catch (err) {
      UniqueTransformer.transform(err, 'Already marked as spam!')
    }

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
    await this.getRepository(Spam)
    .delete({
      commentId,
      userId,
    })

    // TODO rows.affected returns undefined or SQLite driver. This is an
    // alternative query that does not depend on it.
    await this.getRepository(Comment)
    .createQueryBuilder()
    .update()
    .where({ id: commentId })
    .set({
      spams: () => '(select count(*) from spam where commentId = comment.id)',
    })
    .execute()
  }

}
