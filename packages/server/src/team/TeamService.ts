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

  async addUser(params: IUserTeamParams) {
    const {userId, teamId, roleId} = params
    return this.getRepository(UserTeam)
    .save({userId, teamId, roleId})
  }

  async removeUser({teamId, userId, roleId}: IUserTeamParams) {
    await this.getRepository(UserTeam)
    .delete({userId, teamId, roleId})
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
