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
    user?: Application.User
    logInPromise(user: any): Promise<void>
  }
}
