import React from 'react'
import {Redirect as RouterRedirect} from 'react-router-dom'
import {RedirectProps} from 'react-router'
import {isClientSide} from '../renderer'

export class Redirect extends React.PureComponent<RedirectProps> {
  render() {
    if (isClientSide()) {
      return <RouterRedirect {...this.props}/>
    }

    const href = typeof this.props.to === 'string'
      ? this.props.to : this.props.to.pathname

    return (
      <span>
        You are being redirected.
        Click <a href={href}>here</a> to {'continue'}
      </span>
    )
  }
}
