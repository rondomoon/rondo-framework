import {IAuthService} from '../services'
import {ITeamService} from '../team'
import {IUserPermissions} from '../user'

export interface IServices {
  authService: IAuthService
  teamService: ITeamService
  userPermissions: IUserPermissions
}
