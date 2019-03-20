import {ITeam, IUserInTeam, ReadonlyRecord, indexBy} from '@rondo/common'
import {TeamActionKeys, TeamActionType} from './TeamActions'

export interface ITeamState {
  readonly error: string

  readonly teamIds: ReadonlyArray<number>
  readonly teamsById: ReadonlyRecord<number, ITeam>

  readonly userKeysByTeamId: ReadonlyRecord<number, ReadonlyArray<string>>
  readonly usersByKey: ReadonlyRecord<string, IUserInTeam>
}

const defaultState: ITeamState = {
  error: '',

  teamIds: [],
  teamsById: {},

  userKeysByTeamId: {},
  usersByKey: {},
}

function removeUser(
  state: ITeamState,
  action: {
    payload: {userId: number, teamId: number},
    type: TeamActionKeys.TEAM_USER_REMOVE,
  },
) {

  const {payload} = action
  const {teamId} = payload
  const userKey = getUserKey(payload)

  const userKeysByTeamId = {
    ...state.userKeysByTeamId,
    [teamId]: state.userKeysByTeamId[teamId].filter(u => u !== userKey),
  }

  const usersByKey = {...state.usersByKey}
  delete usersByKey[getUserKey(payload)]

  return {
    ...state,
    userKeysByTeamId,
    usersByKey,
  }
}

function getUserKey(userInTeam: {userId: number, teamId: number}) {
  return `${userInTeam.teamId}_${userInTeam.userId}`
}

export function Team(state = defaultState, action: TeamActionType): ITeamState {
  switch (action.type) {
    case TeamActionKeys.TEAMS:
      return {
        ...state,
        teamIds: action.payload.map(team => team.id),
        teamsById: indexBy(action.payload, 'id'),
      }
    case TeamActionKeys.TEAM_CREATE:
    case TeamActionKeys.TEAM_UPDATE:
      return {
        ...state,
        teamIds: state.teamIds.indexOf(action.payload.id) >= 0
          ?  state.teamIds
          : [...state.teamIds, action.payload.id],
        teamsById: {
          ...state.teamsById,
          [action.payload.id]: action.payload,
        },
      }
      return state
    case TeamActionKeys.TEAM_USER_ADD:
      return {
        ...state,
        userKeysByTeamId: {
          ...state.userKeysByTeamId,
          [action.payload.teamId]: [
            ...state.userKeysByTeamId[action.payload.teamId],
            getUserKey(action.payload),
          ],
        },
        usersByKey: {
          ...state.usersByKey,
          [getUserKey(action.payload)]: action.payload,
        },
      }
    case TeamActionKeys.TEAM_USER_REMOVE:
      return removeUser(state, action)
    case TeamActionKeys.TEAM_USERS:
      const usersByKey = action.payload.usersInTeam
      .reduce((obj, userInTeam) => {
        obj[getUserKey(userInTeam)] = userInTeam
        return obj
      }, {} as Record<string, IUserInTeam>)

      return {
        ...state,
        userKeysByTeamId: {
          ...state.userKeysByTeamId,
          [action.payload.teamId]: action.payload.usersInTeam
          .map(ut => getUserKey(ut)),
        },
        usersByKey: {
          ...state.usersByKey,
          ...usersByKey,
        },
      }
    case TeamActionKeys.TEAM_CREATE_REJECTED:
    case TeamActionKeys.TEAM_UPDATE_REJECTED:
    case TeamActionKeys.TEAM_USER_ADD_REJECTED:
    case TeamActionKeys.TEAM_USER_REMOVE_REJECTED:
    case TeamActionKeys.TEAM_USERS_REJECTED:
      return {
        ...state,
        error: action.error.message,
      }
    default:
      return state
  }
  return state
}
