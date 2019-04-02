import {match as Match} from 'react-router'
import {History, Location} from 'history'

export interface IWithRouterProps<MatchProps = unknown> {
  history: History
  location: Location
  match: Match<MatchProps>
}
