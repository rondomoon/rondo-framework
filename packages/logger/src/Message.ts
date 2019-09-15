import { LogLevel } from './LogLevel'

export interface Message {
  loggerName: string
  level: LogLevel
  timestamp: Date
  message: string
  params: unknown[]
}
