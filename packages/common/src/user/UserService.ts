import { RPCActions } from '@rondo.dev/jsonrpc'
import { keys } from 'ts-transformer-keys'
import { UserProfile } from './UserProfile'

export interface UserService {
  getProfile(): Promise<UserProfile>
  // TODO exposing search by email might be a security concern
  findUserByEmail(email: string): Promise<UserProfile | undefined>
}

export const UserServiceMethods = keys<UserService>()
export type UserActions = RPCActions<UserService, 'userService'>
