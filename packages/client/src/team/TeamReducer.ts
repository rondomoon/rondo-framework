import {
  ITeam, IUserInTeam, ReadonlyRecord, indexBy, without,
} from '@rondo/common'
import {TeamActionType} from './TeamActions'
import {GetResolvedAction} from '../actions'

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
  action: GetResolvedAction<TeamActionType, 'TEAM_USER_REMOVE'>,
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
  switch (action.status) {
    case 'pending':
      return state
    case 'rejected':
      return {
        ...state,
        error: action.payload.message,
      }
    case 'resolved':
      switch (action.type) {
        case 'TEAMS':
          return {
            ...state,
            teamIds: action.payload.map(team => team.id),
            teamsById: indexBy(action.payload, 'id'),
          }
        case 'TEAM_CREATE':
        case 'TEAM_UPDATE':
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
        case 'TEAM_USER_ADD':
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
        case 'TEAM_USER_REMOVE':
          return removeUser(state, action)
        case 'TEAM_USERS':
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
        case 'TEAM_REMOVE':
          return {
            ...state,
            teamIds: state.teamIds.filter(id => id !== action.payload.id),
            teamsById: without(state.teamsById, action.payload.id),
          }
        default:
          return state
      }
    default:
      return state
  }
}
