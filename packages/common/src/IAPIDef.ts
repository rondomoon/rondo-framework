import {ICredentials} from './ICredentials'
import {INewUser} from './INewUser'
import {ITeam} from './ITeam'
import {IUserTeam} from './IUserTeam'
import {IUser} from './IUser'

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

  // TEAM

  '/teams': {
    post: {
      body: {
        name: string
      }
      response: ITeam
    }
  }

  '/teams/:id': {
    get: {
      params: {
        id: number
      }
      response: ITeam | undefined
    }
    put: {
      params: {
        id: number
      }
      body: {
        name: string
      }
      response: ITeam
    }
    delete: {
      params: {
        id: number
      }
    }
  }

  '/my/teams': {
    get: {
      response: IUserTeam[]
    }
  }

}
