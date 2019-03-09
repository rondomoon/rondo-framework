import {Team} from '../entities/Team'
import {UserTeam} from '../entities/UserTeam'
import {IUserTeamParams} from './IUserTeamParams'

export interface ITeamService {
  create(params: {name: string, userId: number}): Promise<Team>

  remove(params: {id: number, userId: number}): Promise<void>

  update(params: {id: number, name: string, userId: number}): Promise<Team>

  addUser(params: IUserTeamParams): Promise<UserTeam>

  removeUser(params: IUserTeamParams): Promise<void>

  findOne(id: number): Promise<Team | undefined>

  find(userId: number): Promise<UserTeam[]>

  // TODO add other methods
}
