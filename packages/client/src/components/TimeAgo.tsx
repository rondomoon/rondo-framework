import {format} from 'timeago.js'
import React from 'react'

export interface TimeAgoProps {
  className?: string
  date: Date | string
}

export class TimeAgo extends React.PureComponent<TimeAgoProps> {
  render() {
    return (
      <time className={this.props.className}>
        {format(this.props.date)}
      </time>
    )
  }
}
