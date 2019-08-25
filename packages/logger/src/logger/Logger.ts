import { IFormatter } from '../formatters'
import { IMessage } from '../IMessage'
import { LogLevel } from '../LogLevel'
import { ITransport } from '../transports'
import { ILogger } from './ILogger'

interface ILoggerParams {
  name: string
  readonly formatters: readonly IFormatter[],
  readonly transports: readonly ITransport[],
}

export class Logger implements ILogger {
  constructor(protected readonly config: ILoggerParams) {}

  protected log(level: LogLevel, message: string, params: any[]) {
    const initialMessage: IMessage = {
      loggerName: this.config.name,
      timestamp: new Date(),
      message,
      params,
      level,
    }
    const formattedMessage = this.config.formatters.reduce((m, f) => {
      return f.format(m)
    }, initialMessage)

    this.config.transports.forEach(t => {
      if (formattedMessage.level <= t.level) {
        t.write(formattedMessage)
      }
    })
  }

  error(message: string, ...args: any[]) {
    this.log(LogLevel.ERROR, message, args)
  }
  warn(message: string, ...args: any[]) {
    this.log(LogLevel.WARN, message, args)

  }
  info(message: string, ...args: any[]) {
    this.log(LogLevel.INFO, message, args)
  }
  debug(message: string, ...args: any[]) {
    this.log(LogLevel.DEBUG, message, args)
  }
  verbose(message: string, ...args: any[]) {
    this.log(LogLevel.VERBOSE, message, args)
  }
}
