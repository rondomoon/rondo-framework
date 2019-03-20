import React from 'react'
import {ITeam, ReadonlyRecord} from '@rondo/common'

export interface ITeamListProps {
  teamsById: ReadonlyRecord<number, ITeam>,
  teamIds: ReadonlyArray<number>,
  onAddTeam: (params: {name: string}) => Promise<void>
  onRemoveTeam: (params: {id: number}) => Promise<void>
  onUpdateTeam: (params: {id: number, name: string}) => Promise<void>
  editTeamId: number
}

export interface ITeamProps {
  team: ITeam
  editTeamId: number  // TODO handle edits via react-router params
  onRemoveTeam: (params: {id: number}) => Promise<void>
  onUpdateTeam: (params: {id: number, name: string}) => Promise<void>
}

export interface IAddTeamProps {
  onAddTeam: (params: {name: string}) => Promise<void>
  onUpdateTeam: (params: {id: number, name: string}) => Promise<void>
  team?: ITeam
}

export interface IAddTeamState {
  name: string
}

export class TeamAdd extends React.PureComponent<IAddTeamProps, IAddTeamState> {
  constructor(props: IAddTeamProps) {
    super(props)
    this.state = {
      name: '',
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
        {this.props.team ? 'Edit team' : 'Add team'}
        <input
          type='text'
          value={this.state.name}
          onChange={this.handleChange}
        />
        <input
          type='submit'
          value='Save'
        />
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
      <div className='team'>
        {team.id}
        {this.props.editTeamId !== team.id
          ? team.name
          : <TeamAdd
              onAddTeam={undefined as any}
              onUpdateTeam={this.props.onUpdateTeam}
              team={team}
            />
        }
        <button onClick={this.handleRemove}>Remove</button>
      </div>
    )
  }
}

export class TeamList extends React.PureComponent<ITeamListProps> {
  render() {
    const {editTeamId, teamIds, teamsById} = this.props

    return (
      <div className='team-list'>
        {teamIds.map(teamId => {
          const team = teamsById[teamId]
          return (
            <TeamRow
              key={team.id}
              editTeamId={editTeamId}
              onRemoveTeam={this.props.onRemoveTeam}
              onUpdateTeam={this.props.onUpdateTeam}
              team={team}
            />
          )
        })}
        <TeamAdd
          onAddTeam={this.props.onAddTeam}
          onUpdateTeam={undefined as any}
        />
      </div>
    )
  }
}
