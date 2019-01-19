import {ICredentials} from './ICredentials'
import {IUser} from './IUser'

export interface IAPIDef {
  '/auth/register': {
    'post': {
      body: ICredentials
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
  },
  '/users/password': {
    'post': {
      body: {
        oldPassword: string
        newPassword: string
      }
    }
  }
  '/users/profile': {
    'get': {
      response: {
        id: number
      }
    }
  }
}
