import { LogLevel } from './LogLevel'

export interface IMessage {
  loggerName: string
  level: LogLevel
  timestamp: Date
  message: string
  params: any[]
}
