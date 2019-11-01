import { NewUser, UserProfile } from '../user'
import { ChangePasswordParams } from './ChangePasswordParams'
import { Credentials } from './Credentials'

export interface AuthService {
  createUser(credentials: NewUser): Promise<UserProfile>
  changePassword(params: ChangePasswordParams): Promise<void>
  validateCredentials(
    credentials: Credentials,
  ): Promise<UserProfile | undefined>
  findOne(id: number): Promise<UserProfile | undefined>
  findUserByEmail(email: string): Promise<UserProfile | undefined>
}
