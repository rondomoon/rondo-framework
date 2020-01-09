import { UserProfile, NewUser } from './user'
import { Credentials } from './auth'

export interface APIDef {
  '/auth/captcha.svg': {
    'get': {}
  }
  '/auth/captcha.wav': {
    'get': {}
  }
  '/auth/register': {
    'post': {
      body: NewUser & { captcha: string }
      response: UserProfile
      params: {}
    }
  }
  '/auth/login': {
    'post': {
      body: Credentials
      response: UserProfile
      params: {}
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
      params: {}
    }
  }
}
