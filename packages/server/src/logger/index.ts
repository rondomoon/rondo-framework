export * from './SQLLogger'
import loggerFactory from '@rondo.dev/logger'

export {loggerFactory}
export const getLogger = loggerFactory.getLogger
export const apiLogger = getLogger('api')
