import {ITeam} from './ITeam'

export interface IUserTeam {
  userId: number
  teamId: number
  roleId: number
  team?: ITeam
}
