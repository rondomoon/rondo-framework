import {ICredentials} from './ICredentials'
import {IUser} from './IUser'
import * as e from './entities'
import {keys} from 'ts-transformer-keys'

export interface IChangePasswordParams {
  oldPassword: string
  newPassword: string
}

export interface ICreateUserParams extends ICredentials {
  firstName: string
  lastName: string
}

export interface IUserService {
  getProfile(): Promise<IUser>
  findUserByEmail(email: string): Promise<IUser | undefined>
}

export const UserServiceMethods = keys<IUserService>()
