import { TReduxed } from '@rondo.dev/jsonrpc'
import { keys } from 'ts-transformer-keys'
import { ICredentials } from './ICredentials'
import { IUser } from './IUser'

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
  // TODO exposing search by email might be a security concern
  findUserByEmail(email: string): Promise<IUser | undefined>
}

export const UserServiceMethods = keys<IUserService>()
export type UserActions = TReduxed<IUserService, 'userService'>
