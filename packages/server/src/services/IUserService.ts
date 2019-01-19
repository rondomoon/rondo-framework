import {ICredentials} from '@rondo/common'
import {IUser} from '@rondo/common'

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
