import { team, user } from '@rondo.dev/common'
import { TReduxed } from '@rondo.dev/jsonrpc'
import { bindActionCreators, pack, TStateSelector } from '@rondo.dev/redux'
import { TeamManager } from './TeamManager'
import { ITeamState } from './TeamReducer'

export function configure<State>(
  teamActions: team.TeamActions,
  userActions: user.UserActions,
  getLocalState: TStateSelector<State, ITeamState>,
) {
  const Component = pack(
    getLocalState,
    state => ({...state}),
    dispatch => ({
      teamActions: bindActionCreators(teamActions, dispatch),
      findUserByEmail: bindActionCreators(
        userActions.findUserByEmail, dispatch),
    }),
    TeamManager,
  )

  return Component
}
