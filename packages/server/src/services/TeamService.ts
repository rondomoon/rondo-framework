import {BaseService} from './BaseService'
import {ITeamService} from './ITeamService'
import {Team} from '../entities/Team'

export class TeamService extends BaseService implements ITeamService {
  // TODO check team limit per user
  async create(name: string, userId: number) {
    return this.getRepository(Team).save({
      name,
      userId,
    })
  }

  findOne(id: number) {
    return this.getRepository(Team).findOne(id)
  }

  find(userId: number) {
    // TODO find all teams via UserTeam instead of userId
    return this.getRepository(Team).find({
      where: { userId },
    })
  }

}
