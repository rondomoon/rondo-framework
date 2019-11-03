import { User, UserInTeam, ReadonlyRecord, TeamActions, UserActions, Team } from '@rondo.dev/common'
import { Button, Input, Panel, PanelBlock, PanelHeading, Heading } from '../components'
import React from 'react'
import { FaCheck, FaTimes, FaUser } from 'react-icons/fa'

const EMPTY_ARRAY: ReadonlyArray<string> = []

export interface TeamUsersProps {
  // fetchMyTeams: () => void,
  fetchUsersInTeam: TeamActions['findUsers']
  findUserByEmail: UserActions['findUserByEmail']

  onAddUser: TeamActions['addUser']
  onRemoveUser: TeamActions['removeUser']

  team: Team
  userKeysByTeamId: ReadonlyRecord<number, ReadonlyArray<string>>
  usersByKey: ReadonlyRecord<string, UserInTeam>
}

export interface TeamUserProps {
  onRemoveUser: (
    params: {userId: number, teamId: number, roleId: number}) => void
  user: UserInTeam
}

export interface AddUserProps {
  onAddUser: TeamActions['addUser']
  onSearchUser: UserActions['findUserByEmail']
  teamId: number
}

export interface AddUserState {
  error: string
  email: string
  user?: User
}

export class TeamUser extends React.PureComponent<TeamUserProps> {
  handleRemoveUser = async () => {
    const {onRemoveUser, user} = this.props
    await onRemoveUser({...user, roleId: 1})
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
            colorScheme='danger'
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

export class AddUser extends React.PureComponent<AddUserProps, AddUserState> {
  constructor(props: AddUserProps) {
    super(props)
    this.state = {
      error: '',
      email: '',
      user: undefined,
    }
  }
  handleChangeEmail = (name: string, email: string) => {
    this.setState({email})
  }
  handleAddUser = async (event: React.FormEvent) => {
    event.preventDefault()
    const {teamId} = this.props
    const {email} = this.state
    const user = await this.props.onSearchUser(email).payload
    if (!user) {
      // TODO handle this better via 404 status code
      this.setState({error: 'No user found'})
      return
    }
    await this.props.onAddUser({
      teamId,
      userId: user.id,
      roleId: 1,
    })

    this.setState({error: '', email: '', user: undefined})
  }
  render() {
    return (
      <form autoComplete='off' onSubmit={this.handleAddUser}>
        <Heading>Add User</Heading>
        <Input
          label='Search by email'
          error={this.state.error}
          name='email'
          onChange={this.handleChangeEmail}
          placeholder='Email'
          type='email'
          value={this.state.email}
          Icon={FaUser}
        />
        <div className='mt-1 text-right'>
          <Button type='submit'>
            <FaCheck /> Add
          </Button>
        </div>
      </form>
    )
  }
}

export class TeamUserList extends React.PureComponent<TeamUsersProps> {
  async componentDidMount() {
    await this.fetchUsersInTeam(this.props.team.id)
  }
  componentDidUpdate(prevProps: Readonly<TeamUsersProps>) {
    const {team} = this.props
    if (team.id !== prevProps.team.id) {
      this.fetchUsersInTeam(team.id)
    }
  }
  async fetchUsersInTeam(teamId: number) {
    if (teamId) {
      await this.props.fetchUsersInTeam(teamId)
    }
  }
  render() {
    const userKeysByTeamId = this.props.userKeysByTeamId[this.props.team.id]
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

        <PanelBlock>
          <AddUser
            onAddUser={this.props.onAddUser}
            onSearchUser={this.props.findUserByEmail}
            teamId={this.props.team.id}
          />
        </PanelBlock>
      </Panel>
    )
  }
}
