import {IDatabase} from '../database/IDatabase'
import {Validator} from '../validator'
import {Team} from '../entities/Team'
import {UserTeam} from '../entities/UserTeam'
import {IUserPermissions} from '../user/IUserPermissions'
import {
  trim,
  IContext,
  entities as e,
  team as t,
  IUserInTeam,
} from '@rondo.dev/common'
import {Contextual} from '@rondo.dev/jsonrpc'

// TODO ensureLoggedIn
export class TeamService2 implements Contextual<t.ITeamService, IContext> {
  constructor(
    protected readonly db: IDatabase,
    protected readonly permissions: IUserPermissions,
  ) {}

  async create(params: t.ITeamCreateParams, context: IContext) {
    const userId = context.user!.id
    const name = trim(params.name)

    new Validator({name, userId})
    .ensure('name')
    .ensure('userId')
    .throw()

    const team = await this.db.getRepository(Team).save({
      name,
      userId,
    })

    await this.addUser({
      teamId: team.id,
      userId,
      // ADMIN role
      roleId: 1,
    }, context)

    return team
  }

  async remove({id}: t.ITeamRemoveParams, context: IContext) {
    const userId = context.user!.id

    await this.permissions.belongsToTeam({
      teamId: id,
      userId,
    })

    await this.db.getRepository(UserTeam)
    .delete({teamId: id, userId})

    await this.db.getRepository(Team)
    .delete(id)

    return {id}
  }

  async update({id, name}: t.ITeamUpdateParams, context: IContext) {
    const userId = context.user!.id

    await this.permissions.belongsToTeam({
      teamId: id,
      userId,
    })

    await this.db.getRepository(Team)
    .update({
      id,
    }, {
      name,
    })

    return (await this.findOne(id))!
  }

  async addUser(params: t.ITeamAddUserParams, context: IContext) {
    const {userId, teamId, roleId} = params
    await this.db.getRepository(UserTeam)
    .save({userId, teamId, roleId})

    const userTeam = await this.createFindUserInTeamQuery()
    .where({
      userId,
      teamId,
      roleId,
    })
    .getOne()

    return this.mapUserInTeam(userTeam!)
  }

  async removeUser(params: t.ITeamAddUserParams, context: IContext) {
    const {teamId, userId, roleId} = params

    await this.permissions.belongsToTeam({
      teamId: params.teamId,
      userId: context.user!.id,
    })

    // TODO check if this is the last admin team member
    await this.db.getRepository(UserTeam)
    .delete({userId, teamId, roleId})

    return {teamId, userId, roleId}
  }

  async findOne(id: number) {
    return this.db.getRepository(Team).findOne(id)
  }

  async find(context: IContext) {
    const userId = context.user!.id

    return this.db.getRepository(Team)
    .createQueryBuilder('team')
    .select('team')
    .innerJoin('team.userTeams', 'ut')
    .where('ut.userId = :userId', {userId})
    .getMany()
  }

  async findUsers(teamId: number, context: IContext) {
    const userId = context.user!.id

    await this.permissions.belongsToTeam({
      teamId,
      userId,
    })

    const userTeams = await this.createFindUserInTeamQuery()
    .where('ut.teamId = :teamId', {
      teamId,
    })
    .getMany()

    return userTeams.map(this.mapUserInTeam)
  }

  protected mapUserInTeam(ut: UserTeam): IUserInTeam {
    return {
      teamId: ut.teamId,
      userId: ut.userId,
      displayName: `${ut.user.firstName} ${ut.user.lastName}`,
      roleId: ut.role!.id,
      roleName: ut.role!.name,
    }
  }

  protected createFindUserInTeamQuery() {
    return this.db.getRepository(UserTeam)
    .createQueryBuilder('ut')
    .select('ut')
    .innerJoinAndSelect('ut.user', 'user')
    .innerJoinAndSelect('ut.role', 'role')
  }
}
