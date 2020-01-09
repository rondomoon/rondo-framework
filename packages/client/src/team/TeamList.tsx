import { ReadonlyRecord, Team, TeamActions } from '@rondo.dev/common'
import { Button, Panel, PanelBlock, PanelHeading } from '../components'
import React from 'react'
import { FaEdit, FaPlus, FaTimes } from 'react-icons/fa'
import { Link } from 'react-router-dom'

export interface TeamListProps {
  ListButtons?: React.ComponentType<{team: Team}>
  teamsById: ReadonlyRecord<number, Team>
  teamIds: ReadonlyArray<number>
  onAddTeam: TeamActions['create']
  onRemoveTeam: TeamActions['remove']
}

export interface TeamProps {
  ListButtons?: React.ComponentType<{team: Team}>
  team: Team
  onRemoveTeam: TeamActions['remove']
}

export const marginLeft = {marginLeft: 'auto'}

export class TeamRow extends React.PureComponent<TeamProps> {
  handleRemove = async () => {
    const {onRemoveTeam, team: {id}} = this.props
    await onRemoveTeam({id}).payload
  }
  render() {
    const {team, ListButtons} = this.props
    return (
      <React.Fragment>
        <div className='team-name'>
          {team.name}
        </div>
        <div style={marginLeft}>
          {!!ListButtons && <ListButtons team={team} />}
          &nbsp;
          <Link to={`/teams/${team.id}/users`}>
            <Button colorScheme='primary' aria-label='Edit Team'>
              <FaEdit />
            </Button>
          </Link>
          &nbsp;
          <Button
            aria-label='Remove'
            colorScheme='danger'
            onClick={this.handleRemove}
          >
            <FaTimes />
          </Button>
        </div>
      </React.Fragment>
    )
  }
}

export class TeamList extends React.PureComponent<TeamListProps> {
  render() {
    const {teamIds, teamsById} = this.props

    return (
      <Panel>
        <PanelHeading>
          <span>Teams</span>
            <span style={marginLeft}>
            <Link
              className='ml-auto'
              to='/teams/new'
            >
              <Button>
                <FaPlus />&nbsp; New
              </Button>
            </Link>
          </span>
        </PanelHeading>
        {teamIds.map(teamId => {
          const team = teamsById[teamId]
          return (
            <PanelBlock key={team.id}>
              <TeamRow
                ListButtons={this.props.ListButtons}
                onRemoveTeam={this.props.onRemoveTeam}
                team={team}
              />
            </PanelBlock>
          )
        })}
      </Panel>
    )
  }
}
