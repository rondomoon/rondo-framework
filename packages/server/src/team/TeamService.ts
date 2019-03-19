import {BaseService} from '../services/BaseService'
import {ITeamService} from './ITeamService'
import {IUserTeamParams} from './IUserTeamParams'
import {Team} from '../entities/Team'
import {UserTeam} from '../entities/UserTeam'

export class TeamService extends BaseService implements ITeamService {

  // TODO check team limit per user
  async create({name, userId}: {name: string, userId: number}) {
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
    return this.getRepository(UserTeam)
    .save({userId, teamId, roleId})
  }

  async removeUser({teamId, userId, roleId}: IUserTeamParams) {
    // TODO check if this is the last admin team member
    await this.getRepository(UserTeam)
    .delete({userId, teamId, roleId})
  }

  async findUsers(teamId: number) {
    const userTeams = await this.getRepository(UserTeam)
    .createQueryBuilder('ut')
    .select('ut')
    .innerJoinAndSelect('ut.user', 'user')
    .innerJoinAndSelect('ut.role', 'role')
    .where('ut.teamId = :teamId', {
      teamId,
    })
    .getMany()

    return userTeams.map(ut => ({
      teamId,
      userId: ut.userId,
      displayName: `${ut.user.firstName} ${ut.user.lastName}`,
      roleId: ut.role!.id,
      roleName: ut.role!.name,
    }))
  }

  async findOne(id: number) {
    return this.getRepository(Team).findOne(id)
  }

  async find(userId: number) {
    // TODO find all teams via UserTeam instead of userId
    return this.getRepository(UserTeam).find({
      relations: ['team'],
      where: {userId},
    })
  }

}
