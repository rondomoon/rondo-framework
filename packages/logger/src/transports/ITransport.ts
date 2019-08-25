import { IMessage } from '../IMessage'
import { LogLevel } from '../LogLevel'

export interface ITransport {
  readonly level: LogLevel
  write(message: IMessage): void
}
