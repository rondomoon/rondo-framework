import {ILogger} from './ILogger'

export interface ILoggerFactory {
  getLogger(name: string): ILogger
}
