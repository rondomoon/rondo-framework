declare namespace Application {
  export interface User {
    id: number
    username: string
    firstName: string
    lastName: string
  }
}

declare namespace Express {
  export interface Request {
    correlationId: string
    user?: Application.User
    logInPromise(user: any): Promise<void>
  }
}
