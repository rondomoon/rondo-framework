import {ICommentTree} from './ICommentTree'
import {IComment} from './IComment'
import {ICredentials} from './ICredentials'
import {ISite} from './ISite'
import {IStory} from './IStory'
import {ITeam} from './ITeam'
import {IUser} from './IUser'
import {IUserTeam} from './IUserTeam'

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
  }

  '/my/teams': {
    get: {
      response: IUserTeam[]
    }
  }

  // SITE

  '/sites/:domain': {
    'get': {
      params: {domain: string}
    }
  }

  '/teams/:teamId/sites/:id': {
    get: {
      params: {
        teamId: number
        id: number
      }
      response: ISite | undefined
    }
  }

  '/teams/:teamId/sites': {
    get: {
      params: {
        teamId: number
      }
      response: ISite[]
    }
    post: {
      params: {
        teamId: number
      }
      body: {
        name: string
        domain: string
      }
      response: ISite
    }
  }

  '/my/sites': {
    get: {
      response: ISite[]
    }
  }

  // STORY

  '/stories/by-url': {
    'get': {
      response: IStory | undefined
      query: {
        url: string
      }
    }
  }
  '/stories/:storyId/comments': {
    'get': {
      response: ICommentTree,
      params: {
        storyId: number
      }
    }
    'post': {
      response: IComment,
      body: IComment,
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
