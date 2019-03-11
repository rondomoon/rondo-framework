import {ICommentTree} from './ICommentTree'
import {IComment} from './IComment'
import {ICredentials} from './ICredentials'
import {INewComment} from './INewComment'
import {ISite} from './ISite'
import {IStory} from './IStory'
import {ITeam} from './ITeam'
import {IUserTeam} from './IUserTeam'
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
    put: {
      params: {
        teamId: number
        id: number
      }
      body: {
        name?: string
        domain?: string
      }
      response: ISite
    }
    delete: {
      params: {
        teamId: number
        id: number
      }
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
      body: INewComment,
      params: {
        storyId: number
      }
    }
  }
  '/stories/:storyId/comments/:parentId': {
    post: {
      response: IComment,
      params: {
        parentId: number
        storyId: number
      },
      body: INewComment,
    }
  }
  '/comments/:commentId': {
    get: {
      response: IComment
      params: {
        commentId: number
      }
    }
    put: {
      response: IComment,
      body: INewComment,
      params: {
        commentId: number
      }
    }
    delete: {
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
