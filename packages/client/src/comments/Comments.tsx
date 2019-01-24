import React from 'react'
import {IComment} from '@rondo/common'

export interface ICommentProps {
  comment: IComment
}

export class CommentVote extends React.PureComponent {
  render() {
    return (
    )
  }
}

export class CommentButtons extends React.PureComponent {
  render() {

  }
}

export class Comment extends React.PureComponent<ICommentProps> {
  render() {
    const {comment} = this.props
    return (
      <div className='comment'>
        <span className='score'>{comment.score}</span>
        <p>{comment.message}</p>

        <Comments comments={comment.children} />
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
