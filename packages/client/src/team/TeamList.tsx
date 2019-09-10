import { team as Team, TReadonlyRecord } from '@rondo.dev/common';
import { Button, Panel, PanelBlock, PanelHeading } from 'bloomer';
import React from 'react';
import { FaEdit, FaPlus, FaTimes } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export interface ITeamListProps {
  ListButtons?: React.ComponentType<{team: Team.Team}>
  teamsById: TReadonlyRecord<number, Team.Team>
  teamIds: ReadonlyArray<number>
  onAddTeam: Team.TeamActions['create']
  onRemoveTeam: Team.TeamActions['remove']
}

export interface ITeamProps {
  ListButtons?: React.ComponentType<{team: Team.Team}>
  team: Team.Team
  onRemoveTeam: Team.TeamActions['remove']
}

export class TeamRow extends React.PureComponent<ITeamProps> {
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
        <div className='ml-auto'>
          {!!ListButtons && <ListButtons team={team} />}
          &nbsp;
          <Link to={`/teams/${team.id}/users`}>
            <Button isInverted isColor='link' aria-label='Edit Team'>
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
        <PanelHeading>
          <span className='is-flex is-vcentered'>
            <span>Teams</span>
            <Link
              className='ml-auto button is-link is-small'
              to='/teams/new'
            >
              <FaPlus />&nbsp; New
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
