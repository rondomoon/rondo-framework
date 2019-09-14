import { Server } from 'http'

export interface IAppServer {
  listen(callback?: () => void): Server
  listen(callback?: () => void): Server
  listen(portOrPath: number | string, callback?: () => void): Server
  listen(port: number, hostname: string, callback?: () => void): Server
}
