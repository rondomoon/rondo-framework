import { Message } from '../Message'
import { LogLevel } from '../LogLevel'

export interface Transport {
  level: LogLevel
  write(message: Message): void
}
