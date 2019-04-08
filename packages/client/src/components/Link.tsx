import React from 'react'
import {History, Location} from 'history'
import {IWithRouterProps} from './IWithRouterProps'
import {Link as RouterLink, LinkProps} from 'react-router-dom'
import {URLFormatter} from '@rondo/common'
import {withRouter} from 'react-router'

export interface ILinkProps
extends IWithRouterProps<Record<string, string>> {
  readonly className?: string
  readonly to: string
}

class ContextLink extends React.PureComponent<ILinkProps> {
  protected readonly urlFormatter = new URLFormatter()

  render() {
    const {
      className,
      history,
      location,
      match,
      to,
      children,
    } = this.props

    const href = this.urlFormatter.format(to, match.params)

    return (
      <RouterLink className={className} to={href}>
        {children}
      </RouterLink>
    )
  }
}

export const Link = withRouter(ContextLink)
