import {History, Location} from 'history'
import {withRouter, match as Match} from 'react-router'
import React from 'react'

export interface WithHistoryProps {
  history: History
  location: Location
  match: Match
}

export function withHistory<T extends {history: History}>(
  Component: React.ComponentType<T>,
) {
  class HistoryProvider extends React.PureComponent<WithHistoryProps & T> {
    render() {
      const {history, children} = this.props
      return (
        <Component history={history} {...this.props}>
          {children}
        </Component>
      )
    }
  }

  return withRouter(HistoryProvider)
}
