import React from 'react'
import {IComment} from '@rondo/comments-common'

export interface ICommentProps {
  comment: IComment
}

export class CommentVote extends React.PureComponent {
  render() {
    return 'vote'
  }
}

export class CommentButtons extends React.PureComponent {
  render() {
    return 'buttons'
  }
}

export class Comment extends React.PureComponent<ICommentProps> {
  render() {
    const {comment} = this.props
    return (
      <div className='comment'>
        <span className='score'>{comment.votes}</span>
        <p>{comment.message}</p>

        // TODO add comment children here
      </div>
    )
  }
}

export interface ICommentsProps {
  comments: IComment[]
}

export class Comments extends React.PureComponent<ICommentsProps> {
  render() {
    const {comments} = this.props
    return (
      <div className='comments'>
        {comments.map(comment => <Comment comment={comment} />)}
      </div>
    )
  }
}
