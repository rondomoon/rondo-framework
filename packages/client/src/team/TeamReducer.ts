import { indexBy, Team as _Team, UserInTeam, ReadonlyRecord, without, TeamActions } from '@rondo.dev/common'
import { createReducer } from '@rondo.dev/jsonrpc'

export interface TeamState {
  readonly loading: number
  readonly error: string

  readonly teamIds: ReadonlyArray<number>
  readonly teamsById: ReadonlyRecord<number, _Team>

  readonly userKeysByTeamId: ReadonlyRecord<number, ReadonlyArray<string>>
  readonly usersByKey: ReadonlyRecord<string, UserInTeam>
}

const defaultState: TeamState = {
  loading: 0,
  error: '',

  teamIds: [],
  teamsById: {},

  userKeysByTeamId: {},
  usersByKey: {},
}

function getUserKey(userInTeam: {userId: number, teamId: number}) {
  return `${userInTeam.teamId}_${userInTeam.userId}`
}

export const Team = createReducer('teamService', defaultState)
.withMapping<TeamActions>({
  create(state, action) {
    return {
      teamIds: state.teamIds.indexOf(action.payload.id) >= 0
        ?  state.teamIds
        : [...state.teamIds, action.payload.id],
      teamsById: {
        ...state.teamsById,
        [action.payload.id]: action.payload,
      },
    }
  },
  update(state, action) {
    return {
      teamIds: state.teamIds.indexOf(action.payload.id) >= 0
        ?  state.teamIds
        : [...state.teamIds, action.payload.id],
      teamsById: {
        ...state.teamsById,
        [action.payload.id]: action.payload,
      },
    }
  },
  remove(state, action) {
    return {
      teamIds: state.teamIds.filter(id => id !== action.payload.id),
      teamsById: without(state.teamsById, action.payload.id),
    }
  },
  addUser(state, action) {
    return {
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
  },
  removeUser(state, action) {
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
      userKeysByTeamId,
      usersByKey,
    }
  },
  find(state, action) {
    return {
      teamIds: action.payload.map(team => team.id),
      teamsById: indexBy(action.payload, 'id'),
    }
  },
  findOne(state, action) {
    throw new Error('TeamReducer#findOne not implemented')
  },
  findUsers(state, action) {
    const usersByKey = action.payload.usersInTeam
    .reduce((obj, userInTeam) => {
      obj[getUserKey(userInTeam)] = userInTeam
      return obj
    }, {} as Record<string, UserInTeam>)

    return {
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
  },
})
