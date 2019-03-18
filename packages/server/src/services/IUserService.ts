import {ICredentials, INewUser, IUser} from '@rondo/common'

export interface IUserService {
  createUser(credentials: INewUser): Promise<IUser>
  changePassword(params: {
    userId: number,
    oldPassword: string,
    newPassword: string,
  }): Promise<any>
  validateCredentials(credentials: ICredentials): Promise<IUser | undefined>
  findOne(id: number): Promise<IUser | undefined>
}
