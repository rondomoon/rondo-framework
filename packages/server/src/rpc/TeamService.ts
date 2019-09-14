import { ITeamAddUserParams, ITeamCreateParams, ITeamRemoveParams, ITeamService, ITeamUpdateParams, trim } from '@rondo.dev/common'
import { IUserInTeam } from '@rondo.dev/common/lib/team/IUserInTeam'
import Validator from '@rondo.dev/validator'
import { IDatabase } from '../database/IDatabase'
import { Team } from '../entities/Team'
import { UserTeam } from '../entities/UserTeam'
import { IUserPermissions } from '../services/IUserPermissions'
import { ensureLoggedIn, IContext, RPC } from './RPC'

@ensureLoggedIn
export class TeamService implements RPC<ITeamService> {
  constructor(
    protected readonly db: IDatabase,
    protected readonly permissions: IUserPermissions,
  ) {}

  async create(context: IContext, params: ITeamCreateParams) {
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

    await this.addUser(context, {
      teamId: team.id,
      userId,
      // ADMIN role
      roleId: 1,
    })

    return (await this.findOne(context, team.id))!
  }

  async remove(context: IContext, {id}: ITeamRemoveParams) {
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

  async update(context: IContext, {id, name}: ITeamUpdateParams) {
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

    return (await this.findOne(context, id))!
  }

  async addUser(context: IContext, params: ITeamAddUserParams) {
    const {userId, teamId, roleId} = params
    await this.db.getRepository(UserTeam)
    .save({userId, teamId, roleId})

    const userTeam = await this._createFindUserInTeamQuery()
    .where({
      userId,
      teamId,
      roleId,
    })
    .getOne()

    return this._mapUserInTeam(userTeam!)
  }

  async removeUser(context: IContext, params: ITeamAddUserParams) {
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

  async findOne(context: IContext, id: number) {
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

  async findUsers(context: IContext, teamId: number) {
    const userId = context.user!.id

    await this.permissions.belongsToTeam({
      teamId,
      userId,
    })

    const userTeams = await this._createFindUserInTeamQuery()
    .where('ut.teamId = :teamId', {
      teamId,
    })
    .getMany()

    return {
      teamId,
      usersInTeam: userTeams.map(this._mapUserInTeam),
    }
  }

  protected _mapUserInTeam(ut: UserTeam): IUserInTeam {
    return {
      teamId: ut.teamId,
      userId: ut.userId,
      displayName: `${ut.user.firstName} ${ut.user.lastName}`,
      roleId: ut.role!.id,
      roleName: ut.role!.name,
    }
  }

  protected _createFindUserInTeamQuery() {
    return this.db.getRepository(UserTeam)
    .createQueryBuilder('ut')
    .select('ut')
    .innerJoinAndSelect('ut.user', 'user')
    .innerJoinAndSelect('ut.role', 'role')
  }
}
