declare namespace Application {
  export interface User {
    id: number
  }
}

declare namespace Express {
  export interface Request {
    user?: Application.User
    logInPromise(user: any): Promise<void>
  }
}
