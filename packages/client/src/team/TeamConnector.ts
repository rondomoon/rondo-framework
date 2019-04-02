import {Connector} from '../redux/Connector'
import {TStateSelector} from '../redux'
import {ITeamState} from './TeamReducer'
import {TeamActions} from './TeamActions'
import {TeamManager} from './TeamManager'
import {bindActionCreators} from 'redux'
import {withRouter} from 'react-router-dom'

export class TeamConnector extends Connector<ITeamState> {
  constructor(protected readonly teamActions: TeamActions) {
    super()
  }

  connect<State>(getLocalState: TStateSelector<State, ITeamState>) {
    const Component = this.wrap(
      getLocalState,
      state => ({
        ...state,
      }),
      d => ({
        addUser: bindActionCreators(this.teamActions.addUser, d),
        removeUser: bindActionCreators(this.teamActions.removeUser, d),
        createTeam: bindActionCreators(this.teamActions.createTeam, d),
        updateTeam: bindActionCreators(this.teamActions.updateTeam, d),
        removeTeam: bindActionCreators(this.teamActions.removeTeam, d),
        fetchMyTeams: bindActionCreators(this.teamActions.fetchMyTeams, d),
        fetchUsersInTeam:
          bindActionCreators(this.teamActions.fetchUsersInTeam, d),
        findUserByEmail:
          bindActionCreators(this.teamActions.findUserByEmail, d),
      }),
      TeamManager,
    )

    return withRouter(Component)
  }
}
