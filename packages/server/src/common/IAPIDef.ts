export interface IAPIDef {
  '/auth/register': {
    'post': {
      body: {
        username: string
        password: string
      }
    }
  }
  '/auth/login': {
    'post': {
      body: {
        username: string
        password: string
      }
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
