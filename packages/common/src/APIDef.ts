import { UserProfile, NewUser } from './user'
import { Credentials } from './auth'

export interface APIDef {
  '/auth/register': {
    'post': {
      body: NewUser
      response: UserProfile
    }
  }
  '/auth/login': {
    'post': {
      body: Credentials
      response: UserProfile
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