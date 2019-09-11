import { TReduxed } from '@rondo.dev/jsonrpc'
import { keys } from 'ts-transformer-keys'
import { Team } from '../entities'
import { ITeamAddUserParams } from './ITeamAddUserParams'
import { ITeamCreateParams } from './ITeamCreateParams'
import { ITeamRemoveParams } from './ITeamRemoveParams'
import { ITeamUpdateParams } from './ITeamUpdateParams'
import { ITeamUsers } from './ITeamUsers'
import { IUserInTeam } from './IUserInTeam'

export interface ITeamService {
  create(params: ITeamCreateParams): Promise<Team>

  remove(params: ITeamRemoveParams): Promise<{id: number}>

  update(params: ITeamUpdateParams): Promise<Team>

  addUser(params: ITeamAddUserParams): Promise<IUserInTeam>

  removeUser(params: ITeamAddUserParams): Promise<ITeamAddUserParams>

  findOne(id: number): Promise<Team | undefined>

  find(): Promise<Team[]>

  findUsers(teamId: number): Promise<ITeamUsers>
}

export const TeamServiceMethods = keys<ITeamService>()
export type TeamActions = TReduxed<ITeamService, 'teamService'>
