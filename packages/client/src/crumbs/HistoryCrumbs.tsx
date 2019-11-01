import { History } from 'history'
import React from 'react'
import { match as Match, matchPath } from 'react-router'
import { withHistory } from '../components'
import { Crumb } from './Crumb'
import { CrumbLink } from './CrumbLink'

export interface CrumbsRoute {
  exact?: boolean
  links: CrumbLink[]
  current: string
}

export interface HistoryCrumbsProps {
  history: History
  routes: Record<string, CrumbsRoute>
}

export interface HistoryCrumbsState {
  links: CrumbLink[]
  current: string
}

export const HistoryCrumbs = withHistory(
  class InnerHistoryCrumbs
  extends React.PureComponent<HistoryCrumbsProps, HistoryCrumbsState> {
    unlisten!: () => void

    constructor(props: HistoryCrumbsProps) {
      super(props)
      this.state = {
        links: [],
        current : '',
      }
    }

    componentDidMount() {
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

      let found: null | {match: Match<{}>, route: CrumbsRoute} = null

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
