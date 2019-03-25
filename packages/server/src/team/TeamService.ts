import {BaseService} from '../services/BaseService'
import {ITeamService} from './ITeamService'
import {IUserInTeam} from '@rondo/common'
import {IUserTeamParams} from './IUserTeamParams'
import {Team} from '../entities/Team'
import {UserTeam} from '../entities/UserTeam'
import {Validator, trim} from '../validator'

export class TeamService extends BaseService implements ITeamService {

  // TODO check team limit per user
  async create({name, userId}: {name: string, userId: number}) {
    name = trim(name)

    new Validator({name, userId})
    .ensure('name')
    .ensure('userId')
    .throw()

    const team = await this.getRepository(Team).save({
      name,
      userId,
    })

    await this.addUser({
      teamId: team.id,
      userId,
      // ADMIN role
      roleId: 1,
    })

    return team
  }

  async remove({id, userId}: {id: number, userId: number}) {
    await this.getRepository(UserTeam)
    .delete({userId})

    await this.getRepository(Team)
    .delete({id})

    return {id}
  }

  async update({id, name, userId}: {id: number, name: string, userId: number}) {
    await this.getRepository(Team)
    .update({
      id,
    }, {
      name,
    })

    return (await this.findOne(id))!
  }

  async addUser(params: IUserTeamParams) {
    const {userId, teamId, roleId} = params
    await this.getRepository(UserTeam)
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

  async removeUser({teamId, userId, roleId}: IUserTeamParams) {
    // TODO check if this is the last admin team member
    await this.getRepository(UserTeam)
    .delete({userId, teamId, roleId})
  }

  async findUsers(teamId: number) {
    const userTeams = await this.createFindUserInTeamQuery()
    .where('ut.teamId = :teamId', {
      teamId,
    })
    .getMany()

    return userTeams.map(this.mapUserInTeam)
  }

  async findOne(id: number) {
    return this.getRepository(Team).findOne(id)
  }

  async find(userId: number) {
    return this.getRepository(Team)
    .createQueryBuilder('team')
    .select('team')
    .innerJoin('team.userTeams', 'ut')
    .where('ut.userId = :userId', {userId})
    .getMany()
  }

  protected createFindUserInTeamQuery() {
    return this.getRepository(UserTeam)
    .createQueryBuilder('ut')
    .select('ut')
    .innerJoinAndSelect('ut.user', 'user')
    .innerJoinAndSelect('ut.role', 'role')
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

}
