export interface IUserPermissions {
  // TODO check for role too
  belongsToTeam(params: {userId: number, teamId: number}): Promise<void>
}
