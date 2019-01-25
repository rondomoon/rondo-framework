import createError from 'http-errors'
import {BaseService} from '../services/BaseService'
import {UserTeam} from '../entities/UserTeam'
import {IUserPermissions} from './IUserPermissions'

export class UserPermissions extends BaseService implements IUserPermissions {
  async belongsToTeam(params: {userId: number, teamId: number}) {
    const {userId, teamId} = params
    const result = await this.getRepository(UserTeam)
    .findOne({
      where: {userId, teamId},
    })

    this.assert(result)
  }

  protected assert(value: any) {
    if (!value) {
      throw createError(403, 'Forbidden')
    }
  }
}
