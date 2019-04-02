import {ILogger} from './ILogger'
import {ILoggerFactory} from './ILoggerFactory'
import {createLogger, format, transports} from 'winston'

// logging can be configured via environment variables, for example:
// `LOG='*:info,api:debug,-sql' node ...` sets all logs to info, api to debug,
// and disable all sql logs.

export function pad(text: string, n: number, trim: boolean) {
  text = String(text)
  if (text.length >= n) {
    return trim ? text.substring(0, n) : text
  }
  while (text.length < n) {
    text += ' '
  }
  return text
}

export type TLogLevel = 'error' | 'warn' | 'info' | 'debug' | 'verbose' | 'off'

export interface IEnabledLoggers {
  readonly [key: string]: TLogLevel
}

export interface IParams {
  readonly json: boolean
  readonly color: boolean
  readonly logstash: boolean,
}

export interface ILoggerOptions {
  readonly enabledLoggers: IEnabledLoggers
  readonly levelPad: number
  readonly namePad: number
  readonly params: IParams
}

export class LoggerFactory implements ILoggerFactory {

  protected readonly defaultLogLevel: string
  protected readonly loggers: {[key: string]: ILogger} = {}
  getCorrelationId: () => string

  static createFromEnv({
    logs = process.env.LOG || '',
    opts = process.env.LOG_OPTS || '',
  } = {}) {
    const enabledLoggers = logs.split(',').reduce((logConfig, log) => {
      const [key, value] = log.split(':')
      logConfig[key] = (value || 'info') as TLogLevel
      return logConfig
    }, {} as {[key: string]: TLogLevel})

    const params = opts.split(',').reduce((o, key) => {
      o[key] = true
      return o
    }, {} as {[key: string]: boolean})

    return new this({
      enabledLoggers,
      levelPad: 5,
      namePad: 5,
      params: params as any as IParams,
    })
  }

  constructor(readonly options: ILoggerOptions) {
    this.defaultLogLevel = options.enabledLoggers['*'] || 'off'
    this.getCorrelationId = () => ''
  }

  getLoggerLevel(name: string): TLogLevel {
    const {enabledLoggers} = this.options
    const disabled = !!enabledLoggers['-' + name]
    if (disabled) {
      return 'off'
    }
    return enabledLoggers[name] || this.defaultLogLevel
  }

  getLogger = (name: string): ILogger => {
    if (this.loggers[name]) {
      return this.loggers[name]
    }
    const {levelPad, namePad, params} = this.options

    const addName = format((info, opts) => {
      info.name = name
      return info
    })

    const prettyFormat = format(info => {
      info.message = info.timestamp + ' ' +
        pad(info.level, levelPad, true) + ' ' +
        pad(name, namePad, true) + ' ' +
        this.getCorrelationId() + ' ' +
        info.message
      return info
    })

    const print = format.printf(info => {
      return info.message
    })

    const formatters = [
      addName(),
      format.timestamp(),
      format.splat(),
    ].filter(f => !!f)

    if (params.logstash) {
      formatters.push(format.logstash())
    } else if (params.json) {
      formatters.push(format.json())
    } else if (params.color) {
      formatters.push(prettyFormat())
      formatters.push(format.colorize({ all: true }))
      formatters.push(print)
    } else {
      formatters.push(prettyFormat())
      formatters.push(print)
    }

    const logger = this.loggers[name] = createLogger({
      format: format.combine.apply(format, formatters),
      transports: [
        new transports.Console({
          handleExceptions: false,
          level: this.getLoggerLevel(name),
        }),
      ],
    })
    return logger
  }
}

export const loggerFactory = LoggerFactory.createFromEnv()
