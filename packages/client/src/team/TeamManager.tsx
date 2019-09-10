import { IUserInTeam, team as Team, TReadonlyRecord, user as User } from '@rondo.dev/common'
import { Panel, PanelBlock, PanelHeading } from 'bloomer'
import { History, Location } from 'history'
import React from 'react'
import { match as Match } from 'react-router'
import { Route, Switch } from 'react-router-dom'
import { TeamEditor } from './TeamEditor'
import { TeamList } from './TeamList'
import { TeamUserList } from './TeamUserList'

export interface ITeamManagerProps {
  history: History
  location: Location
  match: Match<any>

  ListButtons?: React.ComponentType<{team: Team.Team}>

  teamActions: Team.TeamActions
  findUserByEmail: User.UserActions['findUserByEmail']

  teamsById: TReadonlyRecord<number, Team.Team>
  teamIds: ReadonlyArray<number>

  userKeysByTeamId: TReadonlyRecord<number, ReadonlyArray<string>>
  usersByKey: TReadonlyRecord<string, IUserInTeam>
}

export class TeamManager extends React.PureComponent<ITeamManagerProps> {
  async componentDidMount() {
    await this.props.teamActions.find()
  }
  handleCreateNewTeam = (team: {name: string}) => {
    const action = this.props.teamActions.create(team)
    action.payload
    .then(() => this.props.history.push('/teams'))
    .catch(() => {/* do nothing */})
    return action
  }
  render() {
    const {teamsById} = this.props

    return (
      <div className='team-manager'>
        <Route exact path='/teams/new' render={() =>
          <TeamEditor
            type='add'
            onAddTeam={this.handleCreateNewTeam}
          />
        }/>
        <Switch>
          <Route exact path='/teams' render={() =>
            <>
              <TeamList
                ListButtons={this.props.ListButtons}
                teamsById={teamsById}
                teamIds={this.props.teamIds}
                onAddTeam={this.props.teamActions.create}
                onRemoveTeam={this.props.teamActions.remove}
              />
            </>
          }/>
          <Route exact path='/teams/:teamId/users' render={({match}) => {
            const {teamId: teamIdParam} = match.params
            const teamId = teamIdParam ? Number(teamIdParam) : undefined
            const team = teamId ? teamsById[teamId] : undefined
            return (
              <>
                <Panel>
                  <PanelHeading>Edit Team: {team && team.name}</PanelHeading>
                  <PanelBlock isDisplay='block'>
                    {team && <TeamEditor
                      type='update'
                      team={team}
                      onUpdateTeam={this.props.teamActions.update}
                    />}
                    {!team && 'No team loaded'}
                  </PanelBlock>
                </Panel>
                {team && <TeamUserList
                  onAddUser={this.props.teamActions.addUser}
                  onRemoveUser={this.props.teamActions.removeUser}
                  findUserByEmail={this.props.findUserByEmail}
                  fetchUsersInTeam={this.props.teamActions.findUsers}
                  team={team}
                  userKeysByTeamId={this.props.userKeysByTeamId}
                  usersByKey={this.props.usersByKey}
                />}
              </>
            )
          }}/>
        </Switch>
      </div>
    )
  }
}
