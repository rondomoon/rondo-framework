import {ICredentials} from './ICredentials'
import {IComment} from './IComment'
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
  '/story/:storyId/comments': {
    'get': {
      response: IComment[],
      params: {
        storyId: number  // TODO might have to change to string (url)
      }
    }
    'post': {
      response: IComment,
      params: {
        storyId: number
      }
    }
  }
  '/comments/:parentId': {
    'post': {
      response: IComment,
      params: {
        parentId: number
      },
      body: IComment,
    }
  }
  '/comments/:commentId': {
    'put': {
      response: IComment,
      body: IComment,
      params: {
        commentId: number
      }
    }
    'delete': {
      params: {
        commentId: number
      }
    }
  }
  '/comments/:commentId/vote': {
    'post': {
      params: {
        commentId: number
      }
    }
    'delete': {
      params: {
        commentId: number
      }
    }
  }
  '/comments/:commentId/spam': {
    'post': {
      params: {
        commentId: number
      }
    }
    'delete': {
      params: {
        commentId: number
      }
    }
  }
}
