import { ICredentials } from './ICredentials'
import { INewUser } from './INewUser'
import { IUser } from './IUser'

export interface IAPIDef {
  '/auth/register': {
    'post': {
      body: INewUser
      response: IUser
    }
  }
  '/auth/login': {
    'post': {
      body: ICredentials
      response: IUser
    }
  }
  '/auth/logout': {
    'get': {}
  }
  '/auth/password': {
    'post': {
      body: {
        oldPassword: string
        newPassword: string
      }
    }
  }
}
