import {BaseService} from '../services/BaseService'
import {ISiteService} from './ISiteService'
import {Site} from '../entities/Site'

export class SiteService extends BaseService implements ISiteService {
  async create(name: string, teamId: number, userId: number) {
    // TODO check site limit per user
    return this.getRepository(Site).save({
      name,
      teamId,
      userId,
    })
  }

  async findOne(id: number, teamId: number) {
    return this.getRepository(Site).findOne({
      where: {
        id,
        teamId,
      },
    })
  }

  async findByDomain(domain: string) {
    return this.getRepository(Site).findOne({
      where: {
        domain,
      },
    })
  }

  async findByUser(userId: number) {
    return this.getRepository(Site).find({
      where: { userId },
    })
  }

  async findByTeam(teamId: number) {
    return this.getRepository(Site).find({
      where: { teamId },
    })
  }
}
