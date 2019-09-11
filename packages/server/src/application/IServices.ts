import { IAuthService, IUserPermissions } from '../services'

export interface IServices {
  authService: IAuthService
  userPermissions: IUserPermissions
}
