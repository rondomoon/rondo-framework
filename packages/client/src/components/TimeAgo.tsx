import {format} from 'timeago.js'
import React from 'react'

export interface ITimeAgoProps {
  className?: string
  date: Date | string
}

export class TimeAgo extends React.PureComponent<ITimeAgoProps> {
  render() {
    return (
      <time className={this.props.className}>
        {format(this.props.date)}
      </time>
    )
  }
}
