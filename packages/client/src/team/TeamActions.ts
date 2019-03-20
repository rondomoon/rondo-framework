import {IAPIDef} from '@rondo/common'
import {IAction, IErrorAction, ActionTypes} from '../actions'
import {IHTTPClient} from '../http/IHTTPClient'
import {ITeam, IUser, IUserInTeam} from '@rondo/common'

export enum TeamActionKeys {
  TEAMS = 'TEAMS',
  TEAMS_PENDING = 'TEAMS_PENDING',
  TEAMS_REJECTED = 'TEAMS_REJECTED',

  TEAM_CREATE = 'TEAM_CREATE',
  TEAM_CREATE_PENDING = 'TEAM_CREATE_PENDING',
  TEAM_CREATE_REJECTED = 'TEAM_CREATE_REJECTED',

  TEAM_UPDATE = 'TEAM_UPDATE',
  TEAM_UPDATE_PENDING = 'TEAM_UPDATE_PENDING',
  TEAM_UPDATE_REJECTED = 'TEAM_UPDATE_REJECTED',

  TEAM_REMOVE = 'TEAM_REMOVE',
  TEAM_REMOVE_PENDING = 'TEAM_REMOVE_PENDING',
  TEAM_REMOVE_REJECTED = 'TEAM_REMOVE_REJECTED',

  TEAM_USER_ADD = 'TEAM_USER_ADD',
  TEAM_USER_ADD_PENDING = 'TEAM_USER_ADD_PENDING',
  TEAM_USER_ADD_REJECTED = 'TEAM_USER_ADD_REJECTED',

  TEAM_USER_REMOVE = 'TEAM_USER_REMOVE',
  TEAM_USER_REMOVE_PENDING = 'TEAM_USER_REMOVE_PENDING',
  TEAM_USER_REMOVE_REJECTED = 'TEAM_USER_REMOVE_REJECTED',

  TEAM_USERS = 'TEAM_USERS',
  TEAM_USERS_PENDING = 'TEAM_USERS_PENDING',
  TEAM_USERS_REJECTED = 'TEAM_USERS_REJECTED',

  TEAM_USER_FIND = 'TEAM_USER_FIND',
  TEAM_USER_FIND_PENDING = 'TEAM_USER_FIND_PENDING',
  TEAM_USER_FIND_REJECTED = 'TEAM_USER_FIND_REJECTED',
}

export class TeamActions {
  constructor(protected readonly http: IHTTPClient<IAPIDef>) {}

  fetchMyTeams = (): IAction<ITeam[], TeamActionKeys.TEAMS> => {
    return {
      payload: this.http.get('/my/teams'),
      type: TeamActionKeys.TEAMS,
    }
  }

  fetchMyTeamsError = (error: Error)
  : IErrorAction<TeamActionKeys.TEAMS_REJECTED> => {
    return {
      error,
      type: TeamActionKeys.TEAMS_REJECTED,
    }
  }

  createTeam = (team: {name: string})
  : IAction<ITeam, TeamActionKeys.TEAM_CREATE> => {
    return {
      payload: this.http.post('/teams', team),
      type: TeamActionKeys.TEAM_CREATE,
    }
  }

  createTeamError = (error: Error)
  : IErrorAction<TeamActionKeys.TEAM_CREATE_REJECTED> => {
    return {
      error,
      type: TeamActionKeys.TEAM_CREATE_REJECTED,
    }
  }

  updateTeam = ({id, name}: {id: number, name: string})
  : IAction<ITeam, TeamActionKeys.TEAM_UPDATE> => {
    return {
      payload: this.http.put('/teams/:id', {name}, {id}),
      type: TeamActionKeys.TEAM_UPDATE,
    }
  }

  updateTeamError = (error: Error)
  : IErrorAction<TeamActionKeys.TEAM_UPDATE_REJECTED> => {
    return {
      error,
      type: TeamActionKeys.TEAM_UPDATE_REJECTED,
    }
  }

  removeTeam = ({id}: {id: number})
  : IAction<{}, TeamActionKeys.TEAM_REMOVE> => {
    return {
      payload: this.http.delete('/teams/:id', {}, {id}),
      type: TeamActionKeys.TEAM_REMOVE,
    }
  }

  removeTeamError = (error: Error)
  : IErrorAction<TeamActionKeys.TEAM_REMOVE_REJECTED> => {
    return {
      error,
      type: TeamActionKeys.TEAM_REMOVE_REJECTED,
    }
  }

  addUser(
    {userId, teamId, roleId = 1}: {
      userId: number,
      teamId: number,
      roleId: number,
    })
  : IAction<IUserInTeam, TeamActionKeys.TEAM_USER_ADD> {
    return {
      payload: this.http.post('/teams/:teamId/users/:userId', {}, {
        userId,
        teamId,
      }),
      type: TeamActionKeys.TEAM_USER_ADD,
    }
  }

  addUserError = (error: Error)
  : IErrorAction<TeamActionKeys.TEAM_USER_ADD_REJECTED> => {
    return {
      error,
      type: TeamActionKeys.TEAM_USER_ADD_REJECTED,
    }
  }

  removeUser = (
    {userId, teamId}: {
      userId: number,
      teamId: number,
    })
  : IAction<{
    userId: number,
    teamId: number,
  }, TeamActionKeys.TEAM_USER_REMOVE> => {
    return {
      payload: this.http.delete('/teams/:teamId/users/:userId', {}, {
        userId,
        teamId,
      }),
      type: TeamActionKeys.TEAM_USER_REMOVE,
    }
  }

  removeUserError = (error: Error)
  : IErrorAction<TeamActionKeys.TEAM_USER_REMOVE_REJECTED> => {
    return {
      error,
      type: TeamActionKeys.TEAM_USER_REMOVE_REJECTED,
    }
  }

  fetchUsersInTeam = ({teamId}: {teamId: number})
  : IAction<{
    teamId: number,
    usersInTeam: IUserInTeam[]
  }, TeamActionKeys.TEAM_USERS> => {
    return {
      payload: this.http.get('/teams/:teamId/users', {
        teamId,
      })
      .then(usersInTeam => ({teamId, usersInTeam})),
      type: TeamActionKeys.TEAM_USERS,
    }
  }

  fetchUsersInTeamError = (error: Error)
  : IErrorAction<TeamActionKeys.TEAM_USERS_REJECTED> => {
    return {
      error,
      type: TeamActionKeys.TEAM_USERS_REJECTED,
    }
  }

  findUserByEmail = (email: string)
  : IAction<IUser | undefined, TeamActionKeys.TEAM_USER_FIND> => {
    return {
      payload: this.http.get('/users/emails/:email', {
        email,
      }),
      type: TeamActionKeys.TEAM_USER_FIND,
    }
  }

  findUserByEmailError = (error: Error)
  : IErrorAction<TeamActionKeys.TEAM_USER_FIND_REJECTED> => {
    return {
      error,
      type: TeamActionKeys.TEAM_USER_FIND_REJECTED,
    }
  }
}

export type TeamActionType = ActionTypes<TeamActions>
