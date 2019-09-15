import { Transport } from './Transport'
import { Message } from '../Message'
import { LogLevel } from '../LogLevel'

export class ConsoleTransport implements Transport {
  constructor(readonly level: LogLevel) {}

  write(entry: Message) {
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
          break
        case LogLevel.OFF:
          // do nothing
      }
    }
  }
}
