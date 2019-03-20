import {Team} from '../entities/Team'
import {IUserTeamParams} from './IUserTeamParams'
import {IUserInTeam} from '@rondo/common'

export interface ITeamService {
  create(params: {name: string, userId: number}): Promise<Team>

  remove(params: {id: number, userId: number}): Promise<{id: number}>

  update(params: {id: number, name: string, userId: number}): Promise<Team>

  addUser(params: IUserTeamParams): Promise<IUserInTeam>

  removeUser(params: IUserTeamParams): Promise<void>

  findOne(id: number): Promise<Team | undefined>

  find(userId: number): Promise<Team[]>

  findUsers(teamId: number): Promise<IUserInTeam[]>

  // TODO add other methods
}
