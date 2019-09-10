// import {ITeam} from './ITeam'
import { TReduxed } from '@rondo.dev/jsonrpc'
import { keys } from 'ts-transformer-keys'
import { Team } from './entities'
import { IUserInTeam } from './IUserInTeam'

export { Team }

export interface ITeamAddUserParams {
  teamId: number
  userId: number
  roleId: number
}

export interface ITeamCreateParams {
  name: string
}

export interface ITeamRemoveParams {
  id: number
}

export interface ITeamUpdateParams {
  id: number
  name: string
}

export interface ITeamUsers {
  teamId: number
  usersInTeam: IUserInTeam[]
}

export interface IContext {
  userId: number
}

export interface ITeamService {
  create(params: ITeamCreateParams): Promise<Team>

  remove(params: ITeamRemoveParams): Promise<{id: number}>

  update(params: ITeamUpdateParams): Promise<Team>

  addUser(params: ITeamAddUserParams): Promise<IUserInTeam>

  removeUser(params: ITeamAddUserParams): Promise<ITeamAddUserParams>

  findOne(id: number): Promise<Team | undefined>

  find(): Promise<Team[]>

  findUsers(teamId: number): Promise<ITeamUsers>

  // TODO add other methods
}

export const TeamServiceMethods = keys<ITeamService>()
export type TeamActions = TReduxed<ITeamService, 'teamService'>
