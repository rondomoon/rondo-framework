import React from 'react'
import {IAction} from '../actions'
import {ITeam, IUser, IUserInTeam, ReadonlyRecord} from '@rondo/common'
import {TeamList} from './TeamList'
import {TeamUserList} from './TeamUserList'

export interface ITeamManagerProps {
  createTeam: (params: {name: string}) => IAction
  updateTeam: (params: {id: number, name: string}) => IAction
  removeTeam: (params: {id: number}) => IAction

  addUser: (params: {userId: number, teamId: number, roleId: number}) => IAction
  removeUser: (params: {userId: number, teamId: number}) => IAction
  fetchMyTeams: () => IAction
  fetchUsersInTeam: (params: {teamId: number}) => IAction
  findUserByEmail: (email: string) => IAction<IUser | undefined>

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
