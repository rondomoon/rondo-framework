import {IAPIDef} from '@rondo.dev/common'
import {TGetPendingAction, TAsyncAction, PendingAction} from '@rondo.dev/redux'
import {IHTTPClient} from '@rondo.dev/http-client'
import {ITeam, IUser, IUserInTeam} from '@rondo.dev/common'

export type TTeamAction =
  TAsyncAction<ITeam[], 'TEAMS'>
  | TAsyncAction<ITeam, 'TEAM_CREATE'>
  | TAsyncAction<ITeam, 'TEAM_UPDATE'>
  | TAsyncAction<{id: number}, 'TEAM_REMOVE'>
  | TAsyncAction<IUserInTeam, 'TEAM_USER_ADD'>
  | TAsyncAction<{userId: number, teamId: number}, 'TEAM_USER_REMOVE'>
  | TAsyncAction<{teamId: number, usersInTeam: IUserInTeam[]}, 'TEAM_USERS'>
  | TAsyncAction<IUser | undefined, 'TEAM_USER_FIND'>

type Action<T extends string> = TGetPendingAction<TTeamAction, T>

export class TeamActions {
  constructor(protected readonly http: IHTTPClient<IAPIDef>) {}

  fetchMyTeams = (): Action<'TEAMS'> => {
    return new PendingAction(this.http.get('/my/teams'), 'TEAMS')
  }

  createTeam = (team: {name: string}): Action<'TEAM_CREATE'> => {
    return new PendingAction(this.http.post('/teams', team), 'TEAM_CREATE')
  }

  updateTeam = ({id, name}: {id: number, name: string})
  : Action<'TEAM_UPDATE'> => {
    return new PendingAction(
      this.http.put('/teams/:id', {name}, {id}),
      'TEAM_UPDATE',
    )
  }

  removeTeam = ({id}: {id: number}): Action<'TEAM_REMOVE'> => {
    return new PendingAction(
      this.http.delete('/teams/:id', {}, {id}),
      'TEAM_REMOVE',
    )
  }

  addUser(
    {userId, teamId, roleId = 1}: {
      userId: number,
      teamId: number,
      roleId: number,
    })
  : Action<'TEAM_USER_ADD'> {
    return new PendingAction(
      this.http.post('/teams/:teamId/users/:userId', {}, {
        userId,
        teamId,
      }),
      'TEAM_USER_ADD',
    )
  }

  removeUser = (
    {userId, teamId}: {
      userId: number,
      teamId: number,
    })
  : Action<'TEAM_USER_REMOVE'> => {
    return new PendingAction(
      this.http.delete('/teams/:teamId/users/:userId', {}, {
        userId,
        teamId,
      }),
      'TEAM_USER_REMOVE',
    )
  }

  fetchUsersInTeam = ({teamId}: {teamId: number})
  : Action<'TEAM_USERS'> => {
    return new PendingAction(
      this.http.get('/teams/:teamId/users', {}, {
        teamId,
      })
      .then(usersInTeam => ({teamId, usersInTeam})),
       'TEAM_USERS',
    )
  }

  findUserByEmail = (email: string): Action<'TEAM_USER_FIND'> => {
    return new PendingAction(
      this.http.get('/users/emails/:email', {}, {email}),
      'TEAM_USER_FIND',
    )
  }
}
