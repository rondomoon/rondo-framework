import { UserPermissions } from '@rondo.dev/common'
import createError from 'http-errors'
import { TypeORMDatabase } from '@rondo.dev/db-typeorm'
import { UserTeamEntity } from '../entities'

export class SQLUserPermissions implements UserPermissions {
  constructor(protected readonly db: TypeORMDatabase) {}

  async belongsToTeam(params: {userId: number, teamId: number}) {
    const {userId, teamId} = params
    const result = await this.db.getRepository(UserTeamEntity)
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
