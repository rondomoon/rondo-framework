import React from 'react'
import {Crumb} from './Crumb'
import {History, Location} from 'history'
import {ICrumbLink} from './ICrumbLink'
import {match as Match, matchPath, withRouter} from 'react-router'
import {withHistory} from '../components'

export interface ICrumbsRoute {
  exact?: boolean
  links: ICrumbLink[]
  current: string
}

export interface IHistoryCrumbsProps {
  history: History
  routes: Record<string, ICrumbsRoute>
}

export interface IHistoryCrumbsState {
  links: ICrumbLink[]
  current: string
}

export const HistoryCrumbs = withHistory(
  class InnerHistoryCrumbs
  extends React.PureComponent<IHistoryCrumbsProps, IHistoryCrumbsState> {
    unlisten!: () => void

    constructor(props: IHistoryCrumbsProps) {
      super(props)
      this.state = {
        links: [],
        current : '',
      }
    }

    componentWillMount() {
      this.handleChange(this.props.history.location.pathname)
      this.unlisten = this.props.history.listen((location, action) => {
        this.handleChange(this.props.history.location.pathname)
      })
    }

    componentWillUnmount() {
      this.unlisten()
    }

    handleChange(path: string) {
      const {routes} = this.props

      let found: null | {match: Match<{}>, route: ICrumbsRoute} = null

      Object.keys(routes).some(route => {
        const match = matchPath(path, {
          path: route,
          exact: routes[route].exact,
        })
        if (match) {
          found = {match, route: routes[route]}
          return true
        }
        return false
      })

      if (!found) {
        this.setState({
          links: [],
          current: '',
        })
        return
      }

      this.setState({
        links: found!.route.links,
        current: found!.route.current,
      })
    }

    render() {
      return <Crumb links={this.state.links} current={this.state.current} />
    }
  },
)
