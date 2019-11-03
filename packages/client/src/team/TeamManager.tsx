import { ReadonlyRecord, Team, TeamActions, UserActions, UserInTeam } from '@rondo.dev/common'
import { History, Location } from 'history'
import React from 'react'
import { match as Match } from 'react-router'
import { Route, Switch } from 'react-router-dom'
import { Panel, PanelBlock, PanelHeading } from '../components'
import { TeamEditor } from './TeamEditor'
import { TeamList } from './TeamList'
import { TeamUserList } from './TeamUserList'

export interface TeamManagerProps {
  history: History
  location: Location
  match: Match<any> // eslint-disable-line

  ListButtons?: React.ComponentType<{team: Team}>

  teamActions: TeamActions
  findUserByEmail: UserActions['findUserByEmail']

  teamsById: ReadonlyRecord<number, Team>
  teamIds: ReadonlyArray<number>

  userKeysByTeamId: ReadonlyRecord<number, ReadonlyArray<string>>
  usersByKey: ReadonlyRecord<string, UserInTeam>
}

export class TeamManager extends React.PureComponent<TeamManagerProps> {
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
                  <PanelBlock>
                    {team && <TeamEditor
                      key={team.id}
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
