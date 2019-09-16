import { TeamAddUserParams, TeamCreateParams, TeamRemoveParams, TeamService, TeamUpdateParams, trim, UserPermissions } from '@rondo.dev/common'
import { UserInTeam } from '@rondo.dev/common/lib/team/UserInTeam'
import Validator from '@rondo.dev/validator'
import { Database } from '../database/Database'
import { Team } from '../entities/Team'
import { UserTeam } from '../entities/UserTeam'
import { ensureLoggedIn, Context, RPC } from './RPC'

@ensureLoggedIn
export class SQLTeamService implements RPC<TeamService> {
  constructor(
    protected readonly db: Database,
    protected readonly permissions: UserPermissions,
  ) {}

  async create(context: Context, params: TeamCreateParams) {
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

  async remove(context: Context, {id}: TeamRemoveParams) {
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

  async update(context: Context, {id, name}: TeamUpdateParams) {
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

  async addUser(context: Context, params: TeamAddUserParams) {
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

  async removeUser(context: Context, params: TeamAddUserParams) {
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

  async findOne(context: Context, id: number) {
    return this.db.getRepository(Team).findOne(id)
  }

  async find(context: Context) {
    const userId = context.user!.id

    return this.db.getRepository(Team)
    .createQueryBuilder('team')
    .select('team')
    .innerJoin('team.userTeams', 'ut')
    .where('ut.userId = :userId', {userId})
    .getMany()
  }

  async findUsers(context: Context, teamId: number) {
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

  protected _mapUserInTeam(ut: UserTeam): UserInTeam {
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
