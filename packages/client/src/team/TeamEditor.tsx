import React from 'react'
import {Button, Control, Heading, Input} from 'bloomer'
import {ITeam} from '@rondo/common'
import {TeamActions} from './TeamActions'
import {FaPlusSquare, FaCheck, FaEdit} from 'react-icons/fa'

export type ITeamEditorProps = {
  type: 'add'
  onAddTeam: TeamActions['createTeam']
} | {
  type: 'update'
  onUpdateTeam: TeamActions['updateTeam']
  team: ITeam
}

export interface ITeamEditorState {
  name: string
}

export class TeamEditor
extends React.PureComponent<ITeamEditorProps, ITeamEditorState> {
  constructor(props: ITeamEditorProps) {
    super(props)
    this.state = {
      name: props.type === 'update' ? this.getName(props.team) : '',
    }
  }
  getName(team?: ITeam) {
    return team ? team.name : ''
  }
  componentWillReceiveProps(nextProps: ITeamEditorProps) {
    if (nextProps.type === 'update') {
      const {team} = nextProps
      if (team !== (this.props as any).team) {
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
    if (this.props.type === 'update') {
      const {team} = this.props
      await this.props.onUpdateTeam({id: team.id, name})
    } else {
      await this.props.onAddTeam({name})
    }
    this.setState({name: ''})
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
