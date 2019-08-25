import {ILogger} from './logger/ILogger'

export interface ILoggerFactory {
  getLogger(name: string): ILogger
}
