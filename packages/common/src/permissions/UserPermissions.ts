import {BelongsToTeamParams} from './BelongsToTeamParams'

export interface UserPermissions {
  // TODO check for role too
  belongsToTeam(params: BelongsToTeamParams): Promise<void>
}
