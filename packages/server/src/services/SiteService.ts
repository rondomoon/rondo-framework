import {BaseService} from './BaseService'
import {ISiteService} from './ISiteService'
import {Site} from '../entities/Site'

export class SiteService extends BaseService implements ISiteService {
  async create(name: string, teamId: number, userId: number) {
    return this.getRepository(Site).save({
      name,
      teamId,
      userId,
    })
  }

  findOne(id: number, teamId: number) {
    return this.getRepository(Site).findOne({
      where: {
        id,
        teamId,
      },
    })
  }

  async find(teamId: number) {
    return this.getRepository(Site).find({
      where: { teamId },
    })
  }
}
