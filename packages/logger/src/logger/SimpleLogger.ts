import { Formatter } from '../formatters'
import { Message } from '../Message'
import { LogLevel } from '../LogLevel'
import { Transport } from '../transports'
import { Logger } from './Logger'

interface LoggerParams {
  name: string
  readonly formatters: readonly Formatter[]
  readonly transports: readonly Transport[]
}

export class SimpleLogger implements Logger {
  constructor(protected readonly config: LoggerParams) {}

  protected log(level: LogLevel, message: string, params: unknown[]) {
    const initialMessage: Message = {
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

  error(message: string, ...args: unknown[]) {
    this.log(LogLevel.ERROR, message, args)
  }
  warn(message: string, ...args: unknown[]) {
    this.log(LogLevel.WARN, message, args)
  }
  info(message: string, ...args: unknown[]) {
    this.log(LogLevel.INFO, message, args)
  }
  debug(message: string, ...args: unknown[]) {
    this.log(LogLevel.DEBUG, message, args)
  }
  verbose(message: string, ...args: unknown[]) {
    this.log(LogLevel.VERBOSE, message, args)
  }
}
