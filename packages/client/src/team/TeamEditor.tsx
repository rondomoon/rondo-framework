import { Button, Heading, Help, Input } from '../components'
import React from 'react'
import { FaCheck, FaEdit, FaPlusSquare } from 'react-icons/fa'
import { TeamActions, Team } from '@rondo.dev/common'

interface AddTeamProps {
  type: 'add'
  onAddTeam: TeamActions['create']
}

interface UpdateTeamProps {
  type: 'update'
  onUpdateTeam: TeamActions['update']
  team: Team
}

export type TeamEditorProps = AddTeamProps | UpdateTeamProps

export interface TeamEditorState {
  // TODO use redux state for errors!
  error: string
  name: string
}

export class TeamEditor
extends React.PureComponent<TeamEditorProps, TeamEditorState> {
  constructor(props: TeamEditorProps) {
    super(props)
    this.state = {
      error: '',
      name: props.type === 'update' ? this.getName(props.team) : '',
    }
  }
  getName(team?: Team) {
    return team ? team.name : ''
  }
  handleChange = (name: string, value: string) => {
    this.setState({name: value})
  }
  handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const {name} = this.state
    try {
      if (this.props.type === 'update') {
        const {team} = this.props
        await this.props.onUpdateTeam({id: team.id, name}).payload
      } else {
        await this.props.onAddTeam({name}).payload
      }
    } catch (err) {
      this.setState({error: err.message})
      return
    }
  }
  render() {
    return (
      <form
        autoComplete='off'
        className='team-add'
        onSubmit={this.handleSubmit}>
        <Heading>
          {this.props.type === 'update' ? 'Edit team' : 'Add team'}
        </Heading>
        <Input
          error={this.state.error}
          name='name'
          label='Team Name'
          placeholder='Team Name'
          type='text'
          value={this.state.name}
          onChange={this.handleChange}
          Icon={this.props.type === 'update' ? FaEdit : FaPlusSquare}
        />
        <div className='text-right'>
          <Button type='submit'>
            <FaCheck /> Save
          </Button>
        </div>
      </form>
    )
  }
}
