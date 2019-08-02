import createError from 'http-errors'
import {DB} from '../database/DB'
import {UserTeam} from '../entities/UserTeam'
import {IUserPermissions} from './IUserPermissions'

export class UserPermissions implements IUserPermissions {
  constructor(protected readonly db: DB) {}

  async belongsToTeam(params: {userId: number, teamId: number}) {
    const {userId, teamId} = params
    const result = await this.db.getRepository(UserTeam)
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
