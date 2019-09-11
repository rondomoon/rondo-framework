import { IUserInTeam } from './IUserInTeam'

export interface ITeamUsers {
  teamId: number
  usersInTeam: IUserInTeam[]
}
