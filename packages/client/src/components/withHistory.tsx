import {History, Location} from 'history'
import {withRouter, match as Match} from 'react-router'
import React from 'react'

export interface IWithHistoryProps {
  history: History
  location: Location
  match: Match
}

export function withHistory<T extends {history: History}>(
  Component: React.ComponentType<T>,
) {
  class HistoryProvider extends React.PureComponent<IWithHistoryProps & T> {
    render() {
      const {history, location, match, children, ...props} = this.props
      return (
        <Component history={history} {...this.props}>
          {children}
        </Component>
      )
    }
  }

  return withRouter(HistoryProvider)
}
