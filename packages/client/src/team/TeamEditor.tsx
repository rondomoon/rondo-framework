import { Button, Control, Heading, Help, Input } from 'bloomer'
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
  componentWillReceiveProps(nextProps: TeamEditorProps) {
    if (nextProps.type === 'update') {
      const {team} = nextProps
      if (team !== (this.props as UpdateTeamProps).team) {
        this.setState({
          name: this.getName(team),
        })
      }
    }
  }
  handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.value
    this.setState({name})
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
    const {error} = this.state

    return (
      <form
        autoComplete='off'
        className='team-add'
        onSubmit={this.handleSubmit}>
        <Heading>
          {this.props.type === 'update' ? 'Edit team' : 'Add team'}
        </Heading>
        <Control hasIcons='left'>
          <Input
            placeholder='Team Name'
            type='text'
            value={this.state.name}
            onChange={this.handleChange}
          />
          <span className='icon is-left'>
            {this.props.type === 'update' ? <FaEdit /> : <FaPlusSquare />}
          </span>
          {error && (
            <Help isColor='danger'>{error}</Help>
          )}
        </Control>
        <div className='text-right mt-1'>
          <Button
            isColor='dark'
            className='button'
            type='submit'
          >
            <FaCheck className='mr-1' /> Save
          </Button>
        </div>
      </form>
    )
  }
}
