import React from 'react'
import {ITeam, ReadonlyRecord} from '@rondo/common'
import {Link} from 'react-router-dom'
import {TeamActions} from './TeamActions'
import {FaPlusSquare, FaSave, FaEdit, FaTimes} from 'react-icons/fa'

import {
  Button, Control, Heading, Input, Panel, PanelHeading, PanelBlock
} from 'bloomer'

export interface ITeamListProps {
  teamsById: ReadonlyRecord<number, ITeam>,
  teamIds: ReadonlyArray<number>,
  onAddTeam: TeamActions['createTeam']
  onRemoveTeam: TeamActions['removeTeam']
  onUpdateTeam: TeamActions['updateTeam']
  editTeamId?: number
}

export interface ITeamProps {
  team: ITeam
  editTeamId?: number
  onRemoveTeam: TeamActions['removeTeam']
  onUpdateTeam: TeamActions['updateTeam']
}

export interface IAddTeamProps {
  onAddTeam: TeamActions['createTeam']
  onUpdateTeam: TeamActions['updateTeam']
  team?: ITeam
}

export interface IAddTeamState {
  name: string
}

export class TeamAdd extends React.PureComponent<IAddTeamProps, IAddTeamState> {
  constructor(props: IAddTeamProps) {
    super(props)
    this.state = {
      name: this.getName(props.team),
    }
  }
  getName(team?: ITeam) {
    return team ? team.name : ''
  }
  componentWillReceiveProps(nextProps: IAddTeamProps) {
    const {team} = nextProps
    if (team !== this.props.team) {
      this.setState({
        name: this.getName(team),
      })
    }
  }
  handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.value
    this.setState({name})
  }
  handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const {team, onAddTeam, onUpdateTeam} = this.props
    const {name} = this.state
    if (team) {
      await onUpdateTeam({id: team.id, name})
    } else {
      await onAddTeam({name})
    }
  }
  render() {
    return (
      <form className='team-add' onSubmit={this.handleSubmit}>
        <Heading>
          {this.props.team ? 'Edit team' : 'Add team'}
        </Heading>
        <Control hasIcons='left'>
          <Input
            placeholder='New Team Name'
            type='text'
            value={this.state.name}
            onChange={this.handleChange}
          />
          <span className='icon is-left'>
            <FaPlusSquare />
          </span>
        </Control>
        <div className='text-right mt-1'>
          <Button
            className='button is-primary'
            type='submit'
          >
            <FaSave className='mr-1' /> Save
          </Button>
        </div>
      </form>
    )
  }
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
            <Button aria-label='Edit'>
              <FaEdit />
            </Button>
          </Link>
          &nbsp;
          <Button
            aria-label='Remove'
            onClick={this.handleRemove}
            isColor='danger'
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
    const {editTeamId, teamIds, teamsById} = this.props

    return (
      <Panel>
        {!editTeamId && (
          <React.Fragment>
            <PanelHeading>Teams</PanelHeading>
            {teamIds.map(teamId => {
              const team = teamsById[teamId]
              return (
                <PanelBlock key={team.id}>
                  <TeamRow
                    editTeamId={editTeamId}
                    onRemoveTeam={this.props.onRemoveTeam}
                    onUpdateTeam={this.props.onUpdateTeam}
                    team={team}
                  />
                </PanelBlock>
              )
            })}

            <PanelBlock isDisplay='block'>
              <TeamAdd
                onAddTeam={this.props.onAddTeam}
                onUpdateTeam={undefined as any}
              />
            </PanelBlock>
          </React.Fragment>
        )}

        {editTeamId && (
          <PanelBlock isDisplay='block'>
            <TeamAdd
              team={teamsById[editTeamId]}
              onAddTeam={undefined as any}
              onUpdateTeam={this.props.onUpdateTeam}
            />
          </PanelBlock>
        )}
      </Panel>
    )
  }
}
