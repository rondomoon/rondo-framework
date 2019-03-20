import React from 'react'
import {IUser, IUserInTeam, ReadonlyRecord} from '@rondo/common'

const EMPTY_ARRAY: ReadonlyArray<string> = []

export interface ITeamUsersProps {
  // fetchMyTeams: () => void,
  fetchUsersInTeam: (teamId: number) => void
  findUserByEmail: (email: string) => Promise<IUser>

  onAddUser: (params: {userId: number, teamId: number}) => Promise<void>
  onRemoveUser: (params: {userId: number, teamId: number}) => Promise<void>

  teamId: number
  userKeysByTeamId: ReadonlyRecord<number, ReadonlyArray<string>>
  usersByKey: ReadonlyRecord<string, IUserInTeam>
}

export interface ITeamUserProps {
  onRemoveUser: (params: {userId: number, teamId: number}) => void
  user: IUserInTeam
}

export interface IAddUserProps {
  onAddUser: (params: {userId: number, teamId: number}) => Promise<void>
  onSearchUser: (email: string) => Promise<IUser>
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
      <div className='team-user'>
        {user.displayName}
        <button
          className='team-user-remove'
          onClick={this.handleRemoveUser}
        >
          Remove
        </button>
      </div>
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
    const user = await this.props.onSearchUser(email)
    if (!user) {
      // TODO handle this better via 404 status code
      return
    }
    await this.props.onAddUser({
      teamId,
      userId: user.id,
    })

    this.setState({email: '', user: undefined})

    // TODO handle failures
  }
  render() {
    return (
      <form onSubmit={this.handleAddUser}>
        <input
          onChange={this.handleChangeEmail}
          placeholder='Email'
          type='email'
          value={this.state.email}
        />
        <input type='submit' value='Add' />
      </form>
    )
  }
}

export class TeamUserList extends React.PureComponent<ITeamUsersProps> {
  async componentDidMount() {
    await this.fetchUsersInTeam(this.props.teamId)
  }
  async componentWillReceiveProps(nextProps: ITeamUsersProps) {
    const {teamId} = nextProps
    if (teamId !== this.props.teamId) {
      this.fetchUsersInTeam(teamId)
    }
  }
  async fetchUsersInTeam(teamId: number) {
    if (teamId) {
      await this.props.fetchUsersInTeam(teamId)
    }
  }
  render() {
    const userKeysByTeamId = this.props.userKeysByTeamId[this.props.teamId]
      || EMPTY_ARRAY

    return (
      <React.Fragment>
        <div className='team-user-list'>
          {userKeysByTeamId.map(key => {
            const user = this.props.usersByKey[key]
            return (
              <TeamUser
                key={key}
                user={user}
                onRemoveUser={this.props.onRemoveUser}
              />
            )
          })}
        </div>

        <AddUser
          onAddUser={this.props.onAddUser}
          onSearchUser={this.props.findUserByEmail}
          teamId={this.props.teamId}
        />
      </React.Fragment>
    )
  }
}
