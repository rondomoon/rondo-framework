import {IAPIDef} from '@rondo/common'
import {GetPendingAction, IAsyncAction, PendingAction} from '../actions'
import {IHTTPClient} from '../http/IHTTPClient'
import {ITeam, IUser, IUserInTeam} from '@rondo/common'

export type TeamActionType =
  IAsyncAction<ITeam[], 'TEAMS'>
  | IAsyncAction<ITeam, 'TEAM_CREATE'>
  | IAsyncAction<ITeam, 'TEAM_UPDATE'>
  | IAsyncAction<{id: number}, 'TEAM_REMOVE'>
  | IAsyncAction<IUserInTeam, 'TEAM_USER_ADD'>
  | IAsyncAction<{userId: number, teamId: number}, 'TEAM_USER_REMOVE'>
  | IAsyncAction<{teamId: number, usersInTeam: IUserInTeam[]}, 'TEAM_USERS'>
  | IAsyncAction<IUser | undefined, 'TEAM_USER_FIND'>

type Action<T extends string> = GetPendingAction<TeamActionType, T>

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
