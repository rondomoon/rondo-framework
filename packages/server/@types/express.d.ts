declare namespace Express {
  export interface User {
    id: number
    username: string
    firstName: string
    lastName: string
  }

  export interface Request {
    correlationId: string
    logInPromise(user: any): Promise<void>
  }
}
