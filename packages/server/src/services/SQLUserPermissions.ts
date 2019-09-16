import { UserPermissions } from '@rondo.dev/common'
import createError from 'http-errors'
import { Database } from '../database/Database'
import { UserTeam } from '../entities/UserTeam'

export class SQLUserPermissions implements UserPermissions {
  constructor(protected readonly db: Database) {}

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
