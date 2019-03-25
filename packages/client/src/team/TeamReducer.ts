import {
  ITeam, IUserInTeam, ReadonlyRecord, indexBy, without,
} from '@rondo/common'
import {TeamActionType} from './TeamActions'
import {GetAction} from '../actions'

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
  action: GetAction<TeamActionType, 'TEAM_USER_REMOVE_RESOLVED'>,
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
    case 'TEAMS_RESOLVED':
      return {
        ...state,
        teamIds: action.payload.map(team => team.id),
        teamsById: indexBy(action.payload, 'id'),
      }
    case 'TEAM_CREATE_RESOLVED':
    case 'TEAM_UPDATE_RESOLVED':
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
    case 'TEAM_USER_ADD_RESOLVED':
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
    case 'TEAM_USER_REMOVE_RESOLVED':
      return removeUser(state, action)
    case 'TEAM_USERS_RESOLVED':
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
    case 'TEAM_REMOVE_RESOLVED':
      return {
        ...state,
        teamIds: state.teamIds.filter(id => id !== action.payload.id),
        teamsById: without(state.teamsById, action.payload.id),
      }
    case 'TEAM_CREATE_REJECTED':
    case 'TEAM_UPDATE_REJECTED':
    case 'TEAM_USER_ADD_REJECTED':
    case 'TEAM_USER_REMOVE_REJECTED':
    case 'TEAM_USERS_REJECTED':
      return {
        ...state,
        error: action.error.message,
      }
    default:
      return state
  }
}
