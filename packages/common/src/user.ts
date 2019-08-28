import {ICredentials} from './ICredentials'
import {IUser} from './IUser'
import * as e from './entities'

export interface IChangePasswordParams {
  oldPassword: string
  newPassword: string
}

export interface ICreateUserParams extends ICredentials {
  firstName: string
  lastName: string
}

export interface IUserService {
  changePassword(params: IChangePasswordParams): Promise<void>
  // validateCredentials(credentials: ICredentials): Promise<e.User | undefined>
  findOne(id: number): Promise<IUser | undefined>
  findUserByEmail(email: string): Promise<IUser | undefined>
}
