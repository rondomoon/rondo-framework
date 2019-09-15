import { URLFormatter } from '@rondo.dev/http-client'
import React from 'react'
import { withRouter } from 'react-router'
import { Link as RouterLink } from 'react-router-dom'
import { WithRouterProps } from './WithRouterProps'

export interface LinkProps
extends WithRouterProps<Record<string, string>> {
  readonly className?: string
  readonly to: string
}

class ContextLink extends React.PureComponent<LinkProps> {
  protected readonly urlFormatter = new URLFormatter()

  render() {
    const {
      className,
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
