import { MessageFormatter } from './formatters'
import { getDefaultParams } from './getDefaultParams'
import { LoggerFactory } from './LoggerFactory'
import { SimpleLogger, Logger } from './logger'
import { isLogLevel, LogLevel } from './LogLevel'
import { ConsoleTransport } from './transports'

// logging can be configured via environment variables, for example:
// `LOG='*:info,api:debug,-sql' node ...` sets all logs to info, api to debug,
// and disable all sql logs.

export interface EnabledLoggers {
  readonly [key: string]: LogLevel
}

export interface LoggerOptions {
  readonly enabledLoggers: EnabledLoggers
}

export class SimpleLoggerFactory implements LoggerFactory {

  protected readonly defaultLogLevel: LogLevel
  protected readonly loggers: {[key: string]: Logger} = {}
  getCorrelationId: () => string = () => ''

  static init({
    logs = getDefaultParams(),
  } = {}) {
    const enabledLoggers = logs.split(',').reduce((logConfig, log) => {
      const [key, value] = log.split(':')
      const level = value && value.toUpperCase()
      logConfig[key] = isLogLevel(level) ? LogLevel[level] : LogLevel.INFO
      return logConfig
    }, {} as {[key: string]: LogLevel})

    return new this({enabledLoggers})
  }

  constructor(readonly options: LoggerOptions) {
    this.defaultLogLevel = options.enabledLoggers['*'] || LogLevel.OFF
  }

  getLoggerLevel(name: string): LogLevel {
    const {enabledLoggers} = this.options
    const disabled = !!enabledLoggers['-' + name]
    if (disabled) {
      return LogLevel.OFF
    }
    return enabledLoggers[name] || this.defaultLogLevel
  }

  getLogger = (name: string): Logger => {
    if (this.loggers[name]) {
      return this.loggers[name]
    }

    const level = this.getLoggerLevel(name)
    const logger = this.loggers[name] = new SimpleLogger({
      name,
      formatters: [new MessageFormatter()],
      transports: [new ConsoleTransport(level)],
    })

    return logger
  }
}
