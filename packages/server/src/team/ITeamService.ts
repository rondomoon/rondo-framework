import {Team} from '../entities/Team'

export interface ITeamService {
  create(name: string, userId: number): Promise<Team>

  findOne(id: number, userId: number): Promise<Team | undefined>

  find(userId: number): Promise<Team[]>

  // TODO add other methods
}
