import { TeamActions, UserActions } from '@rondo.dev/common'
import { bindActionCreators, pack, SelectState } from '@rondo.dev/redux'
import { TeamManager } from './TeamManager'
import { TeamState } from './TeamReducer'

export function configureTeam<State>(
  getLocalState: SelectState<State, TeamState>,
  teamActions: TeamActions,
  userActions: UserActions,
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
