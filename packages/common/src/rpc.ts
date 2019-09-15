import {TeamService} from './team'
import {UserService} from './user'

export interface RPCServices {
  userService: UserService
  teamService: TeamService
}
