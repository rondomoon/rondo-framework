import React from 'react'
import {ITeam, IUserInTeam, ReadonlyRecord} from '@rondo/common'
import {Route, Switch} from 'react-router-dom'
import {TeamActions} from './TeamActions'
import {TeamEditor} from './TeamEditor'
import {TeamList} from './TeamList'
import {TeamUserList} from './TeamUserList'
import {Panel, PanelBlock, PanelHeading} from 'bloomer'

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

  userKeysByTeamId: ReadonlyRecord<number, ReadonlyArray<string>>
  usersByKey: ReadonlyRecord<string, IUserInTeam>
}

export class TeamManager extends React.PureComponent<ITeamManagerProps> {
  async componentDidMount() {
    await this.props.fetchMyTeams()
  }
  render() {
    const {teamsById} = this.props

    return (
      <div className='team-manager'>
        <Switch>
          <Route exact path='/teams' render={() =>
            <TeamList
              teamsById={teamsById}
              teamIds={this.props.teamIds}
              onAddTeam={this.props.createTeam}
              onRemoveTeam={this.props.removeTeam}
              onUpdateTeam={this.props.updateTeam}
            />
          }/>
          <Route exact path='/teams/:teamId/users' render={({match}) => {
            const {teamId: teamIdParam} = match.params
            const teamId = teamIdParam ? Number(teamIdParam) : undefined
            const team = teamId ? teamsById[teamId] : undefined
            return (
              <React.Fragment>
                <Panel>
                  <PanelHeading>Edit Team: {team && team.name}</PanelHeading>
                  <PanelBlock isDisplay='block'>
                    {team && <TeamEditor
                      type='update'
                      team={team}
                      onUpdateTeam={this.props.updateTeam}
                    />}
                    {!team && 'No team loaded'}
                  </PanelBlock>
                </Panel>
                {team && <TeamUserList
                  onAddUser={this.props.addUser}
                  onRemoveUser={this.props.removeUser}
                  findUserByEmail={this.props.findUserByEmail}
                  fetchUsersInTeam={this.props.fetchUsersInTeam}
                  team={team}
                  userKeysByTeamId={this.props.userKeysByTeamId}
                  usersByKey={this.props.usersByKey}
                />}
              </React.Fragment>
            )
          }}/>
        </Switch>
      </div>
    )
  }
}
