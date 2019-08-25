import { ITransport } from './ITransport'
import { IMessage } from '../IMessage'
import { LogLevel } from '../LogLevel'

export class ConsoleTransport implements ITransport {
  constructor(readonly level: LogLevel) {}

  write(entry: IMessage) {
    if (entry.level <= this.level) {
      switch (entry.level) {
        case LogLevel.ERROR:
          // tslint:disable-next-line
          console.error(entry.message)
          break
        case LogLevel.INFO:
          // tslint:disable-next-line
          console.log(entry.message)
          break
        case LogLevel.WARN:
          // tslint:disable-next-line
          console.warn(entry.message)
          break
        case LogLevel.VERBOSE:
        case LogLevel.DEBUG:
          // tslint:disable-next-line
          console.debug(entry.message)
        case LogLevel.OFF:
          // do nothing
      }
    }
  }
}
