import {IAPIDef} from '@rondo/common'
import {GetAction, IAsyncAction} from '../actions'
import {IHTTPClient} from '../http/IHTTPClient'
import {ITeam, IUser, IUserInTeam} from '@rondo/common'

export type TeamActionType =
  IAsyncAction<ITeam[],
  'TEAMS_PENDING',
  'TEAMS_RESOLVED',
  'TEAMS_REJECTED'>
  | IAsyncAction<ITeam,
  'TEAM_CREATE_PENDING',
  'TEAM_CREATE_RESOLVED',
  'TEAM_CREATE_REJECTED'>
  | IAsyncAction<ITeam,
  'TEAM_UPDATE_PENDING',
  'TEAM_UPDATE_RESOLVED',
  'TEAM_UPDATE_REJECTED'>
  | IAsyncAction<{id: number},
  'TEAM_REMOVE_PENDING',
  'TEAM_REMOVE_RESOLVED',
  'TEAM_REMOVE_REJECTED'>
  | IAsyncAction<IUserInTeam,
  'TEAM_USER_ADD_PENDING',
  'TEAM_USER_ADD_RESOLVED',
  'TEAM_USER_ADD_REJECTED'>
  | IAsyncAction<{userId: number, teamId: number},
  'TEAM_USER_REMOVE_PENDING',
  'TEAM_USER_REMOVE_RESOLVED',
  'TEAM_USER_REMOVE_REJECTED'>
  | IAsyncAction<{teamId: number, usersInTeam: IUserInTeam[]},
  'TEAM_USERS_PENDING',
  'TEAM_USERS_RESOLVED',
  'TEAM_USERS_REJECTED'>
  | IAsyncAction<IUser | undefined,
  'TEAM_USER_FIND_PENDING',
  'TEAM_USER_FIND_RESOLVED',
  'TEAM_USER_FIND_REJECTED'>

type Action<T extends string> = GetAction<TeamActionType, T>

export class TeamActions {
  constructor(protected readonly http: IHTTPClient<IAPIDef>) {}

  fetchMyTeams = (): Action<'TEAMS_PENDING'> => {
    return {
      payload: this.http.get('/my/teams'),
      type: 'TEAMS_PENDING',
    }
  }

  createTeam = (team: {name: string}): Action<'TEAM_CREATE_PENDING'> => {
    return {
      payload: this.http.post('/teams', team),
      type: 'TEAM_CREATE_PENDING',
    }
  }

  updateTeam = ({id, name}: {id: number, name: string})
  : Action<'TEAM_UPDATE_PENDING'> => {
    return {
      payload: this.http.put('/teams/:id', {name}, {id}),
      type: 'TEAM_UPDATE_PENDING',
    }
  }

  removeTeam = ({id}: {id: number}): Action<'TEAM_REMOVE_PENDING'> => {
    return {
      payload: this.http.delete('/teams/:id', {}, {id}),
      type: 'TEAM_REMOVE_PENDING',
    }
  }

  addUser(
    {userId, teamId, roleId = 1}: {
      userId: number,
      teamId: number,
      roleId: number,
    })
  : Action<'TEAM_USER_ADD_PENDING'> {
    return {
      payload: this.http.post('/teams/:teamId/users/:userId', {}, {
        userId,
        teamId,
      }),
      type: 'TEAM_USER_ADD_PENDING',
    }
  }

  removeUser = (
    {userId, teamId}: {
      userId: number,
      teamId: number,
    })
  : Action<'TEAM_USER_REMOVE_PENDING'> => {
    return {
      payload: this.http.delete('/teams/:teamId/users/:userId', {}, {
        userId,
        teamId,
      }),
      type: 'TEAM_USER_REMOVE_PENDING',
    }
  }

  fetchUsersInTeam = ({teamId}: {teamId: number})
  : Action<'TEAM_USERS_PENDING'> => {
    return {
      payload: this.http.get('/teams/:teamId/users', {}, {
        teamId,
      })
      .then(usersInTeam => ({teamId, usersInTeam})),
      type: 'TEAM_USERS_PENDING',
    }
  }

  findUserByEmail = (email: string): Action<'TEAM_USER_FIND_PENDING'> => {
    return {
      payload: this.http.get('/users/emails/:email', {}, {
        email,
      }),
      type: 'TEAM_USER_FIND_PENDING',
    }
  }
}
