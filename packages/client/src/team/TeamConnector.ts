import {Connector} from '../redux/Connector'
import {pack, TStateSelector} from '@rondo.dev/redux'
import {ITeamState} from './TeamReducer'
import {TeamActions} from './TeamActions'
import {TeamManager} from './TeamManager'
import {bindActionCreators} from 'redux'
import {withRouter} from 'react-router-dom'

export function configure<State>(
  teamActions: TeamActions,
  getLocalState: TStateSelector<State, ITeamState>,
) {
  const Component = pack(
    getLocalState,
    state => ({...state}),
    d => ({
      addUser: bindActionCreators(teamActions.addUser, d),
      removeUser: bindActionCreators(teamActions.removeUser, d),
      createTeam: bindActionCreators(teamActions.createTeam, d),
      updateTeam: bindActionCreators(teamActions.updateTeam, d),
      removeTeam: bindActionCreators(teamActions.removeTeam, d),
      fetchMyTeams: bindActionCreators(teamActions.fetchMyTeams, d),
      fetchUsersInTeam:
        bindActionCreators(teamActions.fetchUsersInTeam, d),
      findUserByEmail:
        bindActionCreators(teamActions.findUserByEmail, d),
    }),
    TeamManager,
  )

  return Component
}
