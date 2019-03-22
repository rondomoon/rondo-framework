import React from 'react'
import {ITeam, IUserInTeam, ReadonlyRecord} from '@rondo/common'
import {TeamList} from './TeamList'
import {TeamUserList} from './TeamUserList'
import {TeamActions} from './TeamActions'

export interface ITeamManagerProps {
  createTeam: TeamActions['createTeam']
  updateTeam: TeamActions['updateTeam']
  removeTeam: TeamActions['removeTeam']

  addUser: TeamActions['addUser']
  removeUser: TeamActions['removeUser']
  fetchMyTeams: TeamActions['fetchMyTeams']
  fetchUsersInTeam: TeamActions['fetchUsersInTeam']
  findUserByEmail: TeamActions['findUserByEmail']

  teamsById: ReadonlyRecord<number, ITeam>
  teamIds: ReadonlyArray<number>

  editTeamId: number

  userKeysByTeamId: ReadonlyRecord<number, ReadonlyArray<string>>
  usersByKey: ReadonlyRecord<string, IUserInTeam>
}

export class TeamManager extends React.PureComponent<ITeamManagerProps> {
  async componentDidMount() {
    await this.props.fetchMyTeams()
  }
  render() {
    // TODO load my teams on first launch
    // TODO use teamId from route url
    // TODO use editTeamId from route url
    const {editTeamId} = this.props

    return (
      <React.Fragment>
        <TeamList
          editTeamId={this.props.editTeamId}
          teamsById={this.props.teamsById}
          teamIds={this.props.teamIds}
          onAddTeam={this.props.createTeam}
          onRemoveTeam={this.props.removeTeam}
          onUpdateTeam={this.props.updateTeam}
        />

        <TeamUserList
          onAddUser={this.props.addUser}
          onRemoveUser={this.props.removeUser}
          findUserByEmail={this.props.findUserByEmail}
          fetchUsersInTeam={this.props.fetchUsersInTeam}

          teamId={editTeamId}

          userKeysByTeamId={this.props.userKeysByTeamId}
          usersByKey={this.props.usersByKey}
        />

      </React.Fragment>
    )
  }
}
