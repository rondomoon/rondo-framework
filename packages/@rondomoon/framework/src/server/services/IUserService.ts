import {ICredentials} from './ICredentials'
import {IUser} from './IUser'

export interface IUserService {
  createUser(credentials: ICredentials): Promise<IUser>
  changePassword(params: {
    userId: number,
    oldPassword: string,
    newPassword: string,
  }): Promise<any>
  validateCredentials(credentials: ICredentials): Promise<IUser | undefined>
  findOne(id: number): Promise<IUser | undefined>
}
