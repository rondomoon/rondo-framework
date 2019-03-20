import React from 'react'
import {ITeam, IUser, IUserInTeam, ReadonlyRecord} from '@rondo/common'
import {TeamList} from './TeamList'
import {TeamUserList} from './TeamUserList'
// import {Route} from 'react-router-dom'

export interface ITeamManagerProps {
  createTeam: (params: {name: string}) => Promise<void>
  updateTeam: (params: {id: number, name: string}) => Promise<void>
  removeTeam: (params: {id: number}) => Promise<void>

  addUser: (params: {userId: number, teamId: number}) => Promise<void>
  removeUser: (params: {userId: number, teamId: number}) => Promise<void>
  fetchMyTeams: () => void
  fetchUsersInTeam: () => void
  findUserByEmail: (email: string) => Promise<IUser>

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
