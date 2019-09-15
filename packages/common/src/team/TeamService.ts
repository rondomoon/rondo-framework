import { RPCActions } from '@rondo.dev/jsonrpc'
import { keys } from 'ts-transformer-keys'
import { Team } from '../entities'
import { TeamAddUserParams } from './TeamAddUserParams'
import { TeamCreateParams } from './TeamCreateParams'
import { TeamRemoveParams } from './TeamRemoveParams'
import { TeamUpdateParams } from './TeamUpdateParams'
import { TeamUsers } from './TeamUsers'
import { UserInTeam } from './UserInTeam'

export interface TeamService {
  create(params: TeamCreateParams): Promise<Team>

  remove(params: TeamRemoveParams): Promise<{id: number}>

  update(params: TeamUpdateParams): Promise<Team>

  addUser(params: TeamAddUserParams): Promise<UserInTeam>

  removeUser(params: TeamAddUserParams): Promise<TeamAddUserParams>

  findOne(id: number): Promise<Team | undefined>

  find(): Promise<Team[]>

  findUsers(teamId: number): Promise<TeamUsers>
}

export const TeamServiceMethods = keys<TeamService>()
export type TeamActions = RPCActions<TeamService, 'teamService'>
