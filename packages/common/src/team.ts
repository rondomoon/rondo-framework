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

type Contextual<T> = (context: IContext) => Promise<T>

export interface ITeamService {
  create(params: ITeamCreateParams): Contextual<ITeam>

  remove(params: ITeamRemoveParams): Contextual<{id: number}>

  update(params: ITeamUpdateParams): Contextual<ITeam>

  addUser(params: ITeamAddUserParams): Contextual<IUserInTeam>

  removeUser(params: ITeamAddUserParams): Contextual<ITeamAddUserParams>

  findOne(id: number): Promise<ITeam | undefined>

  find(userId: number): Contextual<ITeam[]>

  findUsers(teamId: number): Contextual<IUserInTeam[]>

  // TODO add other methods
}
