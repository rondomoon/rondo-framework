import {ICredentials} from './ICredentials'
import {INewUser} from './INewUser'
import {ITeam} from './ITeam'
import {IUser} from './IUser'
import {IUserInTeam} from './IUserInTeam'

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
  '/users/profile': {
    'get': {
      response: {
        id: number
      }
    }
  }
  '/users/emails/:email': {
    // TODO exposing search by email might be a security concern
    'get': {
      params: {
        email: string
      }
      response: IUser | undefined
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
      response: {id: number}
    }
  }

  '/teams/:teamId/users': {
    get: {
      params: {
        teamId: number
      }
      response: IUserInTeam[] // TODO
    }
  }

  '/teams/:teamId/users/:userId': {
    post: {
      params: {
        teamId: number
        userId: number
      }
      // body: {
      //   roleId: number
      // }
      response: IUserInTeam
    }
    delete: {
      params: {
        teamId: number
        userId: number
      }
      // body: {
      //   roleId: number
      // }
      response: {
        teamId: number
        userId: number
        // roleId: number
      }
    }
  }

  '/my/teams': {
    get: {
      response: ITeam[]
    }
  }

}
