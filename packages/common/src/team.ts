import {ITeam} from './ITeam'
import {IUserInTeam} from './IUserInTeam'

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

export interface IContext {
  userId: number
}

export interface ITeamService {
  jerko(params: string): number

  create(params: ITeamCreateParams): Promise<ITeam>

  remove(params: ITeamRemoveParams): Promise<{id: number}>

  update(params: ITeamUpdateParams): Promise<ITeam>

  addUser(params: ITeamAddUserParams): Promise<IUserInTeam>

  removeUser(params: ITeamAddUserParams): Promise<ITeamAddUserParams>

  findOne(id: number): Promise<ITeam | undefined>

  find(): Promise<ITeam[]>

  findUsers(teamId: number): Promise<IUserInTeam[]>

  // TODO add other methods
}
