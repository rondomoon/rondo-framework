import React from 'react'
import {IUser, IUserInTeam, ReadonlyRecord} from '@rondo/common'
import {TeamActions} from './TeamActions'
import {FaUser, FaSave, FaTimes} from 'react-icons/fa'

import {
  Button, Control, Heading, Input, Panel, PanelHeading, PanelBlock
} from 'bloomer'

const EMPTY_ARRAY: ReadonlyArray<string> = []

export interface ITeamUsersProps {
  // fetchMyTeams: () => void,
  fetchUsersInTeam: TeamActions['fetchUsersInTeam']
  findUserByEmail: TeamActions['findUserByEmail']

  onAddUser: TeamActions['addUser']
  onRemoveUser: TeamActions['removeUser']

  teamId: number
  userKeysByTeamId: ReadonlyRecord<number, ReadonlyArray<string>>
  usersByKey: ReadonlyRecord<string, IUserInTeam>
}

export interface ITeamUserProps {
  onRemoveUser: (params: {userId: number, teamId: number}) => void
  user: IUserInTeam
}

export interface IAddUserProps {
  onAddUser: TeamActions['addUser']
  onSearchUser: TeamActions['findUserByEmail']
  teamId: number
}

export interface IAddUserState {
  email: string
  user?: IUser
}

export class TeamUser extends React.PureComponent<ITeamUserProps> {
  handleRemoveUser = async () => {
    const {onRemoveUser, user} = this.props
    await onRemoveUser(user)
  }
  render() {
    const {user} = this.props
    // TODO style
    return (
      <React.Fragment>
        <div className='user'>
          {user.displayName}
        </div>
        <div className='ml-auto'>
          <Button
            aria-label='Remove'
            isColor='danger'
            className='team-user-remove'
            onClick={this.handleRemoveUser}
          >
            <FaTimes />
          </Button>
        </div>
      </React.Fragment>
    )
  }
}

export class AddUser extends React.PureComponent<IAddUserProps, IAddUserState> {
  constructor(props: IAddUserProps) {
    super(props)
    this.state = {
      email: '',
      user: undefined,
    }
  }
  handleChangeEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
    const email = event.target.value
    this.setState({email})
  }
  handleAddUser = async (event: React.FormEvent) => {
    event.preventDefault()
    const {teamId} = this.props
    const {email} = this.state
    const user = await this.props.onSearchUser(email).payload
    if (!user) {
      // TODO handle this better via 404 status code
      return
    }
    await this.props.onAddUser({
      teamId,
      userId: user.id,
      roleId: 1,
    })

    this.setState({email: '', user: undefined})

    // TODO handle failures
  }
  render() {
    return (
      <form onSubmit={this.handleAddUser}>
        <Heading>Add User</Heading>
        <Control hasIcons='left'>
          <Input
            onChange={this.handleChangeEmail}
            placeholder='Email'
            type='email'
            value={this.state.email}
          />
          <span className='icon is-left'>
            <FaUser />
          </span>
        </Control>
        <div className='mt-1 text-right'>
          <Button
            isColor='primary'
            type='submit'
          >
            <FaSave className='mr-1' />
            Add
          </Button>
        </div>
      </form>
    )
  }
}

export class TeamUserList extends React.PureComponent<ITeamUsersProps> {
  async componentDidMount() {
    await this.fetchUsersInTeam(this.props.teamId)
  } async componentWillReceiveProps(nextProps: ITeamUsersProps) {
    const {teamId} = nextProps
    if (teamId !== this.props.teamId) {
      this.fetchUsersInTeam(teamId)
    }
  }
  async fetchUsersInTeam(teamId: number) {
    if (teamId) {
      await this.props.fetchUsersInTeam({teamId})
    }
  }
  render() {
    const userKeysByTeamId = this.props.userKeysByTeamId[this.props.teamId]
      || EMPTY_ARRAY

    return (
      <Panel>
        <PanelHeading>Users in Team</PanelHeading>
          {userKeysByTeamId.map(key => {
            const user = this.props.usersByKey[key]
            return (
              <PanelBlock key={key}>
                <TeamUser
                  key={key}
                  user={user}
                  onRemoveUser={this.props.onRemoveUser}
                />
              </PanelBlock>
            )
          })}

        <PanelBlock isDisplay='block'>
          <AddUser
            onAddUser={this.props.onAddUser}
            onSearchUser={this.props.findUserByEmail}
            teamId={this.props.teamId}
          />
        </PanelBlock>
      </Panel>
    )
  }
}
