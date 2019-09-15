import {Logger} from './logger/Logger'

export interface LoggerFactory {
  getLogger(name: string): Logger
}
