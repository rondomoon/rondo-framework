import {IContext} from './IContext'
import {ITeamService} from './team'
import {IUserService} from './user'

export interface IRPCServices {
  userService: IUserService
  teamService: ITeamService
}
