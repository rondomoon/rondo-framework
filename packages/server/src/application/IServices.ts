import {IUserService} from '../services'
import {ITeamService} from '../team'
import {IUserPermissions} from '../user'

export interface IServices {
  userService: IUserService
  teamService: ITeamService
  userPermissions: IUserPermissions
}
