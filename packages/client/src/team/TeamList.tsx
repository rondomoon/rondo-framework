import React from 'react'
import {Button, Panel, PanelHeading, PanelBlock} from 'bloomer'
import {FaEdit, FaTimes} from 'react-icons/fa'
import {ITeam, ReadonlyRecord} from '@rondo/common'
import {Link} from 'react-router-dom'
import {TeamActions} from './TeamActions'
import {TeamEditor} from './TeamEditor'

export interface ITeamListProps {
  teamsById: ReadonlyRecord<number, ITeam>,
  teamIds: ReadonlyArray<number>,
  onAddTeam: TeamActions['createTeam']
  onRemoveTeam: TeamActions['removeTeam']
  onUpdateTeam: TeamActions['updateTeam']
}

export interface ITeamProps {
  team: ITeam
  onRemoveTeam: TeamActions['removeTeam']
  onUpdateTeam: TeamActions['updateTeam']
}

export class TeamRow extends React.PureComponent<ITeamProps> {
  handleRemove = async () => {
    const {onRemoveTeam, team: {id}} = this.props
    await onRemoveTeam({id})
  }
  render() {
    const {team} = this.props
    return (
      <React.Fragment>
        <div className='team-name'>
          {team.name}
        </div>
        <div className='ml-auto'>
          <Link to={`/teams/${team.id}/users`}>
            <Button isInverted isColor='link' aria-label='Edit'>
              <FaEdit />
            </Button>
          </Link>
          &nbsp;
          <Button
            aria-label='Remove'
            onClick={this.handleRemove}
            isColor='danger'
            isInverted
          >
            <FaTimes />
          </Button>
        </div>
      </React.Fragment>
    )
  }
}

export class TeamList extends React.PureComponent<ITeamListProps> {
  render() {
    const {teamIds, teamsById} = this.props

    return (
      <Panel>
        <PanelHeading>Teams</PanelHeading>
        {teamIds.map(teamId => {
          const team = teamsById[teamId]
          return (
            <PanelBlock key={team.id}>
              <TeamRow
                onRemoveTeam={this.props.onRemoveTeam}
                onUpdateTeam={this.props.onUpdateTeam}
                team={team}
              />
            </PanelBlock>
          )
        })}

        <PanelBlock isDisplay='block'>
          <TeamEditor
            type='add'
            onAddTeam={this.props.onAddTeam}
          />
        </PanelBlock>
      </Panel>
    )
  }
}
