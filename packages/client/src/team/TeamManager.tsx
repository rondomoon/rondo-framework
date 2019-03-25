import React from 'react'
import {History, Location} from 'history'
import {ITeam, IUserInTeam, ReadonlyRecord} from '@rondo/common'
import {TeamActions} from './TeamActions'
import {TeamList} from './TeamList'
import {TeamUserList} from './TeamUserList'
import {Title} from 'bloomer'
import {match} from 'react-router'

export interface ITeamManagerProps {
  history: History
  location: Location
  match: match<{
    teamId: string | undefined
  }>

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

  userKeysByTeamId: ReadonlyRecord<number, ReadonlyArray<string>>
  usersByKey: ReadonlyRecord<string, IUserInTeam>
}

export class TeamManager extends React.PureComponent<ITeamManagerProps> {
  async componentDidMount() {
    await this.props.fetchMyTeams()
  }
  render() {
    const {teamId} = this.props.match.params
    const editTeamId = teamId ? Number(teamId) : undefined

    return (
      <div className='team-manager'>
        <Title>Teams</Title>

        <TeamList
          editTeamId={editTeamId}
          teamsById={this.props.teamsById}
          teamIds={this.props.teamIds}
          onAddTeam={this.props.createTeam}
          onRemoveTeam={this.props.removeTeam}
          onUpdateTeam={this.props.updateTeam}
        />

        {editTeamId && <TeamUserList
          onAddUser={this.props.addUser}
          onRemoveUser={this.props.removeUser}
          findUserByEmail={this.props.findUserByEmail}
          fetchUsersInTeam={this.props.fetchUsersInTeam}

          teamId={editTeamId}

          userKeysByTeamId={this.props.userKeysByTeamId}
          usersByKey={this.props.usersByKey}
        />}

      </div>
    )
  }
}
