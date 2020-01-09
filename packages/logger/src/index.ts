export * from './LoggerFactory'
export * from './Message'
export * from './LogLevel'
export * from './logger'
export * from './LoggerFactory'

import {SimpleLoggerFactory} from './SimpleLoggerFactory'
export default SimpleLoggerFactory.init()

import * as transports from './transports'
export {transports}

import * as formatters from './formatters'
export {formatters}

import * as logger from './logger'
export {logger}
