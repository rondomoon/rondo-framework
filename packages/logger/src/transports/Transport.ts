import { Message } from '../Message'
import { LogLevel } from '../LogLevel'

export interface Transport {
  readonly level: LogLevel
  write(message: Message): void
}
