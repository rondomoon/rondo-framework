export * from './LoggerFactory'
export * from './SQLLogger'
import {loggerFactory} from './LoggerFactory'

export const getLogger = loggerFactory.getLogger
export const apiLogger = getLogger('api')
